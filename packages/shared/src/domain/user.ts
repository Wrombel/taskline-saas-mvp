import { z } from "zod";
import { UserIdSchema } from "./_indetity.js";
import { HashResetPasswordTokenSchema, HashActiveUserProfileTokenSchema } from "./_hashes.js";
import { UserStateSchema } from "./_states.js";

export const EmailSchema = z.email().brand<"Email">();
export const Email = (value: string) => value as Email;

export const HashedPasswordSchema = z.string().brand<"HashedPassword">();
export const HashedPassword = (value: string) => value as HashedPassword;

export const UserSchema = z.object({
  id: UserIdSchema,
  email: EmailSchema,
  fullName: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
  hashedPassword: HashedPasswordSchema,
  state: UserStateSchema,
  passwordTokenHash: HashResetPasswordTokenSchema.nullable(),
  passwordTokenExpiresAt: z.date().nullable(),
  profileTokenHash: HashActiveUserProfileTokenSchema.nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type HashedPassword = z.infer<typeof HashedPasswordSchema>;
export type User = z.infer<typeof UserSchema>;
export type Email = z.infer<typeof EmailSchema>;
