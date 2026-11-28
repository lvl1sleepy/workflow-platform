import { createApp } from "./app.js";
import { PORT } from "./config/env.js";
import { pool, checkDatabase } from "./db/pool.js";

const app = createApp({
  checkDatabase,
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.info(`Server listening on port ${PORT}`);
});

let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.info(`Received ${signal}. Starting graceful shutdown...`);

  const timeout = setTimeout(() => {
    console.error("Shutdown timeout exceeded. Forcing exit.");

    server.closeAllConnections();
    process.exit(1);
  }, 15_000);

  try {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    console.info("HTTP server closed.");

    await pool.end();
    console.info("PostgreSQL pool closed.");

    console.info("Graceful shutdown completed.");
  } catch (error) {
    console.error("Graceful shutdown failed:", error);
    process.exit(1);
  } finally {
    clearTimeout(timeout);
  }
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
