import { createServer } from "node:http";
import { app } from "./app.js";
import { env } from "./config/env.js";

const server = createServer(app);

server.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});

const SHUTDOWN_TIMEOUT_MS = 10_000;

let isShuttingDown = false;

function shutdown(signal: string): void {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;

  console.log(`Received ${signal}. Shutting down gracefully...`);

  const forceExitTimer = setTimeout(() => {
    console.error("Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceExitTimer.unref();

  server.close((closeError) => {
    clearTimeout(forceExitTimer);

    if (closeError) {
      console.error("Error while closing HTTP server:", closeError);
      process.exit(1);
    }

    process.exit(0);
  });
}

process.on("SIGINT", () => {
  shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});
