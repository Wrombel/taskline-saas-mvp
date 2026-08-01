import { Router } from "express";
import { createRegisterController } from "./register/controller.js";
import { createRegisterHandler } from "./register/handler.js";
import { getDB } from "../../config/database.js";
import { createUserRepository } from "./_repo/mongo-user-repository.js";
import type { Request, Response } from "express";
import type { UserDb } from "./_persistence/user.db.js";
export const createIdentityModule = (): Router => {
  const router = Router();
  const usersCollection = getDB().collection<UserDb>("users");

  const userRepository = createUserRepository({
    usersCollection,
  });

  const registerHandler = createRegisterHandler({
    userRepository,
  });
  const registerController = createRegisterController({
    registerHandler,
  });

  router.post("/api/users", registerController);
  return router;
};

async function kappa(req: Request, res: Response) {
  console.log(req.body);
  res.status(201);
}
