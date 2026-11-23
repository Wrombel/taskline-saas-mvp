import { z } from "zod";
import { TenantIdSchema } from "./_identity.js";
import { TenantStateSchema } from "./_states.js";

export const TenantSlugSchema = z
  .string()
  .min(3)
  .max(63)
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/)
  .brand<"TenantSlug">();
export type TenantSlug = z.infer<typeof TenantSlugSchema>;
export const TenantSlug = (value: string) => value as TenantSlug;

export const TenantSchema = z.object({
  id: TenantIdSchema,
  slug: TenantSlugSchema,
  name: z.string(),
  memberCount: z.number().int().nonnegative(),
  status: TenantStateSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Tenant = z.infer<typeof TenantSchema>;
