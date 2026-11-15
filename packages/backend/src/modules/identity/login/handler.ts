import { errAsync, okAsync, type ResultAsync } from "neverthrow";
import { RawSessionToken } from "#infrastructure";
import type { LoginRequestSchema, Email } from "@project/shared";
import type { DatabaseError, MappingError, PasswordVerificationError } from "#infrastructure";
import type { UserNotFoundError } from "../_domain/user/user.errors.js";
import { createUserNotFoundError } from "../_domain/user/user.errors.js";
import type { UserRepository } from "../_repo/user-repository.js";
import type { SessionRepository } from "../_repo/session-repository.js";
import type { PasswordHasher } from "#infrastructure";
import type { SessionFactory } from "../_domain/session/session.js";
import type { SessionStore } from "../_infra/redis/SessionStore.js";
import type { SessionRedis } from "../_persistence/session.redis.js";
import { logger } from "#http";

type Dependencies = {
  userRepository: Pick<UserRepository, "findUserAuthByEmail">;
  sessionRepository: Pick<SessionRepository, "create">;
  passwordHasher: Pick<PasswordHasher, "verify">;
  sessionFactory: SessionFactory;
  sessionStore: SessionStore;
};

export type LoginCommand = Omit<LoginRequestSchema, "email"> & {
  email: Email;
  rawUserAgent: string | null;
  deviceInfo: string;
};

type LoginHandlerError = DatabaseError | MappingError | PasswordVerificationError | UserNotFoundError;

export type LoginHandler = (
  command: LoginCommand,
) => ResultAsync<ReturnType<typeof RawSessionToken>, LoginHandlerError>;

export const createLoginHandler =
  ({ userRepository, sessionRepository, passwordHasher, sessionFactory, sessionStore }: Dependencies): LoginHandler =>
  ({ email, password, rawUserAgent, deviceInfo }) =>
    userRepository.findUserAuthByEmail(email).andThen((userAuth) => {
      if (!userAuth) return errAsync(createUserNotFoundError(email));

      return passwordHasher.verify(password, userAuth.hashedPassword).andThen((isPasswordValid) => {
        if (!isPasswordValid) return errAsync(createUserNotFoundError(email));

        const { rawToken, session } = sessionFactory.prepareSession(
          userAuth.id,
          rawUserAgent,
          deviceInfo,
          userAuth.sessionVersion,
        );
        const cacheEntry: SessionRedis = {
          sessionId: session.id,
          userId: session.userId,
          tenantContext: session.tenantContext,
          cachedSessionVersion: userAuth.sessionVersion,
          expiresAt: session.expiresAt,
          maxExpiresAt: session.maxExpiresAt,
        };

        return sessionRepository.create(session).andThen(() =>
          sessionStore
            .set(session.sessionHash, cacheEntry)
            .orElse((error) => {
              logger.warn(
                { err: error, sessionHash: session.sessionHash },
                "Failed to write session cache; continuing",
              );
              return okAsync(undefined);
            })
            .map(() => RawSessionToken(rawToken)),
        );
      });
    });
