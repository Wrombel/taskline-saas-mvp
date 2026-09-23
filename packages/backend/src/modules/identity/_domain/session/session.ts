import type { AppConfig } from "#config";
import type { Session } from "@project/shared";
import type { UserId, SessionId } from "@project/shared";
import crypto from "node:crypto";
type SessionDomain = {
  prepareSession(
    userId: UserId,
    sessionId: SessionId,
    tenantContext: null | Session["tenantContext"],
  ): { rawToken: string; session: Session };
};

export const makePrepareSession = (
  config: AppConfig["session"],
  userId: UserId,
  sessionId: SessionId,
  tenantContext: null | Session["tenantContext"],
): { rawToken: string; session: Session } => {
  const SLIDING_MS = config.slidingWindowHours * 60 * 60 * 1000;
  const MAX_AGE_MS = config.maxAgeDays * 24 * 60 * 60 * 1000;
  const THROTTLE_THRESHOLD_MS = SLIDING_MS * 0.1; // Throttling: 10% okienka

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const now = new Date();

  return {
    rawToken,
    session: {
      id: sessionId,
      userId: userId,
      tokenHash,
      tenantContext: tenantContext,
      createdAt: now,
      expiresAt: new Date(now.getTime() + config.slidingWindowHours * 3600000),
      maxExpiresAt: new Date(now.getTime() + config.maxAgeDays * 86400000),
    },
  };
};

// export const makeValidateSliding =
//   (config: SessionConfig) =>
//   (session: SessionEntity, now: Date): SlidingDecision => {
//     const isMaxExpired = now > session.maxExpiresAt;
//     const isSlidingExpired = now > session.expiresAt;

//     if (isMaxExpired || isSlidingExpired) {
//       return { status: "EXPIRED" };
//     }

//     const timeSinceLastRefresh =
//       now.getTime() - session.lastRefreshedAt.getTime();
//     const throttleThresholdMs = config.slidingWindowHours * 3600000 * 0.1;

//     if (timeSinceLastRefresh > throttleThresholdMs) {
//       const nextExpiresAt = new Date(
//         now.getTime() + config.slidingWindowHours * 3600000,
//       );
//       const actualExpiresAt =
//         nextExpiresAt > session.maxExpiresAt
//           ? session.maxExpiresAt
//           : nextExpiresAt;
//       return { status: "NEEDS_REFRESH", newExpiresAt: actualExpiresAt };
//     }

//     return { status: "VALID" };
//   };

type Dependencies = {
  config: AppConfig["session"];
};
export const createSessionDomain = (
  config: AppConfig["session"],
): SessionDomain => {
  return {
    prepareSession: (userId, sessionId, tenantContext) =>
      makePrepareSession(config, userId, sessionId, tenantContext),
    //validateSliding: (data) => makeValidateSliding(config, data),
    //attachTenantContext
  };
};
