import type { ResultAsync } from "neverthrow";
import type { Tenant, TenantSlug } from "@project/shared";
import type { DatabaseError } from "#infrastructure";

export type TenantRepository = {
  createTenant(tenant: Tenant): ResultAsync<void, DatabaseError>;
  existsBySlug(slug: TenantSlug): ResultAsync<boolean, DatabaseError>;
};
