import { z } from "zod";
import { sanitizedEmailSchema } from "../_helpers/sanitizedEmail.js";

const nameSchema = z.string().trim().min(2).max(32);

export const RegisterRequestSchema = z.object({
  email: sanitizedEmailSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  password: z.string().min(8).max(64),
});

export type RegisterRequestSchema = z.infer<typeof RegisterRequestSchema>;
