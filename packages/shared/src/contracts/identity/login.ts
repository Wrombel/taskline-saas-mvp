import { z } from "zod";
import { sanitizedEmailSchema } from "../_helpers/sanitizedEmail.js";

export const LoginRequestSchema = z.object({
  email: sanitizedEmailSchema,
  password: z.string().min(8).max(64),
});

export type LoginRequestSchema = z.infer<typeof LoginRequestSchema>;
