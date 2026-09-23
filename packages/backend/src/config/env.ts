import dotenv from "dotenv";
import pino from "pino";
import { z } from "zod";

dotenv.config();
const bootLogger = pino();

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    PORT: z.coerce.number().default(3000),
    LOG_LEVEL: z.string().default("info"),
    MONGODB_URI: z.string(),
    REDIS_URI: z.string(),
    SESSION_MAX_AGE_DAYS: z.coerce.number().default(14),
    SESSION_SLIDING_WINDOW_HOURS: z.coerce.number().default(72),
  })
  .transform((env) => ({
    server: {
      env: env.NODE_ENV,
      port: env.PORT,
      logLevel: env.LOG_LEVEL,
    },
    db: {
      mongoUri: env.MONGODB_URI,
      redisUri: env.REDIS_URI,
    },
    session: {
      maxAgeDays: env.SESSION_MAX_AGE_DAYS,
      slidingWindowHours: env.SESSION_SLIDING_WINDOW_HOURS,
    },
  }));

const result = envSchema.safeParse(process.env);

if (!result.success) {
  bootLogger.fatal({ err: result.error }, "Invalid environment variables");
  process.exit(1);
}

export const config = result.data;

export type AppConfig = z.infer<typeof envSchema>;
