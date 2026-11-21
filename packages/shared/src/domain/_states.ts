import { z } from "zod";

export const USER_STATUS = {
  UNVERIFIED: "unverified",
  ACTIVE: "active",
  DEACTIVATED: "deactivated",
} as const;

export const SESSION_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  REVOKED: "revoked",
} as const;

export const MEMBERSHIP_STATUS = {
  INVITED: "Invited",
  REMOVED: "Removed",
  EXPIRED: "Expired",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  REVOKED: "revoked",
} as const;

export const TENANT_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  ARCHIVED: "archived",
} as const;

export const UserStateSchema = z.enum(USER_STATUS);
export const SessionStateSchema = z.enum(SESSION_STATUS);
export const MembershipStateSchema = z.enum(MEMBERSHIP_STATUS);
export const TenantStateSchema = z.enum(TENANT_STATUS);

export type UserState = z.infer<typeof UserStateSchema>;
export type SessionState = z.infer<typeof SessionStateSchema>;
export type MembershipState = z.infer<typeof MembershipStateSchema>;
export type TenantState = z.infer<typeof TenantStateSchema>;
