import { createHash, randomBytes, randomUUID } from "node:crypto";
import { MongoClient, ObjectId } from "mongodb";
import type { Collection, Db } from "mongodb";
import { errAsync, okAsync } from "neverthrow";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { RawSessionToken } from "#infrastructure";
import type { HashSessionToken } from "@project/shared";
import type { SessionStore } from "../_infra/redis/SessionStore.js";
import type { SessionDb } from "../_persistence/session.db.js";
import { createSessionRepository } from "../_repo/mongo-session-repository.js";
import { createLogoutHandler } from "./handler.js";

const uri = process.env.TEST_MONGO_URI;

if (!uri || !/localhost|127\.0\.0\.1/.test(uri)) {
  throw new Error("TEST_MONGO_URI must point to a local test MongoDB");
}

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
const randomHex = () => randomBytes(32).toString("hex");
const dbName = `logout_test_${randomUUID()}`;
let client: MongoClient;
let db: Db;
let sessionsCollection: Collection<SessionDb>;

beforeAll(async () => {
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  sessionsCollection = db.collection<SessionDb>("sessions");
}, 120_000);

afterAll(async () => {
  await db?.dropDatabase();
  await client?.close();
});

beforeEach(async () => {
  await sessionsCollection.deleteMany({});
});

const buildHandler = (invalidate: SessionStore["invalidate"] = vi.fn(() => okAsync(undefined))) =>
  createLogoutHandler({
    hashToken: (token) => sha256(token) as HashSessionToken,
    sessionRepository: createSessionRepository({ sessionCollection: sessionsCollection }),
    sessionStore: { invalidate } as unknown as SessionStore,
  });

const insertSession = async (sessionHash: string) => {
  const now = new Date();
  await sessionsCollection.insertOne({
    _id: new ObjectId(),
    userId: new ObjectId(),
    sessionHash,
    rawUserAgent: "Integration Test Browser",
    deviceInfo: "Chrome on Linux",
    tenantContext: null,
    createdAt: now,
    expiresAt: new Date(now.getTime() + 60_000),
    version: 1,
    maxExpiresAt: new Date(now.getTime() + 3_600_000),
  });
};

describe("logout flow with a real MongoDB", () => {
  it("revokes the matching session and invalidates its cache entry", async () => {
    const rawToken = RawSessionToken(randomHex());
    const sessionHash = sha256(rawToken);
    const otherSessionHash = sha256(randomHex());
    await insertSession(sessionHash);
    await insertSession(otherSessionHash);
    const invalidate = vi.fn(() => okAsync(undefined));
    const handler = buildHandler(invalidate);

    const result = await handler(rawToken);

    expect(result.isOk()).toBe(true);
    expect(await sessionsCollection.countDocuments({})).toBe(1);
    expect(await sessionsCollection.findOne({ sessionHash })).toBeNull();
    expect(await sessionsCollection.findOne({ sessionHash: otherSessionHash })).not.toBeNull();
    expect(invalidate).toHaveBeenCalledOnce();
    expect(invalidate).toHaveBeenCalledWith(sessionHash);
  });

  it("still completes logout when cache invalidation fails", async () => {
    const rawToken = RawSessionToken(randomHex());
    const sessionHash = sha256(rawToken);
    await insertSession(sessionHash);
    const invalidate = vi.fn(() =>
      errAsync({
        type: "REDIS_ERROR" as const,
        operation: "DEL",
        key: sessionHash,
        cause: new Error("Redis unavailable"),
      }),
    );
    const handler = buildHandler(invalidate as SessionStore["invalidate"]);

    const result = await handler(rawToken);

    expect(result.isOk()).toBe(true);
    expect(await sessionsCollection.findOne({ sessionHash })).toBeNull();
    expect(invalidate).toHaveBeenCalledWith(sessionHash);
  });
});
