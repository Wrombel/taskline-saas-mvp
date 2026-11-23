export type MembershipAlreadyExistsError = {
  readonly _tag: "MembershipAlreadyExistsError";
  readonly userId: string;
  readonly tenantId: string;
  readonly message: string;
};

export type MembershipInvitationExpiredError = {
  readonly _tag: "MembershipInvitationExpiredError";
  readonly membershipId: string;
  readonly message: string;
};

// --- FACTORIES ---
export const createMembershipAlreadyExistsError = (
  userId: string,
  tenantId: string,
): MembershipAlreadyExistsError => ({
  _tag: "MembershipAlreadyExistsError",
  userId,
  tenantId,
  message: `Membership already exists for user ${userId} in tenant ${tenantId}.`,
});

export const createMembershipInvitationExpiredError = (membershipId: string): MembershipInvitationExpiredError => ({
  _tag: "MembershipInvitationExpiredError",
  membershipId,
  message: `Invitation for membership ${membershipId} has expired.`,
});
