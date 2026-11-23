import cookieParser from "cookie-parser";
import express from "express";
import type { ClientSession } from "mongodb";
import { okAsync } from "neverthrow";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSetSessionCookie } from "#helpers";
import type { AppConfig } from "#config";
import type { PasswordHasher, RunTransaction } from "#infrastructure";
import type { Email, HashedPassword, User, UserId, Session } from "@project/shared";
import type { SessionFactory } from "../_domain/session/session.js";
import type { UserFactory } from "../_domain/user/user.js";
import type { SessionStore } from "../_infra/redis/SessionStore.js";
import type { SessionRepository } from "../_repo/session-repository.js";
import type { UserRepository } from "../_repo/user-repository.js";
import { createRegisterController } from "./controller.js";
import { createRegisterHandler } from "./handler.js";

const testCookieSecret = "integration-test-cookie-secret-long-enough";
const servers: Server[] = [];

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        }),
    ),
  );
});

const listen = async (app: express.Express): Promise<string> => {
  const server = createServer(app);
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
};

describe("POST /register integration", () => {
  it("creates a user and session, returns 201, and sets a signed session cookie", async () => {
    const users = new Map<string, User>();
    const sessions: Session[] = [];

    const userRepository = {
      existsByEmail: vi.fn((email: string) => okAsync(users.has(email))),
      create: vi.fn((user: User) => {
        users.set(user.email, user);
        return okAsync(undefined);
      }),
    } as unknown as UserRepository;
    const sessionRepository = {
      create: vi.fn((session: Session) => {
        sessions.push(session);
        return okAsync(undefined);
      }),
    } as unknown as SessionRepository;
    const passwordHasher = {
      hash: vi.fn((password: string) => okAsync(`hashed:${password}`)),
    } as unknown as PasswordHasher;
    const runTransaction: RunTransaction = (action) => action({} as ClientSession);
    const userFactory = {
      prepareUser: vi.fn(
        (
          personalInfo: { firstName: string; lastName: string },
          hashedPassword: HashedPassword,
          email: Email,
        ) => ({
          rawProfileToken: "profile-token",
          user: {
            id: "user-id" as UserId,
            email,
            fullName: personalInfo,
            ownedTenantCount: 0,
            hashedPassword,
            sessionVersion: 1,
          } as User,
        }),
      ),
    } as unknown as UserFactory;
    const sessionFactory = {
      prepareSession: vi.fn((userId: UserId, rawUserAgent: string | null, deviceInfo: string) => ({
        rawToken: "raw-session-token",
        session: {
          id: "session-id",
          userId,
          sessionHash: "session-hash",
          rawUserAgent,
          deviceInfo,
          tenantContext: null,
          expiresAt: new Date(Date.now() + 60_000),
        } as unknown as Session,
      })),
    } as unknown as SessionFactory;
    const sessionStore = { set: vi.fn(() => okAsync(undefined)) } as unknown as SessionStore;

    const registerHandler = createRegisterHandler({
      userRepository,
      sessionRepository,
      runTransaction,
      passwordHasher,
      userFactory,
      sessionFactory,
      sessionStore,
    });
    const config = {
      server: { env: "test" },
      session: { maxAgeDays: 14 },
      cookie: { secret: testCookieSecret },
    } as AppConfig;
    const app = express();
    app.use(express.json());
    app.use(cookieParser(config.cookie.secret));
    app.post(
      "/register",
      createRegisterController({
        registerHandler,
        setSessionCookie: createSetSessionCookie(config),
      }),
    );
    const baseUrl = await listen(app);

    const response = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "Integration Test Browser",
      },
      body: JSON.stringify({
        email: "  ADA@EXAMPLE.COM ",
        firstName: "Ada",
        lastName: "Lovelace",
        password: "correct-horse-battery",
      }),
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ message: "User registered" });
    expect(response.headers.get("set-cookie")).toMatch(/sessionId=s%3Araw-session-token\./);
    expect(response.headers.get("set-cookie")).toMatch(/HttpOnly/i);
    expect(response.headers.get("set-cookie")).toMatch(/SameSite=Lax/i);
    expect(userRepository.existsByEmail).toHaveBeenCalledWith("ada@example.com");
    expect(userRepository.create).toHaveBeenCalledOnce();
    expect(users.get("ada@example.com")?.hashedPassword).toBe("hashed:correct-horse-battery");
    expect(passwordHasher.hash).toHaveBeenCalledWith("correct-horse-battery");
    expect(sessionRepository.create).toHaveBeenCalledOnce();
    expect(sessions).toHaveLength(1);
    expect(sessionStore.set).toHaveBeenCalledOnce();

    const duplicateResponse = await fetch(`${baseUrl}/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "ada@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
        password: "correct-horse-battery",
      }),
    });

    expect(duplicateResponse.status).toBe(409);
    await expect(duplicateResponse.json()).resolves.toEqual({
      error: "User with email ada@example.com already exists.",
    });
    expect(passwordHasher.hash).toHaveBeenCalledOnce();
    expect(sessionRepository.create).toHaveBeenCalledOnce();
  });
});
