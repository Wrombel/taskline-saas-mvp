import { ObjectId } from "mongodb";
import { Result } from "neverthrow";
import { MembershipId, TenantId, TeamId, UserId } from "@project/shared";
import { createMappingError } from "#infrastructure";
import { MembershipDbSchema } from "./membership.db.js";
import type { Membership } from "@project/shared";
import type { MembershipDb } from "./membership.db.js";
import type { MappingError } from "#infrastructure";

export const MembershipMapper = {
  toDomain(doc: unknown): Result<Membership, MappingError> {
    const rawId = (doc as { _id?: unknown })?._id?.toString() ?? "unknown";

    return Result.fromThrowable(
      () => {
        const validDoc = MembershipDbSchema.parse(doc);
        return {
          id: MembershipId(validDoc._id.toString()),
          userId: UserId(validDoc.userId.toString()),
          tenantId: TenantId(validDoc.tenantId.toString()),
          tenantRole: validDoc.tenantRole,
          teamAccesses: validDoc.teamAccesses.map(({ teamId, teamRole }) => ({
            teamId: TeamId(teamId.toString()),
            teamRole,
          })),
          status: validDoc.status,
          invitedBy: UserId(validDoc.invitedBy.toString()),
          createdAt: validDoc.createdAt,
          acceptedAt: validDoc.acceptedAt,
          expiresAt: validDoc.expiresAt,
        };
      },
      (error) => createMappingError("Membership", rawId, error),
    )();
  },

  toDocument(domain: Membership): MembershipDb {
    return {
      _id: new ObjectId(domain.id),
      userId: new ObjectId(domain.userId),
      tenantId: new ObjectId(domain.tenantId),
      tenantRole: domain.tenantRole,
      teamAccesses: domain.teamAccesses.map(({ teamId, teamRole }) => ({
        teamId: new ObjectId(teamId),
        teamRole,
      })),
      status: domain.status,
      invitedBy: new ObjectId(domain.invitedBy),
      createdAt: domain.createdAt,
      acceptedAt: domain.acceptedAt,
      expiresAt: domain.expiresAt,
    };
  },
};
