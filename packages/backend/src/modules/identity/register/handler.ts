import { ok, err, errAsync, ResultAsync } from "neverthrow";
import { generateId } from "#infrastructure";
import { createUserAlreadyExistsError } from "../_domain/user/user.errors.js";
import { createDatabaseError } from "#infrastructure";
import { createUser } from "../_domain/user/user.js";
import type { MongoClient } from "mongodb";
import type { RegisterRequestSchema } from "@project/shared";
import type { DatabaseError, MappingError } from "#infrastructure";
import type { UserAlreadyExistsError } from "../_domain/user/user.errors.js";
import type { UserRepository } from "../_repo/user-repository.js";
import type { SessionRepository } from "../_repo/session-repository.js";
import type { PasswordHasher } from "#infrastructure";
import type { PasswordHashingError } from "#infrastructure";
import type { RunTransaction } from "#infrastructure";
import { logger } from "#http";

type Dependencies = {
  userRepository: UserRepository;
  sessionRepository: SessionRepository;
  runTransaction: RunTransaction;
  passwordHasher: PasswordHasher;
};
type HandlerErrors = UserAlreadyExistsError | DatabaseError | PasswordHashingError | MappingError;
export type RegisterHandler = (command: RegisterRequestSchema) => ResultAsync<void, HandlerErrors>;

export const createRegisterHandler = ({
  userRepository,
  sessionRepository,
  runTransaction,
  passwordHasher,
}: Dependencies): RegisterHandler => {
  return ({ password, ...data }) => {
    return userRepository
      .existsByEmail(data.email)
      .andThen((existingUser) => {
        if (existingUser) {
          return errAsync(createUserAlreadyExistsError(data.email));
        }
        return passwordHasher.hash(password);
      })
      .andThen((hashedPassword) => {
        const stringId = generateId.user();
        const newUser = createUser(data, stringId, hashedPassword);
        return userRepository.create(newUser);
      });
  };
};
