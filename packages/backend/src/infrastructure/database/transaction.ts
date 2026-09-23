// infrastructure/database/runInTransaction.ts
import type { MongoClient, ClientSession } from "mongodb";
import { ResultAsync } from "neverthrow";
import { createDatabaseError, type DatabaseError } from "./database.error.js";

export type RunTransaction = <T, E>(
  action: (session: ClientSession) => ResultAsync<T, E>,
) => ResultAsync<T, E | DatabaseError>;

const runInTransaction = <T, E>(
  mongoClient: MongoClient,
  action: (session: ClientSession) => ResultAsync<T, E>,
): ResultAsync<T, E | DatabaseError> => {
  return ResultAsync.fromPromise(
    (async () => {
      const session = mongoClient.startSession();
      session.startTransaction();
      try {
        const result = await action(session);
        if (result.isOk()) {
          await session.commitTransaction();
        } else {
          await session.abortTransaction();
        }
        return result;
      } catch (error) {
        await session.abortTransaction().catch(() => {});
        throw error;
      } finally {
        await session.endSession();
      }
    })(),
    (error: unknown) => createDatabaseError(error),
  ).andThen((innerResult) => innerResult);
};

export const makeRunTransaction = (
  mongoClient: MongoClient,
): RunTransaction => {
  return (action) => runInTransaction(mongoClient, action);
};
