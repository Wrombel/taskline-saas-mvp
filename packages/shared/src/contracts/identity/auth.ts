import { z } from "zod";

// ==========================================
// Współdzielone schematy (Helpers)
// ==========================================

const emailSchema = z.email("Niepoprawny format adresu email");

// Podstawowa walidacja hasła (możesz dodać .regex() dla znaków specjalnych)
const passwordSchema = z
  .string()
  .min(8, "Hasło musi mieć co najmniej 8 znaków")
  .max(64, "Hasło jest zbyt długie");

const opaqueTokenSchema = z.string().min(16, "Niepoprawny format tokena");

// ==========================================
// 1. REJESTRACJA (Register)
// ==========================================

export const RegisterRequestSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"], // Błąd zostanie przypisany do pola confirmPassword
  });

export const RegisterResponseSchema = z.object({
  userId: z.string().uuid("Niepoprawny format ID użytkownika"),
  token: opaqueTokenSchema, // Opaque Token odsyłany po poprawnej rejestracji
});

// ==========================================
// 2. LOGOWANIE (Login)
// ==========================================

export const LoginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Hasło jest wymagane"),
});

export const LoginResponseSchema = z.object({
  userId: z.string().uuid(),
  token: opaqueTokenSchema,
});

// ==========================================
// 3. PRZYPOMNIENIE HASŁA (Forgot Password)
// ==========================================

export const ForgotPasswordRequestSchema = z.object({
  email: emailSchema,
});

// Zazwyczaj zwracamy jedynie status, aby zapobiec wyciekowi informacji o tym,
// czy dany email istnieje w bazie (tzw. User Enumeration)
export const ForgotPasswordResponseSchema = z.object({
  message: z.string().default("Jeśli konto istnieje, wysłano link resetujący"),
});

// ==========================================
// 4. RESETOWANIE HASŁA (Reset Password)
// ==========================================

export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1, "Token resetujący jest wymagany"), // Token z linku w emailu
  newPassword: passwordSchema,
});

export const ResetPasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// ==========================================
// Typy wygenerowane z Zod (do użycia w TypeScript)
// ==========================================

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ForgotPasswordResponse = z.infer<
  typeof ForgotPasswordResponseSchema
>;

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;
