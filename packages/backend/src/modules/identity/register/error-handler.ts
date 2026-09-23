import type { Request, Response } from "express";
import type { RegisterError } from "./controller.js";
import { match } from "ts-pattern";
import { logger } from "#http";

export const handleRegisterError = (res: Response, error: RegisterError) => {
  match(error)
    .with({ _tag: "UserAlreadyExistsError" }, (e) =>
      res.status(409).json({ error: e.message }),
    )
    .with({ _tag: "PasswordHashingError" }, (e) =>
      res.status(400).json({ error: e.message }),
    )
    .with({ _tag: "DatabaseError" }, (e) => {
      logger.error(e.cause, "DB Error:");
      res.status(500).json({ error: "Internal server error." });
    })
    .with({ _tag: "MappingError" }, (e) => {
      logger.error(e.cause, "DB Error:");
      res.status(500).json({ error: "Internal server error." });
    })
    .exhaustive();
};
