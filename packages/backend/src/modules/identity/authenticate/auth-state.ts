import { z } from "zod";
import { SessionVersionSchema, UserStateSchema } from "@project/shared";

export const AuthStateSchema = z.object({
  state: UserStateSchema,
  sessionVersion: SessionVersionSchema,
});
export type AuthState = z.infer<typeof AuthStateSchema>;
