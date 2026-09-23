import { z } from "zod";

// --- UnauthorizedError HTTP 401
export const UnauthorizedErrorSchema = z.object({
  _tag: z.literal("UnauthorizedError"),
  message: z.string(),
  reason: z
    .enum(["MISSING_TOKEN", "EXPIRED_SESSION", "INVALID_CREDENTIALS"])
    .optional(),
});

export type UnauthorizedError = z.infer<typeof UnauthorizedErrorSchema>;

export const createUnauthorizedError = (
  message = "Authentication required.",
  reason?: UnauthorizedError["reason"],
): UnauthorizedError => ({
  _tag: "UnauthorizedError",
  message,
  ...(reason && { reason }),
});

// --- ForbiddenError HTTP 403
export const ForbiddenErrorSchema = z.object({
  _tag: z.literal("ForbiddenError"),
  message: z.string(),
  resource: z.string().optional(),
  requiredRole: z.string().optional(),
});

export type ForbiddenError = z.infer<typeof ForbiddenErrorSchema>;

export const createForbiddenError = (
  message = "Access denied.",
  details?: { resource?: string; requiredRole?: string },
): ForbiddenError => ({
  _tag: "ForbiddenError",
  message,
  ...details,
});
