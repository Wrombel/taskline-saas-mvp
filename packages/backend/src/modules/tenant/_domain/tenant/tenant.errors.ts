export type TenantSlugAlreadyExistsError = {
  readonly _tag: "TenantSlugAlreadyExistsError";
  readonly slug: string;
  readonly message: string;
};

export type TenantLimitReachedError = {
  readonly _tag: "TenantLimitReachedError";
  readonly userId: string;
  readonly limit: number;
  readonly message: string;
};

// --- FACTORIES ---
export const createTenantSlugAlreadyExistsError = (slug: string): TenantSlugAlreadyExistsError => ({
  _tag: "TenantSlugAlreadyExistsError",
  slug,
  message: `Tenant with slug ${slug} already exists.`,
});

export const createTenantLimitReachedError = (userId: string, limit: number): TenantLimitReachedError => ({
  _tag: "TenantLimitReachedError",
  userId,
  limit,
  message: `User with id ${userId} has reached the limit of ${limit} tenants.`,
});
