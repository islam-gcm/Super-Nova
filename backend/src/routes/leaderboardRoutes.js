const express = require("express");
const controller = require("../controllers/leaderboardController");
const asyncHandler = require("../utils/asyncHandler");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticate, asyncHandler(controller.list));

module.exports = router;
