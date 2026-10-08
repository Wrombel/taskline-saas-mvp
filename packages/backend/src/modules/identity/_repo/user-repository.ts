import type { UserDb } from "../_persistence/user.db.js";
import type { User } from "@project/shared";
import type { DatabaseError, MappingError } from "#infrastructure";
import type { ResultAsync } from "neverthrow";
import type { UserAlreadyExistsError } from "../_domain/user/user.errors.js";
import type { ClientSession } from "mongodb";
export type UserRepository = {
  create(user: User, session: ClientSession): ResultAsync<void, UserAlreadyExistsError | DatabaseError>;
  findByEmail(email: string): ResultAsync<User | null, DatabaseError | MappingError>;
  existsByEmail(email: string): ResultAsync<Boolean, DatabaseError>;
};
