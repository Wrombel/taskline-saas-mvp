import { z } from "zod";
import { TenantIdSchema, TenantSlugSchema, TenantStateSchema } from "@project/shared";

export const TenantRedisSchema = z.object({
  tenantId: TenantIdSchema,
  status: TenantStateSchema,
  slug: TenantSlugSchema,
  name: z.string(),
});

export type TenantRedis = z.infer<typeof TenantRedisSchema>;
