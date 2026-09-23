import crypto from "node:crypto";
import { z } from "zod";
import { HashActiveUserProfileToken, HashResetPasswordToken, HashSessionToken } from "@project/shared";

export const RawSessionTokenSchema = z.string().brand<"RawSessionToken">();
export const RawResetPasswordTokenSchema = z.string().brand<"RawResetPasswordToken">();
export const RawActiveUserProfileTokenSchema = z.string().brand<"RawActiveUserProfileToken">();

export type RawSessionToken = z.infer<typeof RawSessionTokenSchema>;
export type RawResetPasswordToken = z.infer<typeof RawResetPasswordTokenSchema>;
export type RawActiveUserProfileToken = z.infer<typeof RawActiveUserProfileTokenSchema>;

export const RawSessionToken = (token: string) => token as RawSessionToken;
export const RawResetPasswordToken = (token: string) => token as RawResetPasswordToken;
export const RawActiveUserProfileToken = (token: string) => token as RawActiveUserProfileToken;

const generateCryptoString = (): string => crypto.randomBytes(32).toString("hex");

type CryptoTokenGenerator = () => string;

export const createRawCryptoToken = (generateCryptoString: CryptoTokenGenerator) => ({
  session: (): RawSessionToken => RawSessionToken(generateCryptoString()),
  password: (): RawResetPasswordToken => RawResetPasswordToken(generateCryptoString()),
  profile: (): RawActiveUserProfileToken => RawActiveUserProfileToken(generateCryptoString()),
});
export const generateRawToken = createRawCryptoToken(generateCryptoString);

type RawTokens = RawSessionToken | RawResetPasswordToken | RawActiveUserProfileToken;
type HashTokens = HashSessionToken | HashResetPasswordToken | HashActiveUserProfileToken;

const hashRawToken = (rawToken: RawTokens): string => crypto.createHash("sha256").update(rawToken).digest("hex");

type HashRawTokenFn = <T extends HashTokens>(tk: RawTokens) => T;

export const createHashToken = (hashRawTokenFn: HashRawTokenFn) => ({
  sessionHash: (tk: RawSessionToken): HashSessionToken => hashRawTokenFn<HashSessionToken>(tk),
  passwordHash: (tk: RawResetPasswordToken): HashResetPasswordToken => hashRawTokenFn<HashResetPasswordToken>(tk),
  profileHash: (tk: RawActiveUserProfileToken): HashActiveUserProfileToken =>
    hashRawTokenFn<HashActiveUserProfileToken>(tk),
});

export const generateHashToken = createHashToken(hashRawToken as HashRawTokenFn);
