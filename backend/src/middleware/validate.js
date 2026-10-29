const ApiError = require("../utils/ApiError");

const validate = (schema) => {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body ?? {},
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return next(new ApiError(422, "VALIDATION_ERROR", "The request data is invalid", result.error.flatten()));
    }

    req.validated = result.data;
    return next();
  };
};

module.exports = validate;
