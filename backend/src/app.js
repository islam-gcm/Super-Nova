const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const routes = require("./routes");
const ApiError = require("./utils/ApiError");
const { env } = require("./config/env");
const { supportsTransactions } = require("./config/database");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const createApp = () => {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", env.isProduction ? 1 : false);

  app.use(helmet());
  app.use(cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
      return callback(new ApiError(403, "ORIGIN_NOT_ALLOWED", "This origin is not allowed"));
    },
  }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "100kb" }));
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => {
    const connected = mongoose.connection.readyState === 1;
    res.status(connected ? 200 : 503).json({
      success: connected,
      data: {
        status: connected ? "ok" : "degraded",
        database: connected ? "connected" : "disconnected",
        transactions: connected && supportsTransactions() ? "available" : "unavailable",
      },
    });
  });
  app.use("/api/v1", routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
};

module.exports = { createApp };
