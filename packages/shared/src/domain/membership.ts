import { z } from "zod";
import { MembershipIdSchema, UserIdSchema, TenantIdSchema, TeamIdSchema } from "./_indetity.js";
import { MembershipStateSchema } from "./_states.js";
import { TenantRoleSchema } from "./tenant.js";
import { TeamRoleSchema } from "./team.js";

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
