import { ok } from "neverthrow";
import type { Redis } from "ioredis";
import type { MembershipId } from "@project/shared";
import { redisCall, parseRedisValue } from "#helpers";
import { MembershipRedisSchema } from "../../_persistence/membership.redis.js";
import type { MembershipStore } from "./MembershipStore.js";

const MEMBERSHIP_TTL_SECONDS = 15 * 60;

export const membershipKey = (membershipId: MembershipId) => `membership:${membershipId}`;

export const createMembershipStore = (redis: Redis): MembershipStore => ({
  get: (membershipId) => {
    const key = membershipKey(membershipId);
    return redisCall("get", key, () => redis.get(key)).andThen((raw) =>
      raw === null ? ok(null) : parseRedisValue(key, raw, MembershipRedisSchema),
    );
  },
  set: (membershipId, membershipRedis) => {
    const key = membershipKey(membershipId);
    return redisCall("set", key, () =>
      redis.set(key, JSON.stringify(membershipRedis), "EX", MEMBERSHIP_TTL_SECONDS),
    ).map(() => undefined);
  },
  invalidate: (membershipId) => {
    const key = membershipKey(membershipId);
    return redisCall("del", key, () => redis.del(key)).map(() => undefined);
  },
});
