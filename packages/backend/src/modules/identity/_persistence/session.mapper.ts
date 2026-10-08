import { ObjectId } from "mongodb";
import { SessionDbSchema } from "./session.db.js";
import { createMappingError } from "#infrastructure";
import { Result } from "neverthrow";
import { UserId, SessionId, MembershipId, TenantId, TeamId, HashSessionToken } from "@project/shared";
import type { SessionDb } from "./session.db.js";
import type { Session } from "@project/shared";
import type { MappingError } from "#infrastructure";

export const SessionMapper = {
  toDomain(doc: unknown): Result<Session, MappingError> {
    const rawId = (doc as { _id?: unknown })?._id?.toString() ?? "unknown";
    return Result.fromThrowable(
      () => {
        const validDoc = SessionDbSchema.parse(doc);
        return {
          id: SessionId(validDoc._id.toString()),
          userId: UserId(validDoc.userId.toString()),
          sessionHash: HashSessionToken(validDoc.sessionHash),
          rawUserAgent: validDoc.rawUserAgent,
          deviceInfo: validDoc.deviceInfo,
          tenantContext: validDoc.tenantContext
            ? MembershipId(validDoc.tenantContext.toString())
            : validDoc.tenantContext,
          createdAt: validDoc.createdAt,
          expiresAt: validDoc.expiresAt,
          maxExpiresAt: validDoc.maxExpiresAt,
        };
      },
      (error) => createMappingError("Session", rawId, error),
    )();
  },

  toDocument(domain: Session): SessionDb {
    return {
      _id: new ObjectId(domain.id),
      userId: new ObjectId(domain.userId),
      sessionHash: domain.sessionHash,
      rawUserAgent: domain.rawUserAgent,
      deviceInfo: domain.deviceInfo,
      tenantContext: domain.tenantContext ? new ObjectId(domain.tenantContext) : null,
      createdAt: domain.createdAt,
      expiresAt: domain.expiresAt,
      maxExpiresAt: domain.maxExpiresAt,
    };
  },
};
