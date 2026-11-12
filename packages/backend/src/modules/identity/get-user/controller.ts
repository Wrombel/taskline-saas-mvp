import type { Request, Response } from "express";
import { createUnauthorizedError } from "@project/shared";
import { match } from "ts-pattern";
import { logger } from "#http";
import type { GetUserHandler } from "./handler.js";
import type { DatabaseError, MappingError } from "#infrastructure";
import type { UserNotFoundError } from "../_domain/user/user.errors.js";

type Dependencies = {
  getUserProfileHandler: GetUserHandler;
};

type GetUserProfileError = DatabaseError | MappingError | UserNotFoundError;

export const createGetUserProfileController =
  ({ getUserProfileHandler }: Dependencies) =>
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json(createUnauthorizedError());
      return;
    }

    await getUserProfileHandler(userId).match(
      (profile) => res.status(200).json(profile),
      (error: GetUserProfileError) =>
        match(error)
          .with({ _tag: "UserNotFoundError" }, (e) => res.status(404).json({ error: e.message }))
          .with({ _tag: "DatabaseError" }, (e) => {
            logger.error(e.cause, "DB Error:");
            return res.status(500).json({ error: "Internal server error." });
          })
          .with({ _tag: "MappingError" }, (e) => {
            logger.error(e.cause, "DB Error:");
            return res.status(500).json({ error: "Internal server error." });
          })
          .exhaustive(),
    );
  };
