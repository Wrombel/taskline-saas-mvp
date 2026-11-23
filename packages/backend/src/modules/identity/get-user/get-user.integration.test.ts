import { randomUUID } from "node:crypto";
import { MongoClient, ObjectId } from "mongodb";
import type { Collection, Db } from "mongodb";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { UserId } from "@project/shared";
import type { UserDb } from "../_persistence/user.db.js";
import { createUserRepository } from "../_repo/mongo-user-repository.js";
import { createGetUserProfileHandler } from "./handler.js";

const uri = process.env.TEST_MONGO_URI;

if (!uri || !/localhost|127\.0\.0\.1/.test(uri)) {
  throw new Error("TEST_MONGO_URI must point to a local test MongoDB");
}

const dbName = `get_user_test_${randomUUID()}`;
let client: MongoClient;
let db: Db;
let usersCollection: Collection<UserDb>;

beforeAll(async () => {
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  usersCollection = db.collection<UserDb>("users");
}, 120_000);

afterAll(async () => {
  await db?.dropDatabase();
  await client?.close();
});

beforeEach(async () => {
  await usersCollection.deleteMany({});
});

const insertUser = async (overrides: Partial<UserDb> = {}) => {
  const userId = new ObjectId();
  const now = new Date();
  await usersCollection.insertOne({
    _id: userId,
    email: "ada@example.com",
    fullName: { firstName: "Ada", lastName: "Lovelace" },
    ownedTenantCount: 0,
    hashedPassword: "stored-hash",
    sessionVersion: 1,
    state: "active",
    passwordTokenHash: null,
    passwordTokenExpiresAt: null,
    profileTokenHash: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  });
  return userId.toHexString() as UserId;
};

const buildHandler = () =>
  createGetUserProfileHandler({ userRepository: createUserRepository({ usersCollection }) });

describe("get user profile flow with a real MongoDB", () => {
  it("returns the persisted public profile for the requested user", async () => {
    const userId = await insertUser();
    const handler = buildHandler();

    const result = await handler(userId);

    expect(result._unsafeUnwrap()).toEqual({
      id: userId,
      email: "ada@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
    });
  });

  it("returns UserNotFoundError when the user does not exist", async () => {
    const handler = buildHandler();

    const result = await handler(new ObjectId().toHexString() as UserId);

    expect(result._unsafeUnwrapErr()).toMatchObject({ _tag: "UserNotFoundError" });
  });

  it("returns MappingError when persisted profile data is invalid", async () => {
    const userId = await insertUser({
      fullName: { firstName: 123, lastName: "Lovelace" } as unknown as UserDb["fullName"],
    });
    const handler = buildHandler();

    const result = await handler(userId);

    expect(result._unsafeUnwrapErr()).toMatchObject({ _tag: "MappingError", entityName: "UserProfile" });
  });
});
