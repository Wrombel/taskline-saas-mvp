import type { ResultAsync } from "neverthrow";
import type { RedisStoreError } from "#infrastructure";
import type { TenantId } from "@project/shared";
import type { TenantRedis } from "../../_persistence/tenant.redis.js";

export type TenantStore = {
  get(tenantId: TenantId): ResultAsync<TenantRedis | null, RedisStoreError>;
  set(tenantId: TenantId, tenantRedis: TenantRedis): ResultAsync<void, RedisStoreError>;
  invalidate(tenantId: TenantId): ResultAsync<void, RedisStoreError>;
};
