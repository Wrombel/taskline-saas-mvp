import { Result, ResultAsync, err, ok } from "neverthrow";
import type { ZodType } from "zod";
import type { RedisError, RedisValueError } from "#infrastructure";

export const redisCall = <T>(operation: string, key: string, call: () => Promise<T>): ResultAsync<T, RedisError> =>
  ResultAsync.fromPromise(
    Promise.resolve().then(call),
    (cause): RedisError => ({
      type: "REDIS_ERROR",
      operation,
      key,
      cause,
    }),
  );

const safeJsonParse = Result.fromThrowable(
  (raw: string): unknown => JSON.parse(raw),
  (cause) => cause,
);

export const parseRedisValue = <T>(key: string, raw: string, schema: ZodType<T>): Result<T, RedisValueError> =>
  safeJsonParse(raw)
    .andThen((value) => {
      const result = schema.safeParse(value);

      return result.success ? ok(result.data) : err(result.error);
    })
    .mapErr(
      (cause): RedisValueError => ({
        type: "REDIS_VALUE_INVALID",
        key,
        cause,
      }),
    );
