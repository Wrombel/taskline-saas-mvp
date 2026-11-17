import type { Request, Response } from "express";
import { RawSessionToken } from "#infrastructure";
import { createUnauthorizedError } from "@project/shared";
import { match } from "ts-pattern";
import { logger } from "#http";
import type { DatabaseError } from "#infrastructure";
import type { LogoutHandler } from "./handler.js";

type Dependencies = {
  logoutHandler: LogoutHandler;
};

type LogoutError = DatabaseError;

export const createLogoutController =
  ({ logoutHandler }: Dependencies) =>
  async (req: Request, res: Response): Promise<void> => {
    const token = req.signedCookies?.sessionId;
    if (typeof token !== "string") {
      res.clearCookie("sessionId", { path: "/" });
      res.status(401).json(createUnauthorizedError());
      return;
    }

    await logoutHandler(RawSessionToken(token)).match(
      () => {
        res.clearCookie("sessionId", { path: "/" });
        res.status(200).json({ message: "Logged out" });
      },
      (error: LogoutError) => {
        res.clearCookie("sessionId", { path: "/" });
        match(error)
          .with({ _tag: "DatabaseError" }, (e) => {
            logger.error(e.cause, "DB Error:");
            res.status(500).json({ error: "Internal server error." });
          })
          .exhaustive();
      },
    );
  };
