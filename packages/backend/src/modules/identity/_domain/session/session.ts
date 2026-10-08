import type { HashSessionToken } from "@project/shared";
import type { RawSessionToken } from "#infrastructure";
import type { AppConfig } from "#config";
import type { Session } from "@project/shared";
import type { UserId, SessionId } from "@project/shared";

export type SessionFactory = {
  prepareSession(userId: UserId, userAgent: string | null, deviceInfo: string): { rawToken: string; session: Session };
};

export const makePrepareSession = (
  config: AppConfig["session"],
  userId: UserId,

  userAgent: string | null,
  deviceInfo: string,
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
    prepareSession: (userId, userAgent, deviceInfo) =>
      makePrepareSession(config, userId, userAgent, deviceInfo, generateSessionId, generateRawToken, generateHashToken),
  };
};
