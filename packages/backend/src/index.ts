import { config } from "#config";
import { createApp } from "./app.js";
import { logger } from "#http";

async function start() {
  try {
    const { app, mongoClient, redisClient, identityModule } =
      await createApp(config);

    await Promise.all([identityModule.initDatabase()]);

    const server = app.listen(config.server.port, () => {
      logger.info(`Server listening on port ${config.server.port}`);
    });
    const shutdown = async (signal: string) => {
      logger.info(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info("HTTP server closed.");
        await Promise.all([mongoClient.close(), redisClient.quit()]);

        process.exit(0);
      });
    };
    // listening to (Ctrl+C / Docker stop)
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err: unknown) {
    logger.error("Fatal error during server startup:");
    process.exit(1);
  }
}
start();
