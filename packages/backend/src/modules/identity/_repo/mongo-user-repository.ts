import { Result, ResultAsync, err, ok } from "neverthrow";
import { Collection, MongoServerError, ObjectId } from "mongodb";
import { createUserAlreadyExistsError } from "../_domain/user/user.errors.js";
import { createDatabaseError, createMappingError } from "#infrastructure";
import { logger } from "#http";
import { UserMapper } from "../_persistence/user.mapper.js";
import { AuthStateSchema } from "../authenticate/auth-state.js";
import { GetUserProfileSchema } from "@project/shared";
import type { ClientSession } from "mongodb";
import type { UserDb } from "../_persistence/user.db.js";
import type { User } from "@project/shared";
import type { UserId } from "@project/shared";
import type { AuthState } from "../authenticate/auth-state.js";
import type { UserRepository } from "./user-repository.js";
import type { DatabaseError, MappingError } from "#infrastructure";
import type { UserAlreadyExistsError } from "../_domain/user/user.errors.js";
import type { GetUserProfile } from "@project/shared";
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

export const createUserRepository = ({ usersCollection }: Dependencies): UserRepository => {
  return {
    create: (user, mongoSession) => saveUser(usersCollection, user, mongoSession),
    findByEmail: (email) => findUserByEmail(usersCollection, email),
    findById: (userId) => findUserById(usersCollection, userId),
    findUserProfileById: (userId) => findUserProfileById(usersCollection, userId),
    existsByEmail: (email) => userExistsByEmail(usersCollection, email),
    findAuthState: (userId) => findAuthStateById(usersCollection, userId),
  };
};
