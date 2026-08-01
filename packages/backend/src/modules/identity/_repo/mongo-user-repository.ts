import { Collection } from "mongodb";
import type { UserDb } from "../_persistence/user.db.js";
import type { UserRepository } from "./user-repository.js";
type Dependencies = {
  usersCollection: Collection<UserDb>;
};

// export const createUserRepository = ({
//   usersCollection,
// }: Dependencies): UserRepository => ({
//   async findByEmail(email: string) {
//     return usersCollection.findOne({ email });
//   },

//   async create(user: UserDb) {
//     await usersCollection.insertOne(user);
//   },
// });

export const saveUser = async (
  collection: Collection<UserDb>,
  user: UserDb,
): Promise<void> => {
  await collection.insertOne(user);
};

export const findUserByEmail = async (
  collection: Collection<UserDb>,
  email: string,
): Promise<UserDb | null> => {
  return await collection.findOne({ email });
};

// 2. Fabryka (opcjonalna), która mapuje czyste funkcje na Twój interfejs UserRepository

export const createUserRepository = ({
  usersCollection,
}: Dependencies): UserRepository => {
  return {
    create: (user) => saveUser(usersCollection, user),
    findByEmail: (email) => findUserByEmail(usersCollection, email),
  };
};
