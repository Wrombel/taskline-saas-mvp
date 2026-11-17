import { okAsync, type ResultAsync } from "neverthrow";
import type { HashSessionToken } from "@project/shared";
import type { DatabaseError, RawSessionToken } from "#infrastructure";
import type { SessionRepository } from "../_repo/session-repository.js";
import type { SessionStore } from "../_infra/redis/SessionStore.js";
import { logger } from "#http";

type Dependencies = {
  hashToken: (token: RawSessionToken) => HashSessionToken;
  sessionRepository: Pick<SessionRepository, "revoke">;
  sessionStore: Pick<SessionStore, "invalidate">;
};

export type LogoutHandler = (rawToken: RawSessionToken) => ResultAsync<void, DatabaseError>;

export const createLogoutHandler = ({
  hashToken,
  sessionRepository,
  sessionStore,
}: Dependencies): LogoutHandler =>
  (rawToken) => {
    const sessionHash = hashToken(rawToken);

    return sessionRepository.revoke(sessionHash).andThen(() =>
      sessionStore.invalidate(sessionHash).orElse((error) => {
        logger.warn({ err: error, sessionHash }, "Failed to invalidate session cache; continuing");
        return okAsync(undefined);
      }),
    );
  };
