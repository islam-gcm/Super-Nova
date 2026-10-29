const express = require("express");
const controller = require("../controllers/registrationController");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const schemas = require("../validation/schemas");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../constants");

const router = express.Router();
router.get("/status", asyncHandler(controller.status));
router.patch(
  "/status",
  authenticate,
  authorize(ROLES.LEAD, ROLES.HR),
  validate(schemas.registrationStatusUpdate),
  asyncHandler(controller.updateStatus)
);

module.exports = router;
