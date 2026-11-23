import { z } from "zod";
import { TenantSlugSchema } from "../../domain/tenant.js";

export const CreateTenantRequestSchema = z.object({
  slug: TenantSlugSchema,
  name: z.string().trim().min(1).max(200),
});

export type CreateTenantRequest = z.infer<typeof CreateTenantRequestSchema>;
