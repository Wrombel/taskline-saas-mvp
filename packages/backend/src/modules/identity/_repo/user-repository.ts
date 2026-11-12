import type { ClientSession } from "mongodb";
import type { ResultAsync } from "neverthrow";
import type { GetUserProfile, User, UserId } from "@project/shared";
import type { DatabaseError, MappingError } from "#infrastructure";
import type { UserAlreadyExistsError } from "../_domain/user/user.errors.js";
import type { AuthState } from "../authenticate/auth-state.js";

export type UserRepository = {
  create(user: User, session: ClientSession): ResultAsync<void, UserAlreadyExistsError | DatabaseError>;
  findByEmail(email: string): ResultAsync<User | null, DatabaseError | MappingError>;
  findById(userId: UserId): ResultAsync<User | null, DatabaseError | MappingError>;
  findUserProfileById(userId: UserId): ResultAsync<GetUserProfile | null, DatabaseError | MappingError>;
  existsByEmail(email: string): ResultAsync<Boolean, DatabaseError>;
  findAuthState(userId: UserId): ResultAsync<AuthState | null, DatabaseError | MappingError>;
};
