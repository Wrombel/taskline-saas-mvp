import { Redis } from "ioredis";
import { logger } from "#http";

export async function createRedisClient(URL: string): Promise<Redis> {
  const redis = new Redis(URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  redis.on("connect", () => {
    logger.info("Redis connected successfully");
  });

  redis.on("error", (err) => {
    logger.error({ err }, "Redis connection error");
  });

  await redis.connect(); // Jawne nawiązanie połączenia
  return redis;
}
