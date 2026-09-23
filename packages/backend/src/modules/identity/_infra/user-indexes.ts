import type { Collection } from "mongodb";
import type { UserDb } from "../_persistence/user.db.js";
export const makeEnsureUserIndexes =
  (usersCollection: Collection<UserDb>) => async (): Promise<void> => {
    await usersCollection.createIndexes([
      {
        key: { email: 1 },
        unique: true,
        name: "unique_user_email",
      },
    ]);
  };
