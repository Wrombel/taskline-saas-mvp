// import type { Session } from "@project/shared";
// import type { SessionId, UserId, TenantId, TeamId } from "@project/shared";
// type Dependencies = {
//   userId: UserId;
// };
// export const createSession = (sessionId, userId, tenantContext): Session => {
//   const now = new Date();
//   const SLIDING_TTL_MS = 15 * 60 * 1000; // np. 15 minut
//   const MAX_SESSION_AGE_MS = 24 * 60 * 60 * 1000; // np. 24 godziny

//   return {
//     userId: input.userId,
//     // Jeśli kontekst został przekazany, używamy go; w przeciwnym razie null
//     tenantContext: input.tenantContext ?? null,
//     createdAt: now,
//     expiresAt: new Date(now.getTime() + SLIDING_TTL_MS),
//     maxExpiresAt: new Date(now.getTime() + MAX_SESSION_AGE_MS),
//   };
// };
// // session + Tenantcontext
