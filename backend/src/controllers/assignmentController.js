const { reviewAssignment } = require("../services/taskService");
const Task = require("../models/Task");
const TaskAssignment = require("../models/TaskAssignment");
const { sendData } = require("../utils/response");
const { pagination, paginationMeta } = require("../utils/pagination");
const { ROLES } = require("../constants");

const list = async (req, res) => {
  const query = req.validated.query;
  const { page, limit, skip } = pagination(query);
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.taskId) filter.task = query.taskId;

  const isPrivileged = req.user.roles.some((role) => [ROLES.LEAD, ROLES.HR].includes(role));
  if (!isPrivileged) {
    const taskIds = await Task.find({
      type: "department",
      department: { $in: req.user.departments },
    }).distinct("_id");
    filter.task = query.taskId && taskIds.some((id) => id.equals(query.taskId))
      ? query.taskId
      : { $in: taskIds };
  }

  const [assignments, total] = await Promise.all([
    TaskAssignment.find(filter)
      .populate("member", "fullName email departments points completedTasksCount")
      .populate({ path: "task", populate: { path: "department", select: "name slug" } })
      .populate("reviewedBy", "fullName")
      .sort({ submittedAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    TaskAssignment.countDocuments(filter),
  ]);

  return sendData(res, { assignments }, 200, paginationMeta(page, limit, total));
};

const review = async (req, res) => {
  const { decision, note } = req.validated.body;
  const assignment = await reviewAssignment(
    req.validated.params.id,
    req.user,
    decision,
    note,
    req
  );
  return sendData(res, { assignment });
};

module.exports = { list, review };
