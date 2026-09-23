// types/auth-context.ts
// import { z } from "zod";

// export const AuthContextSchema = z.object({
//   sessionId: z.string(),
//   userId: z.string(),
//   tenantId: z.string(),
//   // Uprawnienia zdenormalizowane do prostej tablicy stringów (np. ["users:read", "projects:write"])
//   permissions: z.array(z.string()),
//   role: z.string(), // np. "ADMIN", "MEMBER"

//   // Opcjonalny kontekst niższego poziomu (jeśli wybrany)
//   teamId: z.string().optional(),
//   projectId: z.string().optional(),

//   expiresAt: z.string().datetime(),
// });

// export type AuthContext = z.infer<typeof AuthContextSchema>;
