import type { Session } from "@project/shared";
import type { ResultAsync } from "neverthrow";
import type { DatabaseError, MappingError } from "#infrastructure";
import type { SessionId, UserId, MembershipId, HashSessionToken } from "@project/shared";
import type { ClientSession } from "mongodb";
export type SessionRepository = {
  create(session: Session, mongoSession?: ClientSession): ResultAsync<void, DatabaseError>;
  revoke(sessionHash: HashSessionToken): ResultAsync<void, DatabaseError>;
  slide(sessionId: SessionId, newExpiresAt: Date, now: Date): ResultAsync<boolean, DatabaseError>;
  setTenantContext(sessionId: SessionId, tenantContext: MembershipId | null): ResultAsync<void, DatabaseError>;
  revokeAllByUserId(userId: UserId, mongoSession: ClientSession): ResultAsync<void, DatabaseError>;
  findActiveByHash(sessionHash: HashSessionToken, now: Date): ResultAsync<Session | null, DatabaseError | MappingError>;
  findAllActiveByUserId(userId: UserId): ResultAsync<Session[], DatabaseError | MappingError>;
};
