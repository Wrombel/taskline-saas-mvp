import express from "express";
import { Redis } from "ioredis";
import { pinoHttp } from "pino-http";
import cookieParser from "cookie-parser";
import { logger } from "#http";
import { connectDB } from "#infrastructure";
import { createIdentityModule } from "./modules/identity/index.js";
import { createRedisClient } from "#infrastructure";
import { globalErrorHandler } from "./http/index.js";
import { createSetSessionCookie } from "#helpers";
import type { MongoClient } from "mongodb";
import type { Application } from "express";
import type { AppConfig } from "./config/env.js";
import type { IdentityModule } from "./modules/identity/index.js";
interface AppContext {
  app: Application;
  mongoClient: MongoClient;
  redisClient: Redis;
  identityModule: IdentityModule;
}

export async function createApp(config: AppConfig): Promise<AppContext> {
  const mongoClient = await connectDB(config.db.mongoUri);
  const redisClient = await createRedisClient(config.db.redisUri);

  const app = express();
  app.use(
    pinoHttp({
      logger,
    }),
  );
  app.use(cookieParser(config.cookie.secret));
  app.use(express.json());
  const setSessionCookie = createSetSessionCookie(config);
  const identityModule = createIdentityModule({
    mongoClient,
    redisClient,
    sessionConfig: config.session,
    setSessionCookie,
  });

  app.use("/api/auth", identityModule.router);
  app.use(globalErrorHandler); //globalErrorHandler must be the last one
  return { app, mongoClient, redisClient, identityModule };
}
