import { MongoClient } from "mongodb";
import { env } from "./env.js";

let client: MongoClient;

export async function connectDB() {
  client = new MongoClient(env.MONGODB_URI);

  await client.connect();

  console.log("MongoDB connected");
}

export function getDB() {
  return client.db();
}
