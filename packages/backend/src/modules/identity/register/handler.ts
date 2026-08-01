import { ObjectId } from "mongodb";

import type { UserRepository } from "../_repo/user-repository.js";
import type { UserDb } from "../_persistence/user.db.js";
import type { RegisterRequestSchema } from "@project/shared";

type Dependencies = {
  userRepository: UserRepository;
};

export const createRegisterHandler =
  ({ userRepository }: Dependencies) =>
  async (command: RegisterRequestSchema) => {
    const existingUser = await userRepository.findByEmail(command.email);
    console.log(existingUser);
    if (existingUser) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const user: UserDb = {
      _id: new ObjectId(),
      name: "aa",
      surname: "bb",
      email: command.email,
      hashedPassword: `hashed:${command.password}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const a = await userRepository.create(user);
    console.log(a);
    return;
  };
