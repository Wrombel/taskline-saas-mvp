import { ResultAsync } from "neverthrow";
import type { Collection } from "mongodb";
import { createDatabaseError } from "#infrastructure";
import type { DatabaseError } from "#infrastructure";
import { TenantMapper } from "../_persistence/tenant.mapper.js";
import type { Tenant, TenantSlug } from "@project/shared";
import type { TenantDb } from "../_persistence/tenant.db.js";
import type { TenantRepository } from "./tenant-repository.js";

type Dependencies = {
  tenantsCollection: Collection<TenantDb>;
};

export const tenantExistsBySlug = (
  collection: Collection<TenantDb>,
  slug: TenantSlug,
): ResultAsync<boolean, DatabaseError> =>
  ResultAsync.fromPromise(collection.findOne({ slug }, { projection: { _id: 1 } }), createDatabaseError).map(
    (tenantDb) => !!tenantDb,
  );

export const createTenantRepository = ({ tenantsCollection }: Dependencies): TenantRepository => ({
  createTenant: (tenant: Tenant) => {
    const tenantDb: TenantDb = TenantMapper.toDocument(tenant);
    return ResultAsync.fromPromise(tenantsCollection.insertOne(tenantDb), createDatabaseError).map(() => undefined);
  },
  existsBySlug: (slug) => tenantExistsBySlug(tenantsCollection, slug),
});
