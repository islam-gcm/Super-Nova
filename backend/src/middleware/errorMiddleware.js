const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");
const { env } = require("../config/env");

const notFound = (req, _res, next) => {
  next(new ApiError(404, "ROUTE_NOT_FOUND", `Route ${req.method} ${req.originalUrl} was not found`));
};

const errorHandler = (error, _req, res, _next) => {
  let normalized = error;

  if (error instanceof mongoose.Error.CastError) {
    normalized = new ApiError(400, "INVALID_ID", "The supplied resource identifier is invalid");
  } else if (error?.code === 11000) {
    normalized = new ApiError(409, "DUPLICATE_RESOURCE", "A resource with these unique fields already exists", error.keyValue);
  } else if (error instanceof mongoose.Error.ValidationError) {
    normalized = new ApiError(422, "DATABASE_VALIDATION_ERROR", "The resource failed validation");
  }

  const statusCode = normalized.statusCode || 500;
  const body = {
    success: false,
    error: {
      code: normalized.code || "INTERNAL_SERVER_ERROR",
      message: statusCode === 500 && env.isProduction ? "An unexpected error occurred" : normalized.message,
    },
  };

  if (normalized.details) body.error.details = normalized.details;
  if (!env.isProduction && statusCode === 500) body.error.stack = normalized.stack;

  res.status(statusCode).json(body);
};

module.exports = { notFound, errorHandler };
