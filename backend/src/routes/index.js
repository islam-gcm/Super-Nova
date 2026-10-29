const express = require("express");
const authRoutes = require("./authRoutes");
const applicationRoutes = require("./applicationRoutes");
const departmentRoutes = require("./departmentRoutes");
const taskRoutes = require("./taskRoutes");
const assignmentRoutes = require("./assignmentRoutes");
const notificationRoutes = require("./notificationRoutes");
const eventRoutes = require("./eventRoutes");
const registrationRoutes = require("./registrationRoutes");
const contentRoutes = require("./contentRoutes");
const userRoutes = require("./userRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const leaderboardRoutes = require("./leaderboardRoutes");
const auditRoutes = require("./auditRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/registration", registrationRoutes);
router.use("/applications", applicationRoutes);
router.use("/content", contentRoutes);
router.use("/departments", departmentRoutes);
router.use("/tasks", taskRoutes);
router.use("/task-assignments", assignmentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/events", eventRoutes);
router.use("/users", userRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/leaderboard", leaderboardRoutes);
router.use("/audit-logs", auditRoutes);

module.exports = router;
