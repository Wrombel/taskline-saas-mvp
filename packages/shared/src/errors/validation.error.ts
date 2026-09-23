import { z } from "zod";

type ZodIssueItem = z.ZodError["issues"][number];

export const ValidationErrorSchema = z.object({
  _tag: z.literal("ValidationError"),
  message: z.string(),
  issues: z.array(z.custom<ZodIssueItem>()),
});

export type ValidationError = z.infer<typeof ValidationErrorSchema>;

export const createValidationError = (
  error: z.ZodError,
  message = "Validation failed.",
): ValidationError => ({
  _tag: "ValidationError",
  message,
  issues: error.issues,
});
