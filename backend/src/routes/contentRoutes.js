const express = require("express");
const controller = require("../controllers/contentController");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const schemas = require("../validation/schemas");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../constants");

const router = express.Router();

router.get("/:kind", validate(schemas.contentKind), asyncHandler(controller.publicList));
router.get("/:kind/admin", authenticate, authorize(ROLES.LEAD, ROLES.HR), validate(schemas.contentKind), asyncHandler(controller.adminList));
router.post("/:kind", authenticate, authorize(ROLES.LEAD, ROLES.HR), validate(schemas.contentCreate), asyncHandler(controller.create));
router.patch("/:kind/:id", authenticate, authorize(ROLES.LEAD, ROLES.HR), validate(schemas.contentUpdate), asyncHandler(controller.update));
router.delete("/:kind/:id", authenticate, authorize(ROLES.LEAD, ROLES.HR), validate(schemas.contentItem), asyncHandler(controller.remove));

module.exports = router;
