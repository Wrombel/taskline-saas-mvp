import { ResultAsync, errAsync, okAsync } from "neverthrow";
import type { GetUserProfile, UserId } from "@project/shared";
import type { DatabaseError, MappingError } from "#infrastructure";
import { createUserNotFoundError } from "../_domain/user/user.errors.js";
import type { UserNotFoundError } from "../_domain/user/user.errors.js";
import type { UserRepository } from "../_repo/user-repository.js";

type Dependencies = {
  userRepository: Pick<UserRepository, "findUserProfileById">;
};

export type GetUserHandler = (
  userId: UserId,
) => ResultAsync<GetUserProfile, DatabaseError | MappingError | UserNotFoundError>;

export const createGetUserProfileHandler =
  ({ userRepository }: Dependencies): GetUserHandler =>
  (userId) =>
    userRepository
      .findUserProfileById(userId)
      .andThen((profile) => (profile ? okAsync(profile) : errAsync(createUserNotFoundError(userId))));
