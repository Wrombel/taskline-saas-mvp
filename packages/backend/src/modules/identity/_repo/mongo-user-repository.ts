import { Result, ResultAsync, err, ok } from "neverthrow";
import { Collection, MongoServerError, ObjectId } from "mongodb";
import { createUserAlreadyExistsError } from "../_domain/user/user.errors.js";
import { createDatabaseError, createMappingError } from "#infrastructure";
import { logger } from "#http";
import { UserMapper } from "../_persistence/user.mapper.js";
import { AuthStateSchema } from "../authenticate/auth-state.js";
import { GetUserProfileSchema } from "@project/shared";
import { USER_STATUS } from "@project/shared";
import { UserAuthSchema } from "../login/user-auth.js";
import type { ClientSession } from "mongodb";
import type { UserDb } from "../_persistence/user.db.js";
import type { User, Email } from "@project/shared";
import type { UserId } from "@project/shared";
import type { AuthState } from "../authenticate/auth-state.js";
import type { UserRepository } from "./user-repository.js";
import type { DatabaseError, MappingError } from "#infrastructure";
import type { UserAlreadyExistsError } from "../_domain/user/user.errors.js";
import type { GetUserProfile } from "@project/shared";
import type { UserAuth } from "../login/user-auth.js";
type Dependencies = {
  usersCollection: Collection<UserDb>;
};

export const findAuthStateById = (
  collection: Collection<UserDb>,
  userId: UserId,
): ResultAsync<AuthState | null, DatabaseError | MappingError> =>
  ResultAsync.fromPromise(
    collection.findOne({ _id: new ObjectId(userId) }, { projection: { _id: 0, state: 1, sessionVersion: 1 } }),
    createDatabaseError,
  ).andThen((userDb) => {
    if (!userDb) return ok(null);

    return Result.fromThrowable(
      () => {
        const authState = AuthStateSchema.parse(userDb);
        return {
          state: authState.state,
          sessionVersion: authState.sessionVersion,
        };
      },
      (error) => createMappingError("UserAuthState", userId, error),
    )();
  });

export const userExistsByEmail = (
  collection: Collection<UserDb>,
  email: string,
): ResultAsync<boolean, DatabaseError> => {
  return ResultAsync.fromPromise(collection.findOne({ email }, { projection: { _id: 1 } }), (e: unknown) => {
    return createDatabaseError(e);
  }).map((userDb) => !!userDb);
};

export const findUserByEmail = (
  collection: Collection<UserDb>,
  email: string,
): ResultAsync<User | null, DatabaseError | MappingError> => {
  return ResultAsync.fromPromise(collection.findOne({ email }), (e: unknown) => {
    return createDatabaseError(e);
  }).andThen((userDb) => {
    if (!userDb) {
      return ok(null);
    }
    return UserMapper.toDomain(userDb);
  });
};

export const findUserById = (
  collection: Collection<UserDb>,
  userId: UserId,
): ResultAsync<User | null, DatabaseError | MappingError> =>
  ResultAsync.fromPromise(collection.findOne({ _id: new ObjectId(userId) }), createDatabaseError).andThen((userDb) => {
    if (!userDb) return ok(null);
    return UserMapper.toDomain(userDb);
  });

export const findUserProfileById = (
  collection: Collection<UserDb>,
  userId: UserId,
): ResultAsync<GetUserProfile | null, DatabaseError | MappingError> =>
  ResultAsync.fromPromise(
    collection.findOne({ _id: new ObjectId(userId) }, { projection: { email: 1, fullName: 1 } }),
    createDatabaseError,
  ).andThen((userDb) => {
    if (!userDb) return ok(null);

    const profile = GetUserProfileSchema.safeParse({
      id: userDb._id.toString(),
      email: userDb.email,
      firstName: userDb.fullName.firstName,
      lastName: userDb.fullName.lastName,
    });

    return profile.success ? ok(profile.data) : err(createMappingError("UserProfile", userId, profile.error));
  });

export const findUserAuthByEmail = (
  collection: Collection<UserDb>,
  email: Email,
): ResultAsync<UserAuth | null, DatabaseError | MappingError> =>
  ResultAsync.fromPromise(
    collection.findOne(
      { email, state: { $ne: "deactivated" } },
      { projection: { _id: 1, email: 1, hashedPassword: 1, state: 1, sessionVersion: 1 } },
    ),
    createDatabaseError,
  ).andThen((userDb) => {
    if (!userDb) return ok(null);

    const userAuth = UserAuthSchema.safeParse({
      id: userDb._id.toString(),
      email: userDb.email,
      hashedPassword: userDb.hashedPassword,
      state: userDb.state,
      sessionVersion: userDb.sessionVersion,
    });

    return userAuth.success ? ok(userAuth.data) : err(createMappingError("UserAuth", email, userAuth.error));
  });

export const saveUser = (
  collection: Collection<UserDb>,
  user: User,
  mongoSession: ClientSession,
): ResultAsync<void, DatabaseError | UserAlreadyExistsError> => {
  const userDb: UserDb = UserMapper.toDocument(user);
  return ResultAsync.fromPromise(collection.insertOne(userDb, { session: mongoSession }), (e: unknown) => {
    if (e instanceof MongoServerError && e.code === 11000) {
      return createUserAlreadyExistsError(user.email);
    }
    return createDatabaseError(e);
  }).map(() => undefined);
};

export const reserveOwnedTenantSlot = (
  collection: Collection<UserDb>,
  userId: UserId,
  limits: { unverified: number; active: number },
  session: ClientSession,
): ResultAsync<boolean, DatabaseError> =>
  ResultAsync.fromPromise(
    collection.updateOne(
      {
        _id: new ObjectId(userId),
        $or: [
          { state: USER_STATUS.UNVERIFIED, ownedTenantCount: { $lt: limits.unverified } },
          { state: USER_STATUS.ACTIVE, ownedTenantCount: { $lt: limits.active } },
        ],
      },
      { $inc: { ownedTenantCount: 1 } },
      { session },
    ),
    createDatabaseError,
  ).map((result) => result.modifiedCount === 1);

export const createUserRepository = ({ usersCollection }: Dependencies): UserRepository => {
  return {
    create: (user, mongoSession) => saveUser(usersCollection, user, mongoSession),
    reserveOwnedTenantSlot: (userId, limits, session) =>
      reserveOwnedTenantSlot(usersCollection, userId, limits, session),
    findByEmail: (email) => findUserByEmail(usersCollection, email),
    findById: (userId) => findUserById(usersCollection, userId),
    findUserProfileById: (userId) => findUserProfileById(usersCollection, userId),
    findUserAuthByEmail: (email) => findUserAuthByEmail(usersCollection, email),
    existsByEmail: (email) => userExistsByEmail(usersCollection, email),
    findAuthState: (userId) => findAuthStateById(usersCollection, userId),
  };
};
