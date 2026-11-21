import { z } from "zod";
import { MembershipIdSchema, UserIdSchema, TenantIdSchema, TeamIdSchema } from "./_identity.js";
import { MembershipStateSchema } from "./_states.js";
import { TeamRoleSchema } from "./team.js";

export const TENANT_ROLE = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
} as const;
export const TenantRoleSchema = z.enum(TENANT_ROLE);

const TeamAccessSchema = z.object({
  teamId: TeamIdSchema,
  teamRole: TeamRoleSchema,
});

export const MembershipSchema = z.object({
  id: MembershipIdSchema,
  userId: UserIdSchema,
  tenantId: TenantIdSchema,
  tenantRole: TenantRoleSchema,
  teamAccesses: z.array(TeamAccessSchema),
  status: MembershipStateSchema,
  invitedBy: UserIdSchema,
  createdAt: z.date(),
  acceptedAt: z.date().nullable(),
  expiresAt: z.date().nullable(),
});

export type Membership = z.infer<typeof MembershipSchema>;
export type TenantRole = z.infer<typeof TenantRoleSchema>;
