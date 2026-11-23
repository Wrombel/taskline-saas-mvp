import { z } from "zod";
import { MembershipSchema } from "@project/shared";

export const MembershipRedisSchema = MembershipSchema.pick({
  id: true,
  userId: true,
  tenantId: true,
  tenantRole: true,
  teamAccesses: true,
  status: true,
});

export type MembershipRedis = z.infer<typeof MembershipRedisSchema>;
