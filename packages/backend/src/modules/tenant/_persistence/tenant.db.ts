import { z } from "zod";
import { TenantStateSchema } from "@project/shared";
import { ObjectId } from "mongodb";
export const TenantDbSchema = z.object({
  _id: z.instanceof(ObjectId),
  slug: z.string(),
  name: z.string(),
  memberCount: z.number().int().nonnegative(),
  status: TenantStateSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TenantDb = z.infer<typeof TenantDbSchema>;
