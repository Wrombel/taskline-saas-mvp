import type { Response } from "express";
import type { RawSessionToken } from "#infrastructure";
import type { AppConfig } from "#config";
export type SetSessionCookie = (res: Response, rawToken: RawSessionToken) => void;
export const createSetSessionCookie =
  (config: AppConfig): SetSessionCookie =>
  (res, rawToken) => {
    res.cookie("sessionId", rawToken, {
      httpOnly: true,
      secure: config.server.env === "production",
      sameSite: "lax",
      signed: true,
      maxAge: config.session.maxAgeDays * 24 * 60 * 60 * 1000,
      path: "/",
    });
  };
