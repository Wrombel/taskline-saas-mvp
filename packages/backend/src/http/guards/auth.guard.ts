import type { RequestHandler } from "express";
import { RawSessionToken } from "#infrastructure";
import { createUnauthorizedError } from "@project/shared";
import type { Authenticate } from "../../modules/identity/authenticate/authenticateSessionUseCase.js";

export const createAuthGuard =
  (authenticate: Authenticate): RequestHandler =>
  async (req, res, next) => {
    const token = req.signedCookies?.sessionId;

    if (typeof token !== "string") {
      res.status(401).json(createUnauthorizedError());
      return;
    }

    const result = await authenticate(RawSessionToken(token));

    if (result.isErr()) {
      next(result.error);
      return;
    }

    if (!result.value) {
      res.clearCookie("sessionId", { path: "/" });
      res.status(401).json(createUnauthorizedError());
      return;
    }

    req.auth = result.value.authContext;
    next();
  };
