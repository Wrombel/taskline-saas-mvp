import { createHash, randomBytes, randomUUID } from "node:crypto";
import { MongoClient, ObjectId } from "mongodb";
import type { Collection, Db } from "mongodb";
import { errAsync, okAsync } from "neverthrow";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createArgon2PasswordHasher, createDatabaseError, makeRunTransaction, RawSessionToken } from "#infrastructure";
import type { RawActiveUserProfileToken, RawResetPasswordToken } from "#infrastructure";
import type { AppConfig } from "#config";
import { Email } from "@project/shared";
import type {
  HashActiveUserProfileToken,
  HashResetPasswordToken,
  HashSessionToken,
  SessionId,
  UserId,
} from "@project/shared";
import { createSessionFactory } from "../_domain/session/session.js";
import { createUserFactory } from "../_domain/user/user.js";
import { makeEnsureUserIndexes } from "../_infra/mongo/user-indexes.js";
import type { SessionStore } from "../_infra/redis/SessionStore.js";
import type { SessionDb } from "../_persistence/session.db.js";
import type { UserDb } from "../_persistence/user.db.js";
import { createSessionRepository } from "../_repo/mongo-session-repository.js";
import { createUserRepository } from "../_repo/mongo-user-repository.js";
import { createRegisterHandler, type RegisterCommand } from "./handler.js";

const uri = process.env.TEST_MONGO_URI;

if (!uri || !/localhost|127\.0\.0\.1/.test(uri)) {
  throw new Error("TEST_MONGO_URI must point to a local test MongoDB");
}

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const randomHex = () => randomBytes(32).toString("hex");
const dbName = `register_test_${randomUUID()}`;
let client: MongoClient;
let db: Db;
let usersCollection: Collection<UserDb>;
let sessionsCollection: Collection<SessionDb>;

beforeAll(async () => {
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  usersCollection = db.collection<UserDb>("users");
  sessionsCollection = db.collection<SessionDb>("sessions");
  await db.createCollection("sessions");
  await makeEnsureUserIndexes(usersCollection)();
}, 120_000);

afterAll(async () => {
  await db?.dropDatabase();
  await client?.close();
});

beforeEach(async () => {
  await Promise.all([usersCollection.deleteMany({}), sessionsCollection.deleteMany({})]);
});

const command = (overrides: Partial<RegisterCommand> = {}): RegisterCommand => ({
  email: Email("ada@example.com"),
  firstName: "Ada",
  lastName: "Lovelace",
  password: "correct-horse-battery",
  rawUserAgent: "Integration Test Browser",
  deviceInfo: "Chrome on Linux",
  ...overrides,
});

const buildHandler = (overrides: { sessionRepository?: ReturnType<typeof createSessionRepository> } = {}) => {
  const sessionStore = { set: vi.fn(() => okAsync(undefined)) } as unknown as SessionStore;

  const handler = createRegisterHandler({
    userRepository: createUserRepository({ usersCollection }),
    sessionRepository:
      overrides.sessionRepository ?? createSessionRepository({ sessionCollection: sessionsCollection }),
    runTransaction: makeRunTransaction(client),
    passwordHasher: createArgon2PasswordHasher(),
    userFactory: createUserFactory(
      () => new ObjectId().toHexString() as UserId,
      () => randomHex() as RawActiveUserProfileToken,
      (token) => sha256(token) as HashActiveUserProfileToken,
      () => randomHex() as RawResetPasswordToken,
      (token) => sha256(token) as HashResetPasswordToken,
    ),
    sessionFactory: createSessionFactory(
      { slidingWindowHours: 24, maxAgeDays: 14 } as AppConfig["session"],
      () => new ObjectId().toHexString() as SessionId,
      () => RawSessionToken(randomHex()),
      (token) => sha256(token) as HashSessionToken,
    ),
    sessionStore,
  });

  return { handler, sessionStore };
};

describe("register flow with a real MongoDB", () => {
  it("has the unique email index", async () => {
    await expect(usersCollection.indexExists("unique_user_email")).resolves.toBe(true);
  });

  it("persists the user and session and stores only a hashed password", async () => {
    const { handler, sessionStore } = buildHandler();

    const result = await handler(command());

    expect(result.isOk()).toBe(true);
    expect(await usersCollection.countDocuments({})).toBe(1);
    expect(await sessionsCollection.countDocuments({})).toBe(1);
    expect(sessionStore.set).toHaveBeenCalledOnce();

    const userDoc = await usersCollection.findOne({});
    expect(JSON.stringify(userDoc)).toContain("$argon2");
    expect(JSON.stringify(userDoc)).not.toContain("correct-horse-battery");
  });

  it("rejects a second registration with the same email and leaves a single user", async () => {
    const { handler } = buildHandler();
    await handler(command());

    const result = await handler(command());

    expect(result._unsafeUnwrapErr()).toMatchObject({ _tag: "UserAlreadyExistsError" });
    expect(await usersCollection.countDocuments({})).toBe(1);
    expect(await sessionsCollection.countDocuments({})).toBe(1);
  });

  it("lets exactly one of two concurrent registrations with the same email win", async () => {
    const { handler } = buildHandler();

    const results = await Promise.all([handler(command()), handler(command())]);

    const oks = results.filter((r) => r.isOk());
    const errs = results.filter((r) => r.isErr());
    expect(oks).toHaveLength(1);
    expect(errs).toHaveLength(1);
    expect(await usersCollection.countDocuments({ email: "ada@example.com" })).toBe(1);
    expect(await sessionsCollection.countDocuments({})).toBe(1);

    expect(errs[0]!._unsafeUnwrapErr()._tag).toBe("UserAlreadyExistsError");
  });

  it("rolls back the user when the session insert fails", async () => {
    const failingSessionRepository = {
      ...createSessionRepository({ sessionCollection: sessionsCollection }),
      create: () => errAsync(createDatabaseError(new Error("session insert failed"))),
    };
    const { handler, sessionStore } = buildHandler({ sessionRepository: failingSessionRepository });

    const result = await handler(command());

    expect(result._unsafeUnwrapErr()).toMatchObject({ _tag: "DatabaseError" });
    expect(await usersCollection.countDocuments({})).toBe(0);
    expect(await sessionsCollection.countDocuments({})).toBe(0);
    expect(sessionStore.set).not.toHaveBeenCalled();
  });
});
