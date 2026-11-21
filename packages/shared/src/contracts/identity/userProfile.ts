import { z } from "zod";
import { UserIdSchema } from "../../domain/_identity.js";

export const GetUserProfileSchema = z.object({
  id: UserIdSchema,
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

export type GetUserProfile = z.infer<typeof GetUserProfileSchema>;
