import { TENANT_STATUS } from "@project/shared";
import type { Tenant, TenantId } from "@project/shared";

type TenantInfo = Pick<Tenant, "slug" | "name">;

export type TenantFactory = {
  prepareTenant(tenantInfo: TenantInfo): Tenant;
};

export const makePrepareTenant = (tenantInfo: TenantInfo, generateTenantId: () => TenantId): Tenant => {
  const now = new Date();

  return {
    id: generateTenantId(),
    slug: tenantInfo.slug,
    name: tenantInfo.name,
    memberCount: 1,
    status: TENANT_STATUS.ACTIVE,
    createdAt: now,
    updatedAt: now,
  };
};

export const createTenantFactory = (generateTenantId: () => TenantId): TenantFactory => ({
  prepareTenant: (tenantInfo) => makePrepareTenant(tenantInfo, generateTenantId),
});
