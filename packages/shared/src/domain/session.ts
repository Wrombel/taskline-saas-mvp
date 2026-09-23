import { z } from "zod";
import { SessionIdSchema, UserIdSchema, MembershipIdSchema } from "./_indetity.js";
import { HashSessionTokenSchema } from "./_hashes.js";

export const SessionSchema = z.object({
  id: SessionIdSchema,
  userId: UserIdSchema,
  sessionHash: HashSessionTokenSchema,
  tenantContext: MembershipIdSchema.nullable(),
  createdAt: z.date(),
  expiresAt: z.date(),
  maxExpiresAt: z.date(),
});

export type Session = z.infer<typeof SessionSchema>;
