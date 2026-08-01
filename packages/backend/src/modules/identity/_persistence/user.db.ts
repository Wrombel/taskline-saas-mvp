import { z } from "zod";
import { ObjectId } from "mongodb";
export const UserDbSchema = z.object({
  _id: ObjectId,
  email: z.email(),
  name: z.string(),
  surname: z.string(),
  hashedPassword: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserDb = z.infer<typeof UserDbSchema>;
