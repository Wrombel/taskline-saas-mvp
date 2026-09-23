import { MongoClient } from "mongodb";
import { logger } from "#http";

export async function connectDB(URL: string): Promise<MongoClient> {
  const client = new MongoClient(URL);
  await client.connect();
  logger.info("MongoDB connected successfully");
  return client;
}
