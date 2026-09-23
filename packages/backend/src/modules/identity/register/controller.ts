import type { Request, Response } from "express";
import { RegisterRequestSchema } from "@project/shared";
import { handleRegisterError } from "./error-handler.js";
import type { RegisterHandler } from "./handler.js";
import type { DatabaseError, MappingError } from "#infrastructure";
import type { PasswordHashingError } from "#infrastructure";
import type { UserAlreadyExistsError } from "../_domain/user/user.errors.js";
type Dependencies = {
  registerHandler: RegisterHandler;
};
export type RegisterError = UserAlreadyExistsError | DatabaseError | MappingError | PasswordHashingError;

export const createRegisterController =
  ({ registerHandler }: Dependencies) =>
  async (req: Request, res: Response): Promise<void> => {
    const command = RegisterRequestSchema.safeParse(req.body);
    if (!command.success) {
      res.status(400).json({
        error: "ValidationFailed",
        details: command.error,
      });
      return;
    }
    await registerHandler(command.data).match(
      () => {
        res.status(201).json({ message: "User registered" });
      },
      (error: RegisterError) => {
        handleRegisterError(res, error);
      },
    );
  };
