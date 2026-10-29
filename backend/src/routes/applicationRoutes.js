const express = require("express");
const controller = require("../controllers/applicationController");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const schemas = require("../validation/schemas");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { applicationLimiter } = require("../middleware/rateLimitMiddleware");
const { ROLES } = require("../constants");

const router = express.Router();

router.post("/", applicationLimiter, validate(schemas.applicationCreate), asyncHandler(controller.create));
router.get("/", authenticate, authorize(ROLES.LEAD, ROLES.HR), validate(schemas.applicationList), asyncHandler(controller.list));
router.patch("/:id/decision", authenticate, authorize(ROLES.LEAD, ROLES.HR), validate(schemas.applicationDecision), asyncHandler(controller.decide));

module.exports = router;
