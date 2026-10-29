const express = require("express");
const controller = require("../controllers/eventController");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const schemas = require("../validation/schemas");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../constants");

const router = express.Router();

router.get("/", asyncHandler(controller.publicList));
router.get("/admin", authenticate, authorize(ROLES.LEAD, ROLES.HR), asyncHandler(controller.adminList));
router.post("/", authenticate, authorize(ROLES.LEAD, ROLES.HR), validate(schemas.eventCreate), asyncHandler(controller.create));
router.patch("/:id", authenticate, authorize(ROLES.LEAD, ROLES.HR), validate(schemas.eventUpdate), asyncHandler(controller.update));
router.delete("/:id", authenticate, authorize(ROLES.LEAD, ROLES.HR), validate(schemas.idParam), asyncHandler(controller.remove));

module.exports = router;
