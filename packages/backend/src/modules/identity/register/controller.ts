import type { Request, Response } from "express";
import { RegisterRequestSchema } from "@project/shared";
import { Email } from "@project/shared";
import { match } from "ts-pattern";
import { getShortDeviceDescription } from "#infrastructure";
import type { RegisterHandler } from "./handler.js";
import type { DatabaseError, MappingError, PasswordHashingError } from "#infrastructure";
import type { SetSessionCookie } from "#helpers";
import type { UserAlreadyExistsError } from "../_domain/user/user.errors.js";
import { logger } from "#http";
type Dependencies = {
  registerHandler: RegisterHandler;
  setSessionCookie: SetSessionCookie;
};
export type RegisterError = UserAlreadyExistsError | DatabaseError | MappingError | PasswordHashingError;

export const createRegisterController =
  ({ registerHandler, setSessionCookie }: Dependencies) =>
  async (req: Request, res: Response): Promise<void> => {
    const command = RegisterRequestSchema.safeParse(req.body);
    if (!command.success) {
      res.status(400).json({
        error: "ValidationFailed",
        details: command.error,
      });
      return;
    }
    const rawUserAgent = req.get("user-agent") ?? null;
    const deviceInfo = getShortDeviceDescription(rawUserAgent);

    await registerHandler({
      ...command.data,
      email: Email(command.data.email),
      rawUserAgent,
      deviceInfo,
    }).match(
      (rawToken) => {
        setSessionCookie(res, rawToken);
        res.status(201).json({ message: "User registered" });
      },
      (error: RegisterError) => {
        match(error)
          .with({ _tag: "UserAlreadyExistsError" }, (e) => res.status(409).json({ error: e.message }))
          .with({ _tag: "PasswordHashingError" }, (e) => res.status(500).json({ error: "Internal server error." }))
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
