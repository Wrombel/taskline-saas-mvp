import type { UserDb } from "../_persistence/user.db.js";

export type UserRepository = {
  create(user: UserDb): Promise<void>;
  findByEmail(email: string): Promise<UserDb | null>;
};

// interface UserRepository {
// findById(userId: string, session?): Promise<User | null>
// findByEmail(email: string, session?): Promise<User | null>

// create(user: User, session): Promise<void>

// updateEmail(userId: string, newEmail: string, version: number, session): Promise<void>

// incrementOwnershipCount(userId: string, session): Promise<void>
// decrementOwnershipCount(userId: string, session): Promise<void>

// incrementMembershipCount(userId: string, session): Promise<void>
// decrementMembershipCount(userId: string, session): Promise<void>

// deactivate(userId: string, version: number, session): Promise<void>
// }
