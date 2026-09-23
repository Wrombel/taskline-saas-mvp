import { z } from "zod";

export const HashSessionTokenSchema = z.string().brand<"HashSessionToken">();
export const HashResetPasswordTokenSchema = z.string().brand<"HashResetPasswordToken">();
export const HashActiveUserProfileTokenSchema = z.string().brand<"HashActiveUserProfileToken">();

export type HashSessionToken = z.infer<typeof HashSessionTokenSchema>;
export type HashResetPasswordToken = z.infer<typeof HashResetPasswordTokenSchema>;
export type HashActiveUserProfileToken = z.infer<typeof HashActiveUserProfileTokenSchema>;

export const HashSessionToken = (token: string) => token as HashSessionToken;
export const HashResetPasswordToken = (token: string) => token as HashResetPasswordToken;
export const HashActiveUserProfileToken = (token: string) => token as HashActiveUserProfileToken;
