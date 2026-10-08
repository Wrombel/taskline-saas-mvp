import type { RawActiveUserProfileToken, RawResetPasswordToken } from "#infrastructure";
import type { HashActiveUserProfileToken, HashResetPasswordToken } from "@project/shared";
import type { User } from "@project/shared";
import type { UserId } from "@project/shared";
import type { Email } from "@project/shared";
import type { HashedPassword } from "@project/shared";
import { SessionVersion } from "@project/shared";
import { USER_STATUS } from "@project/shared";

export type UserFactory = {
  prepareUser(
    personalInfo: { firstName: string; lastName: string },
    hashedPassword: HashedPassword,
    email: Email,
  ): PreparedUser;
};
export type PreparedUser = { rawProfileToken: RawActiveUserProfileToken; user: User };
type PersonalInfo = { firstName: string; lastName: string };

export const makePrepareUser = (
  personalInfo: PersonalInfo,
  hashedPassword: HashedPassword,
  email: Email,
  generateUserId: () => UserId,
  generateRawProfileToken: () => RawActiveUserProfileToken,
  generateHashProfileToken: (token: RawActiveUserProfileToken) => HashActiveUserProfileToken,
): PreparedUser => {
  const userId = generateUserId();
  const rawProfileToken = generateRawProfileToken();
  const profileTokenHash = generateHashProfileToken(rawProfileToken);
  return {
    rawProfileToken,
    user: {
      id: userId,
      email: email,
      fullName: {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
      },
      hashedPassword: hashedPassword,
      state: USER_STATUS.INACTIVE,
      passwordTokenHash: null,
      passwordTokenExpiresAt: null,
      profileTokenHash: profileTokenHash,
      sessionVersion: SessionVersion(1),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
};

export const createUserFactory = (
  generateUserId: () => UserId,
  generateRawProfileToken: () => RawActiveUserProfileToken,
  generateHashProfileToken: (token: RawActiveUserProfileToken) => HashActiveUserProfileToken,
  generateRawPasswordToken: () => RawResetPasswordToken,
  generateHashPasswordToken: (token: RawResetPasswordToken) => HashResetPasswordToken,
): UserFactory => {
  return {
    prepareUser: (personalInfo, hashedPassword, email) =>
      makePrepareUser(
        personalInfo,
        hashedPassword,
        email,
        generateUserId,
        generateRawProfileToken,
        generateHashProfileToken,
      ),
  };
};
