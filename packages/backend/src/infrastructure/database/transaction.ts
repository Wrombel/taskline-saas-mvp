import { MongoError } from "mongodb";
import type { MongoClient, ClientSession } from "mongodb";
import { ResultAsync } from "neverthrow";
import { createDatabaseError, type DatabaseError } from "./database.error.js";

export type RunTransaction = <T, E>(
  action: (session: ClientSession) => ResultAsync<T, E>,
) => ResultAsync<T, E | DatabaseError>;

const MAX_ATTEMPTS = 3;

const hasTransientLabel = (error: unknown): boolean =>
  error instanceof MongoError && error.hasErrorLabel("TransientTransactionError");

// Błąd może przyjść surowy (rzucony) albo opakowany w DatabaseError (w polu `cause`).
const isTransient = (error: unknown): boolean =>
  hasTransientLabel(error) ||
  (typeof error === "object" &&
    error !== null &&
    "cause" in error &&
    hasTransientLabel((error as { cause: unknown }).cause));

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const runInTransaction = <T, E>(
  mongoClient: MongoClient,
  action: (session: ClientSession) => ResultAsync<T, E>,
): ResultAsync<T, E | DatabaseError> => {
  return ResultAsync.fromPromise(
    (async () => {
      const session = mongoClient.startSession();
      try {
        for (let attempt = 1; ; attempt++) {
          session.startTransaction();
          try {
            const result = await action(session);
            if (result.isOk()) {
              await session.commitTransaction();
              return result;
            }
            await session.abortTransaction();
            if (attempt < MAX_ATTEMPTS && isTransient(result.error)) {
              await sleep(25 * attempt);
              continue;
            }
            return result;
          } catch (error) {
            await session.abortTransaction().catch(() => {});
            if (attempt < MAX_ATTEMPTS && isTransient(error)) {
              await sleep(25 * attempt);
              continue;
            }
            throw error;
          }
        }
      } finally {
        await session.endSession();
      }
    })(),
    (error: unknown) => createDatabaseError(error),
  ).andThen((innerResult) => innerResult);
};

export const makeRunTransaction = (mongoClient: MongoClient): RunTransaction => {
  return (action) => runInTransaction(mongoClient, action);
};
