import { MEMBERSHIP_STATUS } from "@project/shared";
import type { Membership, MembershipId } from "@project/shared";

type MembershipInfo = Pick<Membership, "userId" | "tenantId" | "tenantRole" | "teamAccesses" | "invitedBy">;

export type MembershipFactory = {
  prepareMembership(membershipInfo: MembershipInfo): Membership;
};

export const makePrepareMembership = (
  membershipInfo: MembershipInfo,
  generateMembershipId: () => MembershipId,
): Membership => ({
  id: generateMembershipId(),
  userId: membershipInfo.userId,
  tenantId: membershipInfo.tenantId,
  tenantRole: membershipInfo.tenantRole,
  teamAccesses: membershipInfo.teamAccesses,
  status: MEMBERSHIP_STATUS.INVITED,
  invitedBy: membershipInfo.invitedBy,
  createdAt: new Date(),
  acceptedAt: null,
  expiresAt: null,
});

export const createMembershipFactory = (generateMembershipId: () => MembershipId): MembershipFactory => ({
  prepareMembership: (membershipInfo) => makePrepareMembership(membershipInfo, generateMembershipId),
});
