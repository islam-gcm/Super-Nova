const express = require("express");
const controller = require("../controllers/taskController");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const schemas = require("../validation/schemas");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../constants");

const router = express.Router();

router.use(authenticate);
router.get("/", validate(schemas.taskList), asyncHandler(controller.list));
router.post("/", authorize(ROLES.LEAD, ROLES.HR, ROLES.DEPARTMENT_HEAD), validate(schemas.taskCreate), asyncHandler(controller.create));
router.get("/:id", validate(schemas.idParam), asyncHandler(controller.getOne));
router.post("/:id/claims", authorize(ROLES.MEMBER, ROLES.LEAD, ROLES.HR), validate(schemas.taskAction), asyncHandler(controller.claim));
router.delete("/:id/claims/me", authorize(ROLES.MEMBER, ROLES.LEAD, ROLES.HR), validate(schemas.taskAction), asyncHandler(controller.leave));
router.post("/:id/submissions", authorize(ROLES.MEMBER, ROLES.LEAD, ROLES.HR), validate(schemas.taskSubmit), asyncHandler(controller.submit));

module.exports = router;
