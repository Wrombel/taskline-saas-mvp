import { ObjectId } from "mongodb";
import { createIdGenerator } from "@project/shared";

const generateMongoId = (): string => new ObjectId().toString();

export const generateId = createIdGenerator(generateMongoId);
