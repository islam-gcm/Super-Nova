const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

const createAccessToken = (user) => {
  return jwt.sign(
    { sub: user.id, roles: user.roles },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn, issuer: "supernova-api", audience: "supernova-web" }
  );
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwtSecret, {
    issuer: "supernova-api",
    audience: "supernova-web",
  });
};

const createOpaqueToken = () => {
  const rawToken = crypto.randomBytes(32).toString("base64url");
  return { rawToken, tokenHash: hashToken(rawToken) };
};

const hashToken = (rawToken) => {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
};

module.exports = { createAccessToken, verifyAccessToken, createOpaqueToken, hashToken };
