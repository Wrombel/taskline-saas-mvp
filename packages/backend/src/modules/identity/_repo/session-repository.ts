import type { SessionDb } from "../_persistence/session.db.js";
import type { Session } from "@project/shared";
import type { ResultAsync } from "neverthrow";
import type { DatabaseError } from "#infrastructure";
export type SessionRepository = {
  create(session: Session): ResultAsync<void, DatabaseError>;
  findActiveByDevice(deviceId: string): Promise<SessionDb | null>;
};
