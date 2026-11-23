import type { ResultAsync } from "neverthrow";
import type { Membership } from "@project/shared";
import type { DatabaseError } from "#infrastructure";

export type MembershipRepository = {
  createMembership(membership: Membership): ResultAsync<void, DatabaseError>;
};
