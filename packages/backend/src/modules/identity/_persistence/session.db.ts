import { z } from "zod";
import { ObjectId } from "mongodb";
const TeamAccessSchema = z.object({
  teamId: z.instanceof(ObjectId),
  teamRole: z.string(),
});

const TenantContextSchema = z.object({
  tenantId: z.instanceof(ObjectId),
  tenantRole: z.string(),
  teamAccesses: z.array(TeamAccessSchema),
});

export const SessionDbSchema = z.object({
  _id: z.instanceof(ObjectId),
  userId: z.instanceof(ObjectId),
  tenantContext: TenantContextSchema.nullable(),
  createdAt: z.date(),
  expiresAt: z.date(),
  maxExpiresAt: z.date(),
});

// Generowanie typu TypeScript z Zod:
export type SessionDb = z.infer<typeof SessionDbSchema>;
