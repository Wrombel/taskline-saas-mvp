import { ResultAsync, errAsync, okAsync, ok, err } from "neverthrow";
import { Collection, MongoServerError } from "mongodb";
import { createUserAlreadyExistsError } from "../_domain/user/user.errors.js";
import { createDatabaseError } from "#infrastructure";
import { logger } from "#http";
import { UserMapper } from "../_persistence/user.mapper.js";
import type { UserDb } from "../_persistence/user.db.js";
import type { User } from "@project/shared";
import type { UserRepository } from "./user-repository.js";
import type { DatabaseError, MappingError } from "#infrastructure";
import type { UserAlreadyExistsError } from "../_domain/user/user.errors.js";
type Dependencies = {
  usersCollection: Collection<UserDb>;
};

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

export const saveUser = (
  collection: Collection<UserDb>,
  user: User,
): ResultAsync<void, DatabaseError | UserAlreadyExistsError> => {
  const userDb: UserDb = UserMapper.toDocument(user);
  return ResultAsync.fromPromise(collection.insertOne(userDb), (e: unknown) => {
    if (e instanceof MongoServerError && e.code === 11000) {
      return createUserAlreadyExistsError(user.email);
    }
    return createDatabaseError(e);
  }).map(() => undefined);
};

export const createUserRepository = ({ usersCollection }: Dependencies): UserRepository => {
  return {
    create: (user) => saveUser(usersCollection, user),
    findByEmail: (email) => findUserByEmail(usersCollection, email),
    existsByEmail: (email) => userExistsByEmail(usersCollection, email),
  };
};
