import { Router } from "express";
import { createRegisterController } from "./register/controller.js";
import { createRegisterHandler } from "./register/handler.js";
import { Redis } from "ioredis";
import { makeRunTransaction } from "#infrastructure";
import { createUserRepository } from "./_repo/mongo-user-repository.js";
import { createSessionRepository } from "./_repo/mongo-session-repository.js";
import { createArgon2PasswordHasher } from "#infrastructure";
import { makeEnsureUserIndexes } from "./_infra/user-indexes.js";
import type { UserDb } from "./_persistence/user.db.js";
import type { SessionDb } from "./_persistence/session.db.js";
import type { Collection, Db, MongoClient } from "mongodb";
import type { AppConfig } from "#config";
type Dependencies = {
  mongoClient: MongoClient;
  redisClient: Redis;
  sessionConfig: AppConfig["session"];
};
export type IdentityModule = {
  router: Router;
  initDatabase: () => Promise<void>;
};
export const createIdentityModule = ({
  mongoClient,
  redisClient,
  sessionConfig,
}: Dependencies): IdentityModule => {
  const router = Router();
  const db: Db = mongoClient.db();
  const usersCollection = db.collection<UserDb>("users");
  const sessionCollection = db.collection<SessionDb>("session");
  const initDatabase = makeEnsureUserIndexes(usersCollection);
  const runTransaction = makeRunTransaction(mongoClient);
  const passwordHasher = createArgon2PasswordHasher();

  const userRepository = createUserRepository({
    usersCollection,
  });
  const sessionRepository = createSessionRepository({
    sessionCollection,
  });
  const registerHandler = createRegisterHandler({
    userRepository,
    sessionRepository,
    runTransaction,
    passwordHasher,
  });
  const registerController = createRegisterController({
    registerHandler,
  });

  router.post("/register", registerController);
  return {
    router,
    initDatabase,
  };
};
