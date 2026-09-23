import argon2 from "@node-rs/argon2";
import { ResultAsync } from "neverthrow";
import type { HashedPassword } from "@project/shared";

export type PasswordHashingError = {
  readonly _tag: "PasswordHashingError";
  readonly cause: unknown;
  readonly message: string;
};
export type PasswordVerificationError = {
  readonly _tag: "PasswordVerificationError";
  readonly message: string;
  readonly cause: unknown;
};

export const createPasswordHashingError = (cause?: unknown): PasswordHashingError => ({
  _tag: "PasswordHashingError",
  message: "Failed to hash password due to a system error.",
  cause,
});

export const createPasswordVerificationError = (cause?: unknown): PasswordVerificationError => ({
  _tag: "PasswordVerificationError",
  message: "Argon2 verification failed due to internal environment or format error.",
  cause,
});

export const createArgon2PasswordHasher = () => {
  return {
    hash(password: string): ResultAsync<string, PasswordHashingError> {
      return ResultAsync.fromPromise(argon2.hash(password), (error) => createPasswordHashingError(error));
    },
    verify(password: string, hash: string): ResultAsync<boolean, PasswordVerificationError> {
      return ResultAsync.fromPromise(argon2.verify(hash, password), (error) => createPasswordVerificationError(error));
    },
  };
};

export type PasswordHasher = ReturnType<typeof createArgon2PasswordHasher>;
