// // middlewares/authenticate.ts
// import type { Request, Response, NextFunction } from 'express';
// import { Redis } from 'ioredis';
// import { sendResult } from '../utils/express-responder';
// import { ErrorFactory } from '../utils/errors';
// import { Result } from '../types/result';
// import { AuthContext, AuthContextSchema } from '../types/auth-context';

// export const createAuthenticator = (redis: Redis, authService: any) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     const sessionId = req.signedCookies.sessionId;
//     const requestedTenantId = req.headers['x-tenant-id'] as string; // Klient przekazuje kontekst Tenanta

//     if (!sessionId) {
//       return sendResult(res, Result.fail(ErrorFactory.unauthorized('Brak sesji.')));
//     }

//     try {
//       const cacheKey = `auth_ctx:${sessionId}:${requestedTenantId || 'default'}`;

//       // 1. LEKKI ODCZYT: Sprawdzamy Redis (Cache Hit)
//       let authContext: AuthContext | null = null;
//       const cachedData = await redis.get(cacheKey);

//       if (cachedData) {
//         authContext = AuthContextSchema.parse(JSON.parse(cachedData));
//       } else {
//         // 2. CACHE MISS: Pobieramy z bazy i tworzymy zdenormalizowany obiekt
//         // Ta funkcja w usłudze odpytuje Mongo i buduje pełny AuthContext
//         authContext = await authService.buildAuthContext(sessionId, requestedTenantId);

//         if (!authContext) {
//           res.clearCookie('sessionId');
//           return sendResult(res, Result.fail(ErrorFactory.unauthorized('Sesja nieprawidłowa lub brak dostępu.')));
//         }

//         // Zapisujemy w Redis z czasem życia np. 15 minut (TTL)
//         await redis.set(cacheKey, JSON.stringify(authContext), 'EX', 900);
//       }

//       // 3. Sprawdzenie czy sesja w pamięci podręcznej nie wygasła
//       if (new Date(authContext.expiresAt) < new Date()) {
//         res.clearCookie('sessionId');
//         await redis.del(cacheKey);
//         return sendResult(res, Result.fail(ErrorFactory.unauthorized('Sesja wygasła.')));
//       }

//       // 4. WSTRZYKNIĘCIE KONTEKSTU DO REQUESTU
//       req.auth = authContext;

//       return next();
//     } catch (error) {
//       return sendResult(res, Result.fail(ErrorFactory.internal('Błąd autoryzacji.')));
//     }
//   };
// };
