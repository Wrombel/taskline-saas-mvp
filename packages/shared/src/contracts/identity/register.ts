import { z } from "zod";

export const RegisterRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type RegisterRequestSchema = z.infer<typeof RegisterRequestSchema>;
