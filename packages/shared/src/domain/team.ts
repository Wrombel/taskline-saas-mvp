import { z } from "zod";

export const TEAM_ROLE = {
  ADMIN: "admin",
  MEMBER: "member",
} as const;
export const TeamRoleSchema = z.enum(TEAM_ROLE);

export type TeamRole = z.infer<typeof TeamRoleSchema>;
