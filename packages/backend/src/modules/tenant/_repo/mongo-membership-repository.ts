import type { Collection } from "mongodb";
import { ResultAsync } from "neverthrow";
import { createDatabaseError } from "#infrastructure";
import { MembershipMapper } from "../_persistence/membership.mapper.js";
import type { MembershipDb } from "../_persistence/membership.db.js";
import type { Membership } from "@project/shared";
import type { MembershipRepository } from "./membership-repository.js";

type Dependencies = {
  membershipsCollection: Collection<MembershipDb>;
};

export const createMembershipRepository = ({ membershipsCollection }: Dependencies): MembershipRepository => ({
  createMembership: (membership: Membership) => {
    const membershipDb: MembershipDb = MembershipMapper.toDocument(membership);

    return ResultAsync.fromPromise(membershipsCollection.insertOne(membershipDb), createDatabaseError).map(
      () => undefined,
    );
  },
});
