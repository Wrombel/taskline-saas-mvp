import type { Session } from "@project/shared";
import type { ResultAsync } from "neverthrow";
import type { DatabaseError, MappingError } from "#infrastructure";
import type { SessionId, UserId, MembershipId } from "@project/shared";
import type { HashSessionToken } from "@project/shared";
import type { ClientSession } from "mongodb";
export type SessionRepository = {
  create(session: Session, mongoSession?: ClientSession): ResultAsync<void, DatabaseError>;
  revoke(sessionId: SessionId): ResultAsync<void, DatabaseError>;
  slide(sessionId: SessionId, newExpiresAt: Date): ResultAsync<void, DatabaseError>;
  setTenantContext(sessionId: SessionId, tenantContext: MembershipId | null): ResultAsync<void, DatabaseError>;
  revokeAllByUserId(userId: UserId, mongoSession: ClientSession): ResultAsync<void, DatabaseError>;
  findActiveByHash(sessionHash: HashSessionToken): ResultAsync<Session | null, DatabaseError | MappingError>;
  findAllActiveByUserId(userId: UserId): ResultAsync<Session[], DatabaseError | MappingError>;
};
