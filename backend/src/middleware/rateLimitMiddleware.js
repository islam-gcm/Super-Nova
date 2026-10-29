const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
const { env } = require("../config/env");

const jsonHandler = (_req, res) => res.status(429).json({
  success: false,
  error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many requests. Please try again later." },
});

const applicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: env.isProduction ? 5 : 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: jsonHandler,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.isProduction ? 10 : 100,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}:${String(req.body?.email || "").trim().toLowerCase()}`,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: jsonHandler,
});

module.exports = { applicationLimiter, loginLimiter };
