import type { Request, Response } from "express";
import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";
import { RawSessionToken } from "#infrastructure";
import type { DatabaseError, MappingError, PasswordVerificationError } from "#infrastructure";
import type { SetSessionCookie } from "#helpers";
import type { LoginHandler } from "./handler.js";
import { createLoginController } from "./controller.js";

const validBody = { email: "ada@example.com", password: "correct-horse-battery" };
const userAgent =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const createRequestResponse = (body: unknown, requestUserAgent: string | null = userAgent) => {
  const req = {
    body,
    get: vi.fn(() => requestUserAgent ?? undefined),
  } as unknown as Request;
  const status = vi.fn().mockReturnThis();
  const json = vi.fn().mockReturnThis();
  const res = { status, json } as unknown as Response;

  return { req, res, status, json };
};

describe("login controller", () => {
  it("validates the request, calls the handler, sets the session cookie, and returns 200", async () => {
    const rawToken = RawSessionToken("session-token");
    const loginHandler = vi.fn<LoginHandler>(() => okAsync(rawToken));
    const setSessionCookie = vi.fn<SetSessionCookie>();
    const { req, res, status, json } = createRequestResponse(validBody);
    const controller = createLoginController({ loginHandler, setSessionCookie });

    await controller(req, res);

    expect(loginHandler).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "correct-horse-battery",
      rawUserAgent: userAgent,
      deviceInfo: "Chrome on Linux",
    });
    expect(setSessionCookie).toHaveBeenCalledOnce();
    expect(setSessionCookie).toHaveBeenCalledWith(res, rawToken);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ message: "User logged in" });
  });

  it("returns 400 and skips the handler for an invalid request", async () => {
    const loginHandler = vi.fn<LoginHandler>();
    const setSessionCookie = vi.fn<SetSessionCookie>();
    const { req, res, status, json } = createRequestResponse({ email: "invalid", password: "short" });
    const controller = createLoginController({ loginHandler, setSessionCookie });

    await controller(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: "ValidationFailed" }));
    expect(loginHandler).not.toHaveBeenCalled();
    expect(setSessionCookie).not.toHaveBeenCalled();
  });

  it("returns 401 for invalid credentials without setting the cookie", async () => {
    const loginHandler = vi.fn<LoginHandler>(() =>
      errAsync({ _tag: "UserNotFoundError", id: "ada@example.com", message: "User not found" }),
    );
    const setSessionCookie = vi.fn<SetSessionCookie>();
    const { req, res, status, json } = createRequestResponse(validBody);
    const controller = createLoginController({ loginHandler, setSessionCookie });

    await controller(req, res);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      _tag: "UnauthorizedError",
      message: "Invalid email or password.",
      reason: "INVALID_CREDENTIALS",
    });
    expect(setSessionCookie).not.toHaveBeenCalled();
  });

  it.each([
    {
      description: "a database error",
      error: { _tag: "DatabaseError", message: "Database unavailable" } satisfies DatabaseError,
    },
    {
      description: "a mapping error",
      error: {
        _tag: "MappingError",
        message: "Failed to map user",
        entityName: "User",
        entityId: "user-id",
        cause: new Error("invalid user document"),
      } satisfies MappingError,
    },
    {
      description: "a password verification error",
      error: {
        _tag: "PasswordVerificationError",
        message: "Password verification failed",
        cause: new Error("verification failed"),
      } satisfies PasswordVerificationError,
    },
  ])("returns 500 for $description", async ({ error }) => {
    const loginHandler = vi.fn<LoginHandler>(() => errAsync(error));
    const setSessionCookie = vi.fn<SetSessionCookie>();
    const { req, res, status, json } = createRequestResponse(validBody);
    const controller = createLoginController({ loginHandler, setSessionCookie });

    await controller(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: "Internal server error." });
    expect(setSessionCookie).not.toHaveBeenCalled();
  });
});
