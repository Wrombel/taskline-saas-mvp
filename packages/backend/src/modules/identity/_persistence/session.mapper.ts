import { ObjectId } from "mongodb";
import { SessionDbSchema } from "./session.db.js";
import { createMappingError } from "#infrastructure";
import { Result } from "neverthrow";
import { UserId, SessionId, TenantId, TeamId } from "@project/shared";
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
          tenantContext: validDoc.tenantContext
            ? {
                tenantId: TenantId(validDoc.tenantContext.tenantId.toString()),
                tenantRole: validDoc.tenantContext.tenantRole,
                teamAccesses: validDoc.tenantContext.teamAccesses.map((t) => ({
                  teamId: TeamId(t.teamId.toString()),
                  teamRole: t.teamRole,
                })),
              }
            : null,
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
      tenantContext: domain.tenantContext
        ? {
            tenantId: new ObjectId(domain.tenantContext.tenantId),
            tenantRole: domain.tenantContext.tenantRole,
            teamAccesses: domain.tenantContext.teamAccesses.map((t) => ({
              teamId: new ObjectId(t.teamId),
              teamRole: t.teamRole,
            })),
          }
        : null,
      createdAt: domain.createdAt,
      expiresAt: domain.expiresAt,
      maxExpiresAt: domain.maxExpiresAt,
    };
  },
};
