import { ok, err, errAsync, ResultAsync } from "neverthrow";
import { createUserAlreadyExistsError } from "../_domain/user/user.errors.js";
import type { MongoClient } from "mongodb";
import type { RegisterRequestSchema } from "@project/shared";
import type { Email } from "@project/shared";
import type { DatabaseError, MappingError } from "#infrastructure";
import type { UserAlreadyExistsError } from "../_domain/user/user.errors.js";
import type { UserRepository } from "../_repo/user-repository.js";
import type { SessionRepository } from "../_repo/session-repository.js";
import type { PasswordHasher } from "#infrastructure";
import type { PasswordHashingError } from "#infrastructure";
import type { RunTransaction } from "#infrastructure";
import type { UserId, SessionId } from "@project/shared";
import type { SessionFactory } from "../_domain/session/session.js";
import type { UserFactory } from "../_domain/user/user.js";
import type { SessionStore } from "../_infra/redis/SessionStore.js";
import { logger } from "#http";

type Dependencies = {
  userRepository: UserRepository;
  sessionRepository: SessionRepository;
  runTransaction: RunTransaction;
  passwordHasher: PasswordHasher;
  sessionFactory: SessionFactory;
  userFactory: UserFactory;
  sessionStore: SessionStore;
};
type HandlerErrors = UserAlreadyExistsError | DatabaseError | PasswordHashingError | MappingError;
export type RegisterCommand = Omit<RegisterRequestSchema, "email"> & {
  email: Email;
  rawUserAgent: string | null;
  deviceInfo: string;
};
export type RegisterHandler = (command: RegisterCommand) => ResultAsync<void, HandlerErrors>;

export const createRegisterHandler = ({
  userRepository,
  sessionRepository,
  runTransaction,
  passwordHasher,
  sessionFactory,
  userFactory,
  sessionStore,
}: Dependencies): RegisterHandler => {
  return ({ password, rawUserAgent, deviceInfo, email, ...personalInfo }) => {
    return userRepository
      .existsByEmail(email)
      .andThen((existingUser) => {
        if (existingUser) {
          return errAsync(createUserAlreadyExistsError(email));
        }
        return passwordHasher.hash(password);
      })
      .andThen((hashedPassword) => {
        const { rawProfileToken, user } = userFactory.prepareUser(personalInfo, hashedPassword, email);
        const { rawToken, session } = sessionFactory.prepareSession(user.id, rawUserAgent, deviceInfo);
        return runTransaction((mongoSession) => {
          return userRepository
            .create(user, mongoSession)
            .andThen(() => sessionRepository.create(session, mongoSession));
        });
      });
  };
};
