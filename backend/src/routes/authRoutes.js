const express = require("express");
const controller = require("../controllers/authController");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const schemas = require("../validation/schemas");
const { authenticate } = require("../middleware/authMiddleware");
const { loginLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.post("/login", loginLimiter, validate(schemas.login), asyncHandler(controller.login));
router.post("/activate", validate(schemas.activateInvite), asyncHandler(controller.activate));
router.post("/logout", controller.logout);
router.get("/me", authenticate, controller.me);

module.exports = router;
