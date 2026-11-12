import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import type { Session, UserId, SessionId, HashSessionToken } from "@project/shared";
import type { RawSessionToken } from "#infrastructure";
import type { SessionRedis } from "../_persistence/session.redis.js";
import { createAuthenticateSessionUseCase } from "./authenticateSessionUseCase.js";

const now = new Date("2026-11-04T10:00:00.000Z");
const hash = "session-hash" as HashSessionToken;
const rawToken = "raw-session-token" as RawSessionToken;
const userId = "user-1" as UserId;
const sessionId = "session-1" as SessionId;
const expiresAt = new Date("2026-11-05T10:00:00.000Z");
const maxExpiresAt = new Date("2026-12-04T10:00:00.000Z");

const session: Session = {
  id: sessionId,
  userId,
  sessionHash: hash,
  rawUserAgent: null,
  deviceInfo: "Test browser",
  tenantContext: null,
  version: 1 as Session["version"],
  createdAt: new Date("2026-11-01T10:00:00.000Z"),
  expiresAt,
  maxExpiresAt,
};

const cachedSession: SessionRedis = {
  sessionId,
  userId,
  tenantContext: null,
  cachedSessionVersion: session.version,
  expiresAt,
  maxExpiresAt,
};

const createUseCase = (overrides: Record<string, unknown> = {}) => {
  const mocks = {
    hashToken: vi.fn(() => hash),
    sessionStore: {
      get: vi.fn(() => okAsync(cachedSession)),
      set: vi.fn(() => okAsync(undefined)),
    },
    sessionRepository: {
      findActiveByHash: vi.fn(() => okAsync(session)),
      slide: vi.fn(() => okAsync(true)),
    },
    userRepository: {
      findAuthState: vi.fn(() => okAsync({ state: "active", sessionVersion: session.version })),
    },
    now: vi.fn(() => now),
    calculateSlidingExpiration: vi.fn(() => null),
    ...overrides,
  };

  return {
    authenticate: createAuthenticateSessionUseCase(
      mocks as unknown as Parameters<typeof createAuthenticateSessionUseCase>[0],
    ),
    mocks,
  };
};

describe("createAuthenticateSessionUseCase", () => {
  it("authenticates a valid cached session without querying Mongo", async () => {
    const { authenticate, mocks } = createUseCase();

    const result = await authenticate(rawToken);

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({
      authContext: { userId, sessionId, tenantContext: null },
    });
    expect(mocks.hashToken).toHaveBeenCalledWith(rawToken);
    expect(mocks.sessionRepository.findActiveByHash).not.toHaveBeenCalled();
    expect(mocks.sessionStore.set).not.toHaveBeenCalled();
  });

  it("loads a missing cache entry from Mongo and caches the session", async () => {
    const { authenticate, mocks } = createUseCase({
      sessionStore: {
        get: vi.fn(() => okAsync(null)),
        set: vi.fn(() => okAsync(undefined)),
      },
    });

    const result = await authenticate(rawToken);

    expect(result._unsafeUnwrap()).toEqual({ authContext: { userId, sessionId, tenantContext: null } });
    expect(mocks.sessionRepository.findActiveByHash).toHaveBeenCalledWith(hash, now);
    expect(mocks.sessionStore.set).toHaveBeenCalledWith(hash, cachedSession);
  });

  it("returns null when no active session exists", async () => {
    const { authenticate, mocks } = createUseCase({
      sessionStore: { get: vi.fn(() => okAsync(null)), set: vi.fn(() => okAsync(undefined)) },
      sessionRepository: {
        findActiveByHash: vi.fn(() => okAsync(null)),
        slide: vi.fn(() => okAsync(true)),
      },
    });

    const result = await authenticate(rawToken);

    expect(result._unsafeUnwrap()).toBeNull();
    expect(mocks.userRepository.findAuthState).not.toHaveBeenCalled();
  });

  it.each([
    { description: "expired", session: { ...cachedSession, expiresAt: now } },
    { description: "past its maximum lifetime", session: { ...cachedSession, maxExpiresAt: now } },
  ])("rejects a cached session that is $description", async ({ session: invalidSession }) => {
    const { authenticate, mocks } = createUseCase({
      sessionStore: {
        get: vi.fn(() => okAsync(invalidSession)),
        set: vi.fn(() => okAsync(undefined)),
      },
    });

    const result = await authenticate(rawToken);

    expect(result._unsafeUnwrap()).toBeNull();
    expect(mocks.userRepository.findAuthState).not.toHaveBeenCalled();
  });

  it.each([
    { description: "missing", user: null },
    { description: "a different session version", user: { state: "active", sessionVersion: 2 } },
    { description: "disabled", user: { state: "disabled", sessionVersion: session.version } },
  ])("rejects a session when the auth state is $description", async ({ user }) => {
    const { authenticate } = createUseCase({
      userRepository: { findAuthState: vi.fn(() => okAsync(user)) },
    });

    const result = await authenticate(rawToken);

    expect(result._unsafeUnwrap()).toBeNull();
  });

  it("slides expiration and updates cache when sliding succeeds", async () => {
    const nextExpiresAt = new Date("2026-11-06T10:00:00.000Z");
    const { authenticate, mocks } = createUseCase({
      calculateSlidingExpiration: vi.fn(() => nextExpiresAt),
    });

    const result = await authenticate(rawToken);

    expect(result._unsafeUnwrap()).toEqual({ authContext: { userId, sessionId, tenantContext: null } });
    expect(mocks.sessionRepository.slide).toHaveBeenCalledWith(sessionId, nextExpiresAt, now);
    expect(mocks.sessionStore.set).toHaveBeenCalledWith(hash, { ...cachedSession, expiresAt: nextExpiresAt });
  });

  it("maps dependency failures to AuthenticationUnavailable", async () => {
    const cause = new Error("Redis unavailable");
    const { authenticate } = createUseCase({
      sessionStore: { get: vi.fn(() => errAsync(cause)), set: vi.fn(() => okAsync(undefined)) },
    });

    const result = await authenticate(rawToken);

    expect(result._unsafeUnwrapErr()).toEqual({ _tag: "AuthenticationUnavailable", cause });
  });
});
