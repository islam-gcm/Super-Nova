const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { verifyAccessToken } = require("../utils/tokens");
const User = require("../models/User");

const authenticate = asyncHandler(async (req, _res, next) => {
  const bearer = req.get("authorization");
  const token = bearer?.startsWith("Bearer ") ? bearer.slice(7) : req.cookies?.accessToken;

  if (!token) {
    throw new ApiError(401, "AUTHENTICATION_REQUIRED", "Please log in to continue");
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (_error) {
    throw new ApiError(401, "INVALID_ACCESS_TOKEN", "Your session is invalid or has expired");
  }

  const user = await User.findById(payload.sub);
  if (!user || user.status !== "active") {
    throw new ApiError(401, "ACCOUNT_UNAVAILABLE", "This account is not active");
  }

  req.user = user;
  next();
});

const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) return next(new ApiError(401, "AUTHENTICATION_REQUIRED", "Please log in to continue"));
    if (!roles.some((role) => req.user.roles.includes(role))) {
      return next(new ApiError(403, "FORBIDDEN", "You do not have permission to perform this action"));
    }
    return next();
  };
};

module.exports = { authenticate, authorize };
