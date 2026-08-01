import express from "express";
import { connectDB } from "./config/database.js";
import type { Application } from "express";
import { createIdentityModule } from "./modules/identity/index.js";

export async function createApp(): Promise<Application> {
  await connectDB();

  const app = express();

  app.use(express.json());

  const identityModule = createIdentityModule();

  app.use(identityModule);

  return app;
}
