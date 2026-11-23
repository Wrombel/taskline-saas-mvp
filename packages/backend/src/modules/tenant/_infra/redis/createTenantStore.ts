import { ok } from "neverthrow";
import type { Redis } from "ioredis";
import type { TenantId } from "@project/shared";
import { redisCall, parseRedisValue } from "#helpers";
import { TenantRedisSchema } from "../../_persistence/tenant.redis.js";
import type { TenantStore } from "./TenantStore.js";

const TENANT_TTL_SECONDS = 5 * 60;

export const tenantKey = (tenantId: TenantId) => `tenant:${tenantId}`;

export const createTenantStore = (redis: Redis): TenantStore => ({
  get: (tenantId) => {
    const key = tenantKey(tenantId);
    return redisCall("get", key, () => redis.get(key)).andThen((raw) =>
      raw === null ? ok(null) : parseRedisValue(key, raw, TenantRedisSchema),
    );
  },
  set: (tenantId, tenantRedis) => {
    const key = tenantKey(tenantId);
    return redisCall("set", key, () => redis.set(key, JSON.stringify(tenantRedis), "EX", TENANT_TTL_SECONDS)).map(
      () => undefined,
    );
  },
  invalidate: (tenantId) => {
    const key = tenantKey(tenantId);
    return redisCall("del", key, () => redis.del(key)).map(() => undefined);
  },
});
