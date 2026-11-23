import type { ResultAsync } from "neverthrow";
import type { RedisStoreError } from "#infrastructure";
import type { MembershipId } from "@project/shared";
import type { MembershipRedis } from "../../_persistence/membership.redis.js";

export type MembershipStore = {
  get(membershipId: MembershipId): ResultAsync<MembershipRedis | null, RedisStoreError>;
  set(membershipId: MembershipId, membershipRedis: MembershipRedis): ResultAsync<void, RedisStoreError>;
  invalidate(membershipId: MembershipId): ResultAsync<void, RedisStoreError>;
};
