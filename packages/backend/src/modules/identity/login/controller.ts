import type { Request, Response } from "express";
import { Email, LoginRequestSchema, createUnauthorizedError } from "@project/shared";
import { match } from "ts-pattern";
import { getShortDeviceDescription } from "#infrastructure";
import { logger } from "#http";
import type { LoginHandler } from "./handler.js";
import type { DatabaseError, MappingError, PasswordVerificationError } from "#infrastructure";
import type { UserNotFoundError } from "../_domain/user/user.errors.js";
import type { SetSessionCookie } from "#helpers";

type Dependencies = {
  loginHandler: LoginHandler;
  setSessionCookie: SetSessionCookie;
};

type LoginError = UserNotFoundError | DatabaseError | MappingError | PasswordVerificationError;

export const createLoginController =
  ({ loginHandler, setSessionCookie }: Dependencies) =>
  async (req: Request, res: Response): Promise<void> => {
    const command = LoginRequestSchema.safeParse(req.body);
    if (!command.success) {
      res.status(400).json({
        error: "ValidationFailed",
        details: command.error,
      });
      return;
    }

    const rawUserAgent = req.get("user-agent") ?? null;
    const deviceInfo = getShortDeviceDescription(rawUserAgent);

    await loginHandler({
      ...command.data,
      email: Email(command.data.email),
      rawUserAgent,
      deviceInfo,
    }).match(
      (rawToken) => {
        setSessionCookie(res, rawToken);
        res.status(200).json({ message: "User logged in" });
      },
      (error: LoginError) => {
        match(error)
          .with({ _tag: "UserNotFoundError" }, () =>
            res.status(401).json(createUnauthorizedError("Invalid email or password.", "INVALID_CREDENTIALS")),
          )
          .with({ _tag: "PasswordVerificationError" }, (e) => {
            logger.error(e.cause, "Password verification error:");
            res.status(500).json({ error: "Internal server error." });
          })
          .with({ _tag: "DatabaseError" }, (e) => {
            logger.error(e.cause, "DB Error:");
            res.status(500).json({ error: "Internal server error." });
          })
          .with({ _tag: "MappingError" }, (e) => {
            logger.error(e.cause, "DB Error:");
            res.status(500).json({ error: "Internal server error." });
          })
          .exhaustive();
      },
    );
  };
