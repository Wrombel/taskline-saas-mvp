import { z } from "zod";

export const TENANT_ROLE = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
} as const;
export const TenantRoleSchema = z.enum(TENANT_ROLE);

export type TenantRole = z.infer<typeof TenantRoleSchema>;
