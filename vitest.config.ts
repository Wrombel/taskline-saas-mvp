import { defineConfig } from "vitest/config";
import dotenv from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: resolve(rootDir, "packages/backend/.env.test"),
});
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    clearMocks: true,
    restoreMocks: true,
  },
});
