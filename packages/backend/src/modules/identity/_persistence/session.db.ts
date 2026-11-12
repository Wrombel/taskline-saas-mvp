import { z } from "zod";
import { ObjectId } from "mongodb";

export const SessionDbSchema = z.object({
  _id: z.instanceof(ObjectId),
  userId: z.instanceof(ObjectId),
  sessionHash: z.string(),
  rawUserAgent: z.string().nullable(),
  deviceInfo: z.string(),
  tenantContext: z.instanceof(ObjectId).nullable(),
  createdAt: z.date(),
  expiresAt: z.date(),
  version: z.number(),
  maxExpiresAt: z.date(),
});

// Generowanie typu TypeScript z Zod:
export type SessionDb = z.infer<typeof SessionDbSchema>;
