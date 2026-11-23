import type { ClientSession } from "mongodb";
import type { ResultAsync } from "neverthrow";
import type { Email, GetUserProfile, User, UserId } from "@project/shared";
import type { DatabaseError, MappingError } from "#infrastructure";
import type { UserAlreadyExistsError } from "../_domain/user/user.errors.js";
import type { AuthState } from "../authenticate/auth-state.js";
import type { UserAuth } from "../login/user-auth.js";

export type UserRepository = {
  create(user: User, session: ClientSession): ResultAsync<void, UserAlreadyExistsError | DatabaseError>;
  reserveOwnedTenantSlot(
    userId: UserId,
    limits: { unverified: number; active: number },
    session: ClientSession,
  ): ResultAsync<boolean, DatabaseError>;
  findByEmail(email: string): ResultAsync<User | null, DatabaseError | MappingError>;
  findById(userId: UserId): ResultAsync<User | null, DatabaseError | MappingError>;
  findUserProfileById(userId: UserId): ResultAsync<GetUserProfile | null, DatabaseError | MappingError>;
  findUserAuthByEmail(email: Email): ResultAsync<UserAuth | null, DatabaseError | MappingError>;
  existsByEmail(email: string): ResultAsync<Boolean, DatabaseError>;
  findAuthState(userId: UserId): ResultAsync<AuthState | null, DatabaseError | MappingError>;
};
