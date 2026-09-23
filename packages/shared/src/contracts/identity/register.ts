import { z } from "zod";
import { sanitizedEmailSchema } from "../_helpers/sanitizedEmail.js";
export const RegisterRequestSchema = z.object({
  email: sanitizedEmailSchema,
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  password: z.string().min(8),
});

export type RegisterRequestSchema = z.infer<typeof RegisterRequestSchema>;
