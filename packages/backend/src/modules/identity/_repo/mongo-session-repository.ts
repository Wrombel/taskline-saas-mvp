import { ResultAsync, errAsync, okAsync } from "neverthrow";
import { Collection, MongoServerError } from "mongodb";
import { createUserAlreadyExistsError } from "../_domain/user/user.errors.js";
import { createDatabaseError } from "#infrastructure";
import { logger } from "#http";
import { UserMapper } from "../_persistence/user.mapper.js";
import { SessionMapper } from "../_persistence/session.mapper.js";
import type { UserDb } from "../_persistence/user.db.js";
import type { Session, User } from "@project/shared";
import type { SessionRepository } from "./session-repository.js";
import type { DatabaseError } from "#infrastructure";
import type { UserAlreadyExistsError } from "../_domain/user/user.errors.js";
import type { SessionDb } from "../_persistence/session.db.js";
type Dependencies = {
  sessionCollection: Collection<SessionDb>;
};
type saveSessionError = DatabaseError | UserAlreadyExistsError;

export const findSessionByDeviceId = async (
  collection: Collection<SessionDb>,
  deviceId: string,
): Promise<SessionDb | null> => {
  return await collection.findOne({ deviceId });
};

export const saveSession = (
  collection: Collection<SessionDb>,
  session: Session,
): ResultAsync<void, saveSessionError> => {
  const sessionDb: SessionDb = SessionMapper.toDocument(session);
  return ResultAsync.fromPromise(collection.insertOne(sessionDb), (e: unknown) => {
    return createDatabaseError(e);
  }).map(() => undefined);
};

export const createSessionRepository = ({ sessionCollection }: Dependencies): SessionRepository => {
  return {
    create: (session) => saveSession(sessionCollection, session),
    findActiveByDevice: (deviceId) => findSessionByDeviceId(sessionCollection, deviceId),
  };
};
