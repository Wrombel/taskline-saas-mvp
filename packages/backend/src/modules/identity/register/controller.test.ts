import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { createRegisterController } from "./controller.js";

describe("register controller request validation", () => {
  it.each([
    {
      description: "a malformed email",
      body: { email: "not-an-email", firstName: "Ada", lastName: "Lovelace", password: "password123" },
    },
    {
      description: "a short password",
      body: { email: "ada@example.com", firstName: "Ada", lastName: "Lovelace", password: "short" },
    },
    {
      description: "a missing required field",
      body: { email: "ada@example.com", firstName: "Ada", password: "password123" },
    },

    { description: "an empty body", body: {} },
    { description: "an undefined body", body: undefined },
    { description: "a null body", body: null },

    {
      description: "a missing email",
      body: { firstName: "Ada", lastName: "Lovelace", password: "password123" },
    },
    {
      description: "a missing firstName",
      body: { email: "ada@example.com", lastName: "Lovelace", password: "password123" },
    },
    {
      description: "a missing password",
      body: { email: "ada@example.com", firstName: "Ada", lastName: "Lovelace" },
    },

    {
      description: "a numeric firstName",
      body: { email: "ada@example.com", firstName: 123, lastName: "Lovelace", password: "password123" },
    },
    {
      description: "a numeric lastName",
      body: { email: "ada@example.com", firstName: "Ada", lastName: 123, password: "password123" },
    },
    {
      description: "a null password",
      body: { email: "ada@example.com", firstName: "Ada", lastName: "Lovelace", password: null },
    },
    {
      description: "an array as email",
      body: { email: ["ada@example.com"], firstName: "Ada", lastName: "Lovelace", password: "password123" },
    },
    {
      description: "an object as password",
      body: { email: "ada@example.com", firstName: "Ada", lastName: "Lovelace", password: { value: "password123" } },
    },

    {
      description: "an empty email",
      body: { email: "", firstName: "Ada", lastName: "Lovelace", password: "password123" },
    },
    {
      description: "a whitespace-only firstName",
      body: { email: "ada@example.com", firstName: "   ", lastName: "Lovelace", password: "password123" },
    },
    {
      description: "a whitespace-only lastName",
      body: { email: "ada@example.com", firstName: "Ada", lastName: "   ", password: "password123" },
    },
    {
      description: "an empty password",
      body: { email: "ada@example.com", firstName: "Ada", lastName: "Lovelace", password: "" },
    },

    {
      description: "a password one character below the minimum",
      body: { email: "ada@example.com", firstName: "Ada", lastName: "Lovelace", password: "1234567" },
    },

    {
      description: "an email without a domain",
      body: { email: "ada@", firstName: "Ada", lastName: "Lovelace", password: "password123" },
    },
    {
      description: "an email without a local part",
      body: { email: "@example.com", firstName: "Ada", lastName: "Lovelace", password: "password123" },
    },
    {
      description: "an email with spaces inside",
      body: { email: "ada lovelace@example.com", firstName: "Ada", lastName: "Lovelace", password: "password123" },
    },

    {
      description: "an excessively long firstName",
      body: { email: "ada@example.com", firstName: "A".repeat(500), lastName: "Lovelace", password: "password123" },
    },
    {
      description: "an excessively long password",
      body: { email: "ada@example.com", firstName: "Ada", lastName: "Lovelace", password: "p".repeat(1000) },
    },
  ])("returns 400 for $description", async ({ body }) => {
    const registerHandler = vi.fn();
    const setSessionCookie = vi.fn();
    const status = vi.fn().mockReturnThis();
    const json = vi.fn().mockReturnThis();
    const req = { body } as unknown as Request;
    const res = { status, json } as unknown as Response;

    const controller = createRegisterController({ registerHandler, setSessionCookie });
    await controller(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ error: "ValidationFailed" }));
    expect(registerHandler).not.toHaveBeenCalled();
    expect(setSessionCookie).not.toHaveBeenCalled();
  });
});
