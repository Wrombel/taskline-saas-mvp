import type { MembershipId, SessionId, UserId } from "@project/shared";

export type AuthContext = {
  userId: UserId;
  sessionId: SessionId;
  tenantContext: MembershipId | null;
};
