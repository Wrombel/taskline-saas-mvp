import { z } from "zod";
import { TenantIdSchema } from "./_identity.js";
import { TenantStateSchema } from "./_states.js";
export const TenantSchema = z.object({
  id: TenantIdSchema,
  slug: z.string(),
  name: z.string(),
  status: TenantStateSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Tenant = z.infer<typeof TenantSchema>;
