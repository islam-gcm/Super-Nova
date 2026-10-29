const Task = require("../models/Task");
const TaskAssignment = require("../models/TaskAssignment");
const Notification = require("../models/Notification");
const { sendData } = require("../utils/response");
const { isPrivileged } = require("../services/taskService");

const getDashboard = async (req, res) => {
  const visibleTasks = isPrivileged(req.user)
    ? {}
    : { $or: [{ type: "global" }, { department: { $in: req.user.departments } }] };

  const [availableTasks, assignments, unreadNotifications] = await Promise.all([
    Task.find({ ...visibleTasks, status: "open", deadline: { $gt: new Date() } })
      .populate("department", "name slug")
      .sort({ deadline: 1 })
      .limit(20),
    TaskAssignment.find({ member: req.user._id, status: { $in: ["claimed", "submitted"] } })
      .populate("task")
      .sort({ updatedAt: -1 }),
    Notification.countDocuments({ recipient: req.user._id, readAt: { $exists: false } }),
  ]);

  return sendData(res, {
    user: req.user,
    availableTasks,
    activeAssignments: assignments,
    unreadNotifications,
  });
};

module.exports = { getDashboard };
