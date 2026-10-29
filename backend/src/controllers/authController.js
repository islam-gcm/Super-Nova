const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const InviteToken = require("../models/InviteToken");
const AuditLog = require("../models/AuditLog");
const ApiError = require("../utils/ApiError");
const { createAccessToken, hashToken } = require("../utils/tokens");
const { sendData } = require("../utils/response");
const { env } = require("../config/env");

const setAuthCookie = (res, token) => {
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: env.authCookie.secure,
    sameSite: env.authCookie.sameSite,
    ...(env.authCookie.domain ? { domain: env.authCookie.domain } : {}),
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });
};

const login = async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect");
  }
  if (user.status !== "active") {
    throw new ApiError(403, "ACCOUNT_NOT_ACTIVE", "This account is not active");
  }

  user.lastLoginAt = new Date();
  await user.save();
  const token = createAccessToken(user);
  setAuthCookie(res, token);

  return sendData(res, { user: user.toJSON() });
};

const activate = async (req, res) => {
  const { token, password } = req.validated.body;
  const session = await mongoose.startSession();
  let user;

  try {
    await session.withTransaction(async () => {
      const invite = await InviteToken.findOne({
        tokenHash: hashToken(token),
        usedAt: { $exists: false },
        expiresAt: { $gt: new Date() },
      }).select("+tokenHash").session(session);

      if (!invite) throw new ApiError(400, "INVALID_INVITE", "This invitation is invalid or expired");

      user = await User.findOne({ _id: invite.user, status: "invited" }).session(session);
      if (!user) throw new ApiError(409, "ACCOUNT_ALREADY_ACTIVATED", "This account has already been activated");

      user.passwordHash = await bcrypt.hash(password, 12);
      user.status = "active";
      await user.save({ session });

      invite.usedAt = new Date();
      await invite.save({ session });

      await AuditLog.create([{
        actor: user._id,
        action: "account.activated",
        targetModel: "User",
        targetId: user._id,
        ip: req.ip,
        userAgent: req.get("user-agent"),
      }], { session });
    });
  } finally {
    await session.endSession();
  }

  const accessToken = createAccessToken(user);
  setAuthCookie(res, accessToken);
  return sendData(res, { user: user.toJSON() }, 201);
};

const logout = (_req, res) => {
  res.clearCookie("accessToken", {
    path: "/",
    secure: env.authCookie.secure,
    sameSite: env.authCookie.sameSite,
    ...(env.authCookie.domain ? { domain: env.authCookie.domain } : {}),
  });
  return sendData(res, { message: "Logged out" });
};

const me = (req, res) => {
  return sendData(res, { user: req.user });
};

module.exports = { login, activate, logout, me };
