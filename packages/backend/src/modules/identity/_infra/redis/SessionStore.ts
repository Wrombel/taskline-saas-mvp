import { ResultAsync } from "neverthrow";
import type { RedisStoreError } from "#infrastructure";
import type { HashSessionToken } from "@project/shared";
import type { SessionRedis } from "../../_persistence/session.redis.js";
export type SessionStore = {
  get(hash: HashSessionToken): ResultAsync<SessionRedis | null, RedisStoreError>;
  set(hash: HashSessionToken, sessionRedis: SessionRedis): ResultAsync<void, RedisStoreError>;
  invalidate(hash: HashSessionToken): ResultAsync<void, RedisStoreError>;
};
