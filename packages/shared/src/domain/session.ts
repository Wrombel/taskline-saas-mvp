import { z } from "zod";
import { SessionIdSchema, UserIdSchema, MembershipIdSchema } from "./_identity.js";
import { HashSessionTokenSchema } from "./_hashes.js";

export const SessionVersionSchema = z.number().int().nonnegative().brand<"SessionVersion">();
export const SessionVersion = (value: number) => value as SessionVersion;

export const SessionSchema = z.object({
  id: SessionIdSchema,
  userId: UserIdSchema,
  sessionHash: HashSessionTokenSchema,
  rawUserAgent: z.string().nullable(),
  deviceInfo: z.string(),
  tenantContext: MembershipIdSchema.nullable(),
  version: SessionVersionSchema,
  createdAt: z.date(),
  expiresAt: z.date(),
  maxExpiresAt: z.date(),
});

export type Session = z.infer<typeof SessionSchema>;
export type SessionVersion = z.infer<typeof SessionVersionSchema>;
