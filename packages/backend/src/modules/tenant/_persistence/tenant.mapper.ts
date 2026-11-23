import { ObjectId } from "mongodb";
import { Result } from "neverthrow";
import { TenantId, TenantSlug } from "@project/shared";
import { createMappingError } from "#infrastructure";
import { TenantDbSchema } from "./tenant.db.js";
import type { Tenant } from "@project/shared";
import type { TenantDb } from "./tenant.db.js";
import type { MappingError } from "#infrastructure";

export const TenantMapper = {
  toDomain(doc: unknown): Result<Tenant, MappingError> {
    const rawId = (doc as { _id?: unknown })?._id?.toString() ?? "unknown";

    return Result.fromThrowable(
      () => {
        const validDoc = TenantDbSchema.parse(doc);
        return {
          id: TenantId(validDoc._id.toString()),
          slug: TenantSlug(validDoc.slug),
          name: validDoc.name,
          memberCount: validDoc.memberCount,
          status: validDoc.status,
          createdAt: validDoc.createdAt,
          updatedAt: validDoc.updatedAt,
        };
      },
      (error) => createMappingError("Tenant", rawId, error),
    )();
  },

  toDocument(domain: Tenant): TenantDb {
    return {
      _id: new ObjectId(domain.id),
      slug: domain.slug,
      name: domain.name,
      memberCount: domain.memberCount,
      status: domain.status,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  },
};
