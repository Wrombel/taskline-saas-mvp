import { Router } from "express";
import type { RequestHandler } from "express";
import type { Redis } from "ioredis";
import type { Db, MongoClient } from "mongodb";
import { generateId } from "#infrastructure";
import { createTenantFactory } from "./_domain/tenant/tenant.js";
import { createMembershipFactory } from "./_domain/membership/membership.js";
import { makeEnsureTenantIndexes } from "./_infra/mongo/tenant-indexes.js";
import type { TenantDb } from "./_persistence/tenant.db.js";
import type { MembershipDb } from "./_persistence/membership.db.js";

type Dependencies = {
  mongoClient: MongoClient;
  redisClient: Redis;
  authGuard: RequestHandler;
};

export type TenantModule = {
  router: Router;
  initDatabase: () => Promise<void>;
};

export const createTenantModule = ({
  mongoClient,
  redisClient,
  authGuard,
}: Dependencies): TenantModule => {
  // Redis and authGuard are injected for tenant use cases and routes.
  void redisClient;
  void authGuard;

  const router = Router();
  const db: Db = mongoClient.db();
  const tenantsCollection = db.collection<TenantDb>("tenants");
  const membershipsCollection = db.collection<MembershipDb>("memberships");
  const initDatabase = makeEnsureTenantIndexes(tenantsCollection, membershipsCollection);
  const tenantFactory = createTenantFactory(generateId.tenant);
  const membershipFactory = createMembershipFactory(generateId.Membership);

  // Factories are composed here and will be injected into tenant use cases.
  void tenantFactory;
  void membershipFactory;

  return { router, initDatabase };
};
