import type { Collection } from "mongodb";
import type { MembershipDb } from "../../_persistence/membership.db.js";
import type { TenantDb } from "../../_persistence/tenant.db.js";

export const makeEnsureTenantIndexes = (
  tenantsCollection: Collection<TenantDb>,
  membershipsCollection: Collection<MembershipDb>,
) =>
  async (): Promise<void> => {
    await Promise.all([
      tenantsCollection.createIndexes([
        {
          key: { slug: 1 },
          unique: true,
          name: "unique_tenant_slug",
        },
      ]),
      membershipsCollection.createIndexes([
        {
          key: { userId: 1, tenantId: 1 },
          unique: true,
          name: "unique_membership_user_tenant",
        },
        {
          key: { tenantId: 1 },
          unique: true,
          name: "unique_membership_owner_per_tenant",
          partialFilterExpression: { tenantRole: "owner" },
        },
      ]),
    ]);
  };
