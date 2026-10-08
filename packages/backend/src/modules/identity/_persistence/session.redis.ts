import { z } from "zod";
import { SessionIdSchema, UserIdSchema, MembershipIdSchema } from "@project/shared";
import { SessionVersionSchema } from "@project/shared";
export const SessionRedisSchema = z.object({
  sessionId: SessionIdSchema,
  userId: UserIdSchema,
  tenantContext: MembershipIdSchema.nullable(),
  cachedSessionVersion: SessionVersionSchema,
  SessionExpiresAt: z.coerce.date(),
});

export type SessionRedis = z.infer<typeof SessionRedisSchema>;
