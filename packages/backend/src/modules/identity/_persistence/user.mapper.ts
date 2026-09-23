import { UserDbSchema } from "./user.db.js";
import { ObjectId } from "mongodb";
import { Result, ok, err } from "neverthrow";
import { createMappingError } from "#infrastructure";
import { UserId } from "@project/shared";
import { Email, HashedPassword } from "@project/shared";
import { HashResetPasswordToken, HashActiveUserProfileToken } from "@project/shared";
import type { User } from "@project/shared";
import type { UserDb } from "./user.db.js";
import type { MappingError } from "#infrastructure";

export const UserMapper = {
  toDomain(doc: unknown): Result<User, MappingError> {
    const rawId = doc && typeof doc === "object" && "_id" in doc && doc._id ? String(doc._id) : "unknown";
    const parsed = UserDbSchema.safeParse(doc);
    if (!parsed.success) {
      return err(createMappingError("User", rawId, parsed.error));
    }
    const validDoc = parsed.data;
    return ok({
      id: UserId(validDoc._id.toString()),
      email: Email(validDoc.email),
      fullName: {
        firstName: validDoc.fullName.firstName,
        lastName: validDoc.fullName.lastName,
      },
      hashedPassword: HashedPassword(validDoc.hashedPassword),
      state: validDoc.state,
      passwordTokenHash: validDoc.passwordTokenHash ? HashResetPasswordToken(validDoc.passwordTokenHash) : null,
      passwordTokenExpiresAt: validDoc.passwordTokenExpiresAt,
      profileTokenHash: validDoc.profileTokenHash ? HashActiveUserProfileToken(validDoc.profileTokenHash) : null,
      createdAt: validDoc.createdAt,
      updatedAt: validDoc.updatedAt,
    });
  },
  toDocument(domain: User): UserDb {
    return {
      _id: new ObjectId(domain.id),
      email: domain.email,
      fullName: {
        firstName: domain.fullName.firstName,
        lastName: domain.fullName.lastName,
      },
      hashedPassword: domain.hashedPassword,
      state: domain.state,
      passwordTokenHash: domain.passwordTokenHash ? HashResetPasswordToken(domain.passwordTokenHash) : null,
      passwordTokenExpiresAt: domain.passwordTokenExpiresAt,
      profileTokenHash: domain.profileTokenHash ? HashActiveUserProfileToken(domain.profileTokenHash) : null,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  },
};
