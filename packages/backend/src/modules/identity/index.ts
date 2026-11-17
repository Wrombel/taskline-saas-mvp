import { Router } from "express";
import type { RequestHandler } from "express";
import { createRegisterController } from "./register/controller.js";
import { createRegisterHandler } from "./register/handler.js";
import { Redis } from "ioredis";
import { makeRunTransaction } from "#infrastructure";
import { createUserRepository } from "./_repo/mongo-user-repository.js";
import { createSessionRepository } from "./_repo/mongo-session-repository.js";
import { createArgon2PasswordHasher } from "#infrastructure";
import { makeEnsureUserIndexes } from "./_infra/mongo/user-indexes.js";
import { generateId } from "#infrastructure";
import { generateRawToken, generateHashToken } from "#infrastructure";
import { createSessionFactory } from "./_domain/session/session.js";
import { createUserFactory } from "./_domain/user/user.js";
import { createSessionStore } from "./_infra/redis/createSessionStore.js";
import { createAuthenticateSessionUseCase } from "./authenticate/authenticateSessionUseCase.js";
import { createAuthGuard } from "../../http/guards/auth.guard.js";
import { createGetUserProfileHandler } from "./get-user/handler.js";
import { createGetUserProfileController } from "./get-user/controller.js";
import { createLoginController } from "./login/controller.js";
import { createLoginHandler } from "./login/handler.js";
import { createLogoutController } from "./logout/controller.js";
import { createLogoutHandler } from "./logout/handler.js";
import type { UserDb } from "./_persistence/user.db.js";
import type { SessionDb } from "./_persistence/session.db.js";
import type { Collection, Db, MongoClient } from "mongodb";
import type { AppConfig } from "#config";
import type { SetSessionCookie } from "#helpers";
type Dependencies = {
  mongoClient: MongoClient;
  redisClient: Redis;
  sessionConfig: AppConfig["session"];
  setSessionCookie: SetSessionCookie;
};
export type IdentityModule = {
  router: Router;
  authGuard: RequestHandler;
  initDatabase: () => Promise<void>;
};
export const createIdentityModule = ({
  mongoClient,
  redisClient,
  sessionConfig,
  setSessionCookie,
}: Dependencies): IdentityModule => {
  const router = Router();
  const db: Db = mongoClient.db();
  const usersCollection = db.collection<UserDb>("users");
  const sessionCollection = db.collection<SessionDb>("session");
  const initDatabase = makeEnsureUserIndexes(usersCollection);
  const runTransaction = makeRunTransaction(mongoClient);
  const passwordHasher = createArgon2PasswordHasher();
  const sessionStore = createSessionStore(redisClient);
  const sessionFactory = createSessionFactory(
    sessionConfig,
    generateId.session,
    generateRawToken.session,
    generateHashToken.sessionHash,
  );
  const userFactory = createUserFactory(
    generateId.user,
    generateRawToken.profile,
    generateHashToken.profileHash,
    generateRawToken.password,
    generateHashToken.passwordHash,
  );
  const userRepository = createUserRepository({
    usersCollection,
  });
  const sessionRepository = createSessionRepository({
    sessionCollection,
  });
  const authenticateSessionUseCase = createAuthenticateSessionUseCase({
    hashToken: generateHashToken.sessionHash,
    sessionStore,
    sessionRepository,
    userRepository,
    now: () => new Date(),
    calculateSlidingExpiration: sessionFactory.calculateSlidingExpiration,
  });
  const authGuard = createAuthGuard(authenticateSessionUseCase);

  const registerHandler = createRegisterHandler({
    userRepository,
    sessionRepository,
    runTransaction,
    passwordHasher,
    sessionFactory,
    userFactory,
    sessionStore,
  });
  const loginHandler = createLoginHandler({
    userRepository,
    sessionRepository,
    passwordHasher,
    sessionFactory,
    sessionStore,
  });
  const getUserProfileHandler = createGetUserProfileHandler({ userRepository });
  const logoutHandler = createLogoutHandler({
    hashToken: generateHashToken.sessionHash,
    sessionRepository,
    sessionStore,
  });
  const registerController = createRegisterController({
    registerHandler,
    setSessionCookie,
  });
  const loginController = createLoginController({ loginHandler, setSessionCookie });
  const getUserProfileController = createGetUserProfileController({ getUserProfileHandler });
  const logoutController = createLogoutController({ logoutHandler });

  router.post("/register", registerController);
  router.post("/login", loginController);
  router.post("/logout", logoutController);
  router.get("/me", authGuard, getUserProfileController);
  return {
    router,
    authGuard,
    initDatabase,
  };
};
