const express = require("express");
const controller = require("../controllers/auditController");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const schemas = require("../validation/schemas");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../constants");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize(ROLES.LEAD, ROLES.HR),
  validate(schemas.listQuery),
  asyncHandler(controller.list)
);

module.exports = router;
