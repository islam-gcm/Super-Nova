const { createApp } = require("./app");
const { connectDatabase, disconnectDatabase } = require("./config/database");
const { env, validateEnv } = require("./config/env");

const start = async () => {
  validateEnv();
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.port, "0.0.0.0", () => {
    console.log(`SuperNova API listening on port ${env.port}`);
  });

  const closeServer = () => new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down`);
    const forceExit = setTimeout(() => process.exit(1), 10000);
    forceExit.unref();

    try {
      await closeServer();
      await disconnectDatabase();
      clearTimeout(forceExit);
      process.exit(0);
    } catch (error) {
      console.error("Graceful shutdown failed:", error.message);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

start().catch((error) => {
  console.error("Failed to start SuperNova API:", error.message);
  process.exit(1);
});
