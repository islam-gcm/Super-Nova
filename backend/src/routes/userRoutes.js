const express = require("express");
const controller = require("../controllers/userController");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const schemas = require("../validation/schemas");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../constants");

const router = express.Router();

router.use(authenticate, authorize(ROLES.LEAD, ROLES.HR));
router.get("/", validate(schemas.listQuery), asyncHandler(controller.list));
router.patch("/:id", validate(schemas.userUpdate), asyncHandler(controller.update));

module.exports = router;
