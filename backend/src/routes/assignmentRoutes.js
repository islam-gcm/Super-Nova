const express = require("express");
const controller = require("../controllers/assignmentController");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const schemas = require("../validation/schemas");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../constants");

const router = express.Router();

router.get("/", authenticate, authorize(ROLES.LEAD, ROLES.HR, ROLES.DEPARTMENT_HEAD), validate(schemas.assignmentList), asyncHandler(controller.list));
router.patch("/:id/review", authenticate, authorize(ROLES.LEAD, ROLES.HR, ROLES.DEPARTMENT_HEAD), validate(schemas.assignmentReview), asyncHandler(controller.review));

module.exports = router;
