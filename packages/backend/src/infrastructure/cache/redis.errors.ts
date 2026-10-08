export type RedisError = {
  type: "REDIS_ERROR";
  operation: string;
  key: string;
  cause: unknown;
};

export type RedisValueError = {
  type: "REDIS_VALUE_INVALID";
  key: string;
  cause: unknown;
};

export type RedisStoreError = RedisError | RedisValueError;
