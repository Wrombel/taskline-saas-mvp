import { Result, ResultAsync, ok } from "neverthrow";
import { ObjectId } from "mongodb";
import type { ClientSession, Collection } from "mongodb";
import { createDatabaseError } from "#infrastructure";
import { SessionMapper } from "../_persistence/session.mapper.js";
import type { Session, SessionId, UserId, MembershipId, HashSessionToken } from "@project/shared";
import type { SessionRepository } from "./session-repository.js";
import type { DatabaseError, MappingError } from "#infrastructure";
import type { SessionDb } from "../_persistence/session.db.js";

type SessionCollection = Collection<SessionDb>;

export const createSession = (
  collection: SessionCollection,
  session: Session,
  mongoSession?: ClientSession,
): ResultAsync<void, DatabaseError> => {
  const sessionDb = SessionMapper.toDocument(session);
  const options = mongoSession ? { session: mongoSession } : {};

  return ResultAsync.fromPromise(collection.insertOne(sessionDb, options), createDatabaseError).map(() => undefined);
};

export const revokeSession = (
  collection: SessionCollection,
  sessionId: SessionId,
): ResultAsync<void, DatabaseError> => {
  return ResultAsync.fromPromise(collection.deleteOne({ _id: new ObjectId(sessionId) }), createDatabaseError).map(
    () => undefined,
  );
};

export const slideSession = (
  collection: SessionCollection,
  sessionId: SessionId,
  newExpiresAt: Date,
): ResultAsync<void, DatabaseError> => {
  const now = new Date();

  return ResultAsync.fromPromise(
    collection.updateOne(
      {
        _id: new ObjectId(sessionId),
        expiresAt: { $gt: now, $lt: newExpiresAt },
        maxExpiresAt: { $gte: newExpiresAt },
      },
      { $set: { expiresAt: newExpiresAt } },
    ),
    createDatabaseError,
  ).map(() => undefined);
};

export const setTenantContextSession = (
  collection: SessionCollection,
  sessionId: SessionId,
  membershipId: MembershipId | null,
): ResultAsync<void, DatabaseError> => {
  const now = new Date();

  return ResultAsync.fromPromise(
    collection.updateOne(
      {
        _id: new ObjectId(sessionId),
        expiresAt: { $gt: now },
        maxExpiresAt: { $gt: now },
      },
      {
        $set: {
          tenantContext: membershipId ? new ObjectId(membershipId) : null,
        },
      },
    ),
    createDatabaseError,
  ).map(() => undefined);
};

export const revokeAllByUserIdSession = (
  collection: SessionCollection,
  userId: UserId,
  mongoSession: ClientSession,
): ResultAsync<void, DatabaseError> => {
  return ResultAsync.fromPromise(
    collection.deleteMany({ userId: new ObjectId(userId) }, { session: mongoSession }),
    createDatabaseError,
  ).map(() => undefined);
};

export const findActiveByHashSession = (
  collection: SessionCollection,
  sessionHash: HashSessionToken,
  now = new Date(),
): ResultAsync<Session | null, DatabaseError | MappingError> => {
  return ResultAsync.fromPromise(
    collection.findOne({
      sessionHash,
      expiresAt: { $gt: now },
      maxExpiresAt: { $gt: now },
    }),
    createDatabaseError,
  ).andThen((sessionDb) => (sessionDb ? SessionMapper.toDomain(sessionDb) : ok(null)));
};

export const findAllActiveByUserIdSession = (
  collection: SessionCollection,
  userId: UserId,
  now = new Date(),
): ResultAsync<Session[], DatabaseError | MappingError> => {
  return ResultAsync.fromPromise(
    collection
      .find({
        userId: new ObjectId(userId),
        expiresAt: { $gt: now },
        maxExpiresAt: { $gt: now },
      })
      .sort({ createdAt: -1 })
      .toArray(),
    createDatabaseError,
  ).andThen((sessionsDb) => Result.combine(sessionsDb.map(SessionMapper.toDomain)));
};

type Dependencies = {
  sessionCollection: SessionCollection;
};

export const createSessionRepository = ({ sessionCollection }: Dependencies): SessionRepository => ({
  create: (session, mongoSession) => createSession(sessionCollection, session, mongoSession),
  revoke: (sessionId) => revokeSession(sessionCollection, sessionId),
  slide: (sessionId, newExpiresAt) => slideSession(sessionCollection, sessionId, newExpiresAt),
  setTenantContext: (sessionId, tenantContext) => setTenantContextSession(sessionCollection, sessionId, tenantContext),
  revokeAllByUserId: (userId, mongoSession) => revokeAllByUserIdSession(sessionCollection, userId, mongoSession),
  findActiveByHash: (sessionHash) => findActiveByHashSession(sessionCollection, sessionHash),
  findAllActiveByUserId: (userId) => findAllActiveByUserIdSession(sessionCollection, userId),
});
