const Notification = require("../models/Notification");
const User = require("../models/User");
const { PRIVILEGED_ROLES, ROLES } = require("../constants");

const notifyRecipients = async (recipientIds, notification, session) => {
  const uniqueIds = [...new Set(recipientIds.filter(Boolean).map(String))];
  if (!uniqueIds.length) return [];

  return Notification.insertMany(
    uniqueIds.map((recipient) => ({ recipient, ...notification })),
    session ? { session } : undefined
  );
};

const findTaskManagerIds = async (task, session) => {
  const roleQuery = { roles: { $in: PRIVILEGED_ROLES }, status: "active" };
  const departmentHeadQuery = task.department
    ? { roles: ROLES.DEPARTMENT_HEAD, departments: task.department, status: "active" }
    : null;

  const query = departmentHeadQuery ? { $or: [roleQuery, departmentHeadQuery] } : roleQuery;
  const managers = await User.find(query).select("_id").session(session || null).lean();
  return managers.map((manager) => manager._id);
};

module.exports = { notifyRecipients, findTaskManagerIds };
