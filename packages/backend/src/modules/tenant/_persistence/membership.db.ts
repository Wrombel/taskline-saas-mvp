import { ObjectId } from "mongodb";
import { z } from "zod";
import { MembershipStateSchema, TeamRoleSchema, TenantRoleSchema } from "@project/shared";

export const MembershipDbSchema = z.object({
  _id: z.instanceof(ObjectId),
  userId: z.instanceof(ObjectId),
  tenantId: z.instanceof(ObjectId),
  tenantRole: TenantRoleSchema,
  teamAccesses: z.array(
    z.object({
      teamId: z.instanceof(ObjectId),
      teamRole: TeamRoleSchema,
    }),
  ),
  status: MembershipStateSchema,
  invitedBy: z.instanceof(ObjectId),
  createdAt: z.date(),
  acceptedAt: z.date().nullable(),
  expiresAt: z.date().nullable(),
});

export type MembershipDb = z.infer<typeof MembershipDbSchema>;
