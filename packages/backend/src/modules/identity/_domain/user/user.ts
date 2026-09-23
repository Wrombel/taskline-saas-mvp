import type { RegisterRequestSchema } from "@project/shared";
import type { User } from "@project/shared";
import type { UserId } from "@project/shared";
import type { HashedPassword } from "@project/shared";
export const createUser = (
  data: Omit<RegisterRequestSchema, "password">,
  stringId: UserId,
  hashedPassword: HashedPassword,
): User => {
  return {
    ...data,
    id: stringId,
    hashedPassword: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};
