import { ResultAsync, okAsync } from "neverthrow";
import type { HashSessionToken } from "@project/shared";
import type { RawSessionToken } from "#infrastructure";
import type { Session } from "@project/shared";
import type { AuthContext } from "./auth-context.js";
import type { SessionFactory } from "../_domain/session/session.js";
import type { SessionRepository } from "../_repo/session-repository.js";
import type { UserRepository } from "../_repo/user-repository.js";
import type { SessionStore } from "../_infra/redis/SessionStore.js";
import type { SessionRedis } from "../_persistence/session.redis.js";

type SessionSource = "cache" | "mongo";

type AuthenticateResult = {
  authContext: AuthContext;
};

export type AuthError = { _tag: "AuthenticationUnavailable"; cause: unknown };

type AuthenticatedSession = Pick<Session, "id" | "userId" | "tenantContext" | "version" | "expiresAt" | "maxExpiresAt">;

const toAuthError = (cause: unknown): AuthError => ({
  _tag: "AuthenticationUnavailable",
  cause,
});

const fromCache = (cached: SessionRedis): AuthenticatedSession => ({
  id: cached.sessionId,
  userId: cached.userId,
  tenantContext: cached.tenantContext,
  version: cached.cachedSessionVersion,
  expiresAt: cached.expiresAt,
  maxExpiresAt: cached.maxExpiresAt,
});

const toCache = (session: AuthenticatedSession): SessionRedis => ({
  sessionId: session.id,
  userId: session.userId,
  tenantContext: session.tenantContext,
  cachedSessionVersion: session.version,
  expiresAt: session.expiresAt,
  maxExpiresAt: session.maxExpiresAt,
});

type Dependencies = {
  hashToken: (token: RawSessionToken) => HashSessionToken;
  sessionStore: SessionStore;
  sessionRepository: Pick<SessionRepository, "findActiveByHash" | "slide">;
  userRepository: Pick<UserRepository, "findAuthState">;
  now: () => Date;
  calculateSlidingExpiration: SessionFactory["calculateSlidingExpiration"];
};
export type Authenticate = (rawToken: RawSessionToken) => ResultAsync<AuthenticateResult | null, AuthError>;

export const createAuthenticateSessionUseCase =
  (deps: Dependencies): Authenticate =>
  (rawToken) => {
    const hash = deps.hashToken(rawToken);
    const now = deps.now();
    return deps.sessionStore
      .get(hash)
      .mapErr(toAuthError)
      .andThen((cached) =>
        cached
          ? okAsync({ session: fromCache(cached), source: "cache" as const })
          : deps.sessionRepository
              .findActiveByHash(hash, now)
              .mapErr(toAuthError)
              .andThen((session) => (session ? okAsync({ session, source: "mongo" as const }) : okAsync(null))),
      )
      .andThen((resolved) => {
        if (!resolved) return okAsync(null);

        const { session, source } = resolved;

        // Redis hit też trzeba sprawdzić: jego wpis może być nieaktualny.
        if (session.expiresAt <= now || session.maxExpiresAt <= now) {
          return okAsync(null);
        }

        return deps.userRepository
          .findAuthState(session.userId)
          .mapErr(toAuthError)
          .andThen((user) => {
            if (!user || user.sessionVersion !== session.version || !["active", "unverified"].includes(user.state)) {
              return okAsync(null);
            }

            const nextExpiresAt = deps.calculateSlidingExpiration(session, now);
            const slideAttempted = nextExpiresAt !== null;

            const persistSliding = slideAttempted
              ? deps.sessionRepository
                  .slide(session.id, nextExpiresAt, now)
                  .mapErr(toAuthError)
                  .map(
                    (updated) =>
                      updated
                        ? { current: { ...session, expiresAt: nextExpiresAt }, slid: true }
                        : { current: session, slid: false }, // ktoś był pierwszy albo sesja właśnie wygasła: request był ważny w `now`
                  )
              : okAsync({ current: session, slid: false });

            return persistSliding.andThen(({ current, slid }) => {
              // cache tylko to, co faktycznie jest w Mongo
              const shouldCache = slid || (source === "mongo" && !slideAttempted);
              const writeCache = shouldCache
                ? deps.sessionStore.set(hash, toCache(current)).mapErr(toAuthError)
                : okAsync(undefined);

              return writeCache.map(() => ({
                authContext: { userId: current.userId, sessionId: current.id, tenantContext: current.tenantContext },
              }));
            });
          });
      });
  };
