import { createHash, randomBytes, randomUUID } from "node:crypto";
import { MongoClient, ObjectId } from "mongodb";
import type { Collection, Db } from "mongodb";
import { errAsync, okAsync } from "neverthrow";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createArgon2PasswordHasher,
  createDatabaseError,
  RawSessionToken,
} from "#infrastructure";
import type { AppConfig } from "#config";
import { Email } from "@project/shared";
import type { HashSessionToken, SessionId, UserId } from "@project/shared";
import { createSessionFactory } from "../_domain/session/session.js";
import type { SessionStore } from "../_infra/redis/SessionStore.js";
import type { SessionDb } from "../_persistence/session.db.js";
import type { UserDb } from "../_persistence/user.db.js";
import { createSessionRepository } from "../_repo/mongo-session-repository.js";
import { createUserRepository } from "../_repo/mongo-user-repository.js";
import { createLoginHandler, type LoginCommand } from "./handler.js";

const uri = process.env.TEST_MONGO_URI;

if (!uri || !/localhost|127\.0\.0\.1/.test(uri)) {
  throw new Error("TEST_MONGO_URI must point to a local test MongoDB");
}

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const randomHex = () => randomBytes(32).toString("hex");
const dbName = `login_test_${randomUUID()}`;
const password = "correct-horse-battery";
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
}, 120_000);

afterAll(async () => {
  await db?.dropDatabase();
  await client?.close();
});

beforeEach(async () => {
  await Promise.all([usersCollection.deleteMany({}), sessionsCollection.deleteMany({})]);
});

const command = (overrides: Partial<LoginCommand> = {}): LoginCommand => ({
  email: Email("ada@example.com"),
  password,
  rawUserAgent: "Integration Test Browser",
  deviceInfo: "Chrome on Linux",
  ...overrides,
});

const buildHandler = (overrides: { sessionRepository?: ReturnType<typeof createSessionRepository> } = {}) => {
  const sessionStore = { set: vi.fn(() => okAsync(undefined)) } as unknown as SessionStore;
  const rawToken = RawSessionToken(randomHex());
  const handler = createLoginHandler({
    userRepository: createUserRepository({ usersCollection }),
    sessionRepository:
      overrides.sessionRepository ?? createSessionRepository({ sessionCollection: sessionsCollection }),
    passwordHasher: createArgon2PasswordHasher(),
    sessionFactory: createSessionFactory(
      { slidingWindowHours: 24, maxAgeDays: 14 } as AppConfig["session"],
      () => new ObjectId().toHexString() as SessionId,
      () => rawToken,
      (token) => sha256(token) as HashSessionToken,
    ),
    sessionStore,
  });

  return { handler, sessionStore, rawToken };
};

const seedUser = async (state: UserDb["state"] = "active") => {
  const hashedPassword = await createArgon2PasswordHasher().hash(password);
  if (hashedPassword.isErr()) throw hashedPassword.error;

  const userId = new ObjectId();
  await usersCollection.insertOne({
    _id: userId,
    email: "ada@example.com",
    fullName: { firstName: "Ada", lastName: "Lovelace" },
    hashedPassword: hashedPassword.value,
    sessionVersion: 1,
    state,
    passwordTokenHash: null,
    passwordTokenExpiresAt: null,
    profileTokenHash: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return userId;
};

describe("login flow with a real MongoDB", () => {
  it("authenticates the user, persists a session, and stores it in Redis", async () => {
    const userId = await seedUser();
    const { handler, sessionStore, rawToken } = buildHandler();

    const result = await handler(command());

    expect(result._unsafeUnwrap()).toBe(rawToken);
    expect(await sessionsCollection.countDocuments({})).toBe(1);
    expect(sessionStore.set).toHaveBeenCalledOnce();

    const session = await sessionsCollection.findOne({});
    expect(session?.userId.toString()).toBe(userId.toHexString());
    expect(session?.sessionHash).toBe(sha256(rawToken));
    expect(sessionStore.set).toHaveBeenCalledWith(session?.sessionHash, expect.objectContaining({
      userId: userId.toHexString(),
      cachedSessionVersion: 1,
    }));
  });

  it("rejects an unknown email without creating a session", async () => {
    const { handler, sessionStore } = buildHandler();

    const result = await handler(command());

    expect(result._unsafeUnwrapErr()).toMatchObject({ _tag: "UserNotFoundError" });
    expect(await sessionsCollection.countDocuments({})).toBe(0);
    expect(sessionStore.set).not.toHaveBeenCalled();
  });

  it("rejects an incorrect password without creating a session", async () => {
    await seedUser();
    const { handler, sessionStore } = buildHandler();

    const result = await handler(command({ password: "incorrect-password" }));

    expect(result._unsafeUnwrapErr()).toMatchObject({ _tag: "UserNotFoundError" });
    expect(await sessionsCollection.countDocuments({})).toBe(0);
    expect(sessionStore.set).not.toHaveBeenCalled();
  });

  it("does not authenticate deactivated users", async () => {
    await seedUser("deactivated");
    const { handler } = buildHandler();

    const result = await handler(command());

    expect(result._unsafeUnwrapErr()).toMatchObject({ _tag: "UserNotFoundError" });
    expect(await sessionsCollection.countDocuments({})).toBe(0);
  });

  it("does not cache a session when persisting it fails", async () => {
    await seedUser();
    const sessionRepository = {
      ...createSessionRepository({ sessionCollection: sessionsCollection }),
      create: () => errAsync(createDatabaseError(new Error("session insert failed"))),
    };
    const { handler, sessionStore } = buildHandler({ sessionRepository });

    const result = await handler(command());

    expect(result._unsafeUnwrapErr()).toMatchObject({ _tag: "DatabaseError" });
    expect(await sessionsCollection.countDocuments({})).toBe(0);
    expect(sessionStore.set).not.toHaveBeenCalled();
  });
});
