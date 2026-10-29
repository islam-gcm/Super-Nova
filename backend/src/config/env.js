const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env"), quiet: true });

const nodeEnv = process.env.NODE_ENV || "development";
const authCookieSameSite = String(process.env.AUTH_COOKIE_SAME_SITE || "lax").trim().toLowerCase();
const authCookieSecure = process.env.AUTH_COOKIE_SECURE === undefined
  ? nodeEnv === "production"
  : process.env.AUTH_COOKIE_SECURE === "true";

const env = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/supernova",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  authCookie: {
    sameSite: authCookieSameSite,
    secure: authCookieSecure,
    domain: process.env.AUTH_COOKIE_DOMAIN || undefined,
  },
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173,http://127.0.0.1:5500,http://localhost:5500")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  inviteExpiresHours: Number(process.env.INVITE_EXPIRES_HOURS || 72),
  registration: {
    openMonth: Number(process.env.REGISTRATION_OPEN_MONTH || 6),
    openDay: Number(process.env.REGISTRATION_OPEN_DAY || 11),
    closeMonth: Number(process.env.REGISTRATION_CLOSE_MONTH || 10),
    closeDay: Number(process.env.REGISTRATION_CLOSE_DAY || 15),
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || "SuperNova Club <noreply@supernova.local>",
  },
  brevoApiKey: process.env.BREVO_API_KEY,
};

const validateEnv = () => {
  const errors = [];

  if (!env.jwtSecret || env.jwtSecret.length < 32) {
    errors.push("JWT_SECRET must contain at least 32 characters");
  }

  if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) {
    errors.push("PORT must be a valid TCP port");
  }

  if (!Number.isFinite(env.inviteExpiresHours) || env.inviteExpiresHours <= 0) {
    errors.push("INVITE_EXPIRES_HOURS must be a positive number");
  }

  if (!["strict", "lax", "none"].includes(env.authCookie.sameSite)) {
    errors.push("AUTH_COOKIE_SAME_SITE must be strict, lax, or none");
  }
  if (env.authCookie.sameSite === "none" && !env.authCookie.secure) {
    errors.push("AUTH_COOKIE_SECURE must be true when AUTH_COOKIE_SAME_SITE is none");
  }
  if (env.isProduction && !env.authCookie.secure) {
    errors.push("AUTH_COOKIE_SECURE must be true in production");
  }

  if (env.isProduction && env.corsOrigins.some((origin) => /^http:\/\//i.test(origin) && !/localhost|127\.0\.0\.1/i.test(origin))) {
    errors.push("CORS_ORIGINS must use HTTPS for non-local production origins");
  }

  const dates = [
    ["REGISTRATION_OPEN_MONTH", env.registration.openMonth, 1, 12],
    ["REGISTRATION_OPEN_DAY", env.registration.openDay, 1, 31],
    ["REGISTRATION_CLOSE_MONTH", env.registration.closeMonth, 1, 12],
    ["REGISTRATION_CLOSE_DAY", env.registration.closeDay, 1, 31],
  ];
  dates.forEach(([name, value, min, max]) => {
    if (!Number.isInteger(value) || value < min || value > max) errors.push(`${name} must be between ${min} and ${max}`);
  });

  if (env.isProduction && !env.brevoApiKey && (!env.smtp.host || !env.smtp.user || !env.smtp.pass)) {
    errors.push("BREVO_API_KEY or SMTP_HOST, SMTP_USER, and SMTP_PASS are required in production");
  }
  if (env.isProduction && env.brevoApiKey && !process.env.EMAIL_FROM) {
    errors.push("EMAIL_FROM must be a verified Brevo sender in production");
  }

  if (errors.length) {
    throw new Error(`Invalid environment configuration: ${errors.join("; ")}`);
  }
};

module.exports = { env, validateEnv };
