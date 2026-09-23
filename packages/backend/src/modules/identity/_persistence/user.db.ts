import { z } from "zod";
import { ObjectId } from "mongodb";
import { UserStateSchema } from "@project/shared";
export const UserDbSchema = z.object({
  _id: z.instanceof(ObjectId),
  email: z.email(),
  fullName: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
  hashedPassword: z.string(),
  state: UserStateSchema,
  passwordTokenHash: z.string().nullable(),
  passwordTokenExpiresAt: z.date().nullable(),
  profileTokenHash: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserDb = z.infer<typeof UserDbSchema>;
