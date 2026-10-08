import { redisCall, parseRedisValue } from "#helpers";
import { ok } from "neverthrow";
import { SessionRedisSchema } from "../../_persistence/session.redis.js";
import type { Redis } from "ioredis";
import type { HashSessionToken } from "@project/shared";
import type { SessionStore } from "./SessionStore.js";
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

export const sessionKey = (hash: HashSessionToken) => `auth:session:${hash}`;

export const createSessionStore = (redis: Redis): SessionStore => ({
  get: (hash) => {
    const key = sessionKey(hash);
    return redisCall("get", key, () => redis.get(key)).andThen((raw) =>
      raw === null ? ok(null) : parseRedisValue(key, raw, SessionRedisSchema),
    );
  },
  set: (hash, sessionRedis) => {
    const key = sessionKey(hash);
    return redisCall("set", key, () => redis.set(key, JSON.stringify(sessionRedis), "EX", SESSION_TTL_SECONDS)).map(
      () => undefined,
    );
  },
  invalidate: (hash) => {
    const key = sessionKey(hash);
    return redisCall("del", key, () => redis.del(key)).map(() => undefined);
  },
});
