import type { Request, Response } from "express";
import { RegisterRequestSchema } from "@project/shared";

type Dependencies = {
  registerHandler: (command: any) => Promise<any>;
};

export const createRegisterController =
  ({ registerHandler }: Dependencies) =>
  async (req: Request, res: Response) => {
    const command = RegisterRequestSchema.parse(req.body);

    const result = await registerHandler(command);
    console.log("done");
    res.status(201);
    //.json(result);
  };
