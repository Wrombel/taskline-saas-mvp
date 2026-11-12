import type { HashSessionToken } from "@project/shared";
import type { RawSessionToken } from "#infrastructure";
import type { AppConfig } from "#config";
import type { Session } from "@project/shared";
import type { UserId, SessionId } from "@project/shared";
import type { SessionVersion } from "@project/shared";

const SLIDING_REFRESH_THRESHOLD = 0.1;

export type SessionFactory = {
  prepareSession(
    userId: UserId,
    userAgent: string | null,
    deviceInfo: string,
    sessionVersion: SessionVersion,
  ): { rawToken: string; session: Session };
  calculateSlidingExpiration(
    session: Pick<Session, "expiresAt" | "maxExpiresAt">,
    now?: Date,
  ): Date | null;
};

export const makeCalculateSlidingExpiration = (
  slidingWindowHours: number,
  session: Pick<Session, "expiresAt" | "maxExpiresAt">,
  now = new Date(),
): Date | null => {
  const slidingWindowMs = slidingWindowHours * 60 * 60 * 1000;
  const remainingMs = session.expiresAt.getTime() - now.getTime();
  const elapsedMs = slidingWindowMs - remainingMs;

  if (remainingMs <= 0 || session.maxExpiresAt.getTime() <= now.getTime()) return null;
  if (elapsedMs < slidingWindowMs * SLIDING_REFRESH_THRESHOLD) return null;

  const nextExpiresAtMs = Math.min(now.getTime() + slidingWindowMs, session.maxExpiresAt.getTime());
  if (nextExpiresAtMs <= session.expiresAt.getTime()) return null;

  return new Date(nextExpiresAtMs);
};

export const makePrepareSession = (
  config: AppConfig["session"],
  userId: UserId,
  userAgent: string | null,
  deviceInfo: string,
  sessionVersion: SessionVersion,
  generateSessionId: () => SessionId,
  generateRawToken: () => RawSessionToken,
  generateHashToken: (token: RawSessionToken) => HashSessionToken,
): { rawToken: string; session: Session } => {
  const SLIDING_MS = config.slidingWindowHours * 60 * 60 * 1000;
  const MAX_AGE_MS = config.maxAgeDays * 24 * 60 * 60 * 1000;
  const sessionId = generateSessionId();
  const rawToken = generateRawToken();
  const tokenHash = generateHashToken(rawToken);
  const now = new Date();
  return {
    rawToken,
    session: {
      id: sessionId,
      userId: userId,
      sessionHash: tokenHash,
      rawUserAgent: userAgent,
      deviceInfo: deviceInfo,
      tenantContext: null,
      version: sessionVersion,
      createdAt: now,
      expiresAt: new Date(now.getTime() + SLIDING_MS),
      maxExpiresAt: new Date(now.getTime() + MAX_AGE_MS),
    },
  };
};

export const createSessionFactory = (
  config: AppConfig["session"],
  generateSessionId: () => SessionId,
  generateRawToken: () => RawSessionToken,
  generateHashToken: (token: RawSessionToken) => HashSessionToken,
): SessionFactory => {
  return {
    prepareSession: (userId, userAgent, deviceInfo, sessionVersion) =>
      makePrepareSession(
        config,
        userId,
        userAgent,
        deviceInfo,
        sessionVersion,
        generateSessionId,
        generateRawToken,
        generateHashToken,
      ),
    calculateSlidingExpiration: (session, now) =>
      makeCalculateSlidingExpiration(config.slidingWindowHours, session, now),
  };
};
