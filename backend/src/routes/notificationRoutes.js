const express = require("express");
const controller = require("../controllers/notificationController");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const schemas = require("../validation/schemas");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);
router.get("/", validate(schemas.listQuery), asyncHandler(controller.list));
router.patch("/:id/read", validate(schemas.idParam), asyncHandler(controller.markRead));

module.exports = router;
