import { z } from "zod";
import {
  UserStateSchema,
  UserIdSchema,
  EmailSchema,
  HashedPasswordSchema,
  SessionVersionSchema,
} from "@project/shared";

export const UserAuthSchema = z.object({
  id: UserIdSchema,
  email: EmailSchema,
  hashedPassword: HashedPasswordSchema,
  state: UserStateSchema,
  sessionVersion: SessionVersionSchema,
});

export type UserAuth = z.infer<typeof UserAuthSchema>;
