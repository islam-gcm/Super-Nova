const Task = require("../models/Task");
const TaskAssignment = require("../models/TaskAssignment");
const Department = require("../models/Department");
const ApiError = require("../utils/ApiError");
const { sendData } = require("../utils/response");
const { pagination, paginationMeta } = require("../utils/pagination");
const { ROLES } = require("../constants");
const {
  isPrivileged,
  managesDepartment,
  claimTask,
  leaveTask,
  submitTask,
} = require("../services/taskService");
const { writeAudit } = require("../services/auditService");

const create = async (req, res) => {
  const input = req.validated.body;
  const department = input.departmentId
    ? await Department.findOne({ _id: input.departmentId, isActive: true })
    : null;

  if (input.departmentId && !department) {
    throw new ApiError(422, "DEPARTMENT_NOT_FOUND", "The selected department is unavailable");
  }
  if (!isPrivileged(req.user)) {
    if (!req.user.roles.includes(ROLES.DEPARTMENT_HEAD) || input.type !== "department") {
      throw new ApiError(403, "TASK_SCOPE_FORBIDDEN", "Department heads can only create department tasks");
    }
    if (!managesDepartment(req.user, department._id)) {
      throw new ApiError(403, "TASK_SCOPE_FORBIDDEN", "You cannot create a task for another department");
    }
  }

  const task = await Task.create({
    title: input.title,
    description: input.description,
    type: input.type,
    department: input.departmentId,
    createdBy: req.user._id,
    deadline: input.deadline,
    maxAssignees: input.maxAssignees,
    points: input.points,
    notes: input.notes,
  });
  await writeAudit(req, "task.created", "Task", task._id, input);
  return sendData(res, { task }, 201);
};

const visibilityFilter = (user) => {
  if (isPrivileged(user)) return {};
  return { $or: [{ type: "global" }, { department: { $in: user.departments } }] };
};

const list = async (req, res) => {
  const query = req.validated.query;
  const { page, limit, skip } = pagination(query);
  const filter = visibilityFilter(req.user);
  if (query.status) filter.status = query.status;
  if (query.type) filter.type = query.type;
  if (query.departmentId) filter.department = query.departmentId;

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate("department", "name slug")
      .populate("createdBy", "fullName")
      .sort({ deadline: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  return sendData(res, { tasks }, 200, paginationMeta(page, limit, total));
};

const getOne = async (req, res) => {
  const task = await Task.findOne({
    _id: req.validated.params.id,
    ...visibilityFilter(req.user),
  }).populate("department", "name slug").populate("createdBy", "fullName");
  if (!task) throw new ApiError(404, "TASK_NOT_FOUND", "Task not found");

  const assignment = await TaskAssignment.findOne({ task: task._id, member: req.user._id });
  return sendData(res, { task, assignment });
};

const claim = async (req, res) => {
  const assignment = await claimTask(req.validated.params.id, req.user, req);
  return sendData(res, { assignment }, 201);
};

const leave = async (req, res) => {
  const assignment = await leaveTask(req.validated.params.id, req.user, req);
  return sendData(res, { assignment });
};

const submit = async (req, res) => {
  const assignment = await submitTask(
    req.validated.params.id,
    req.user,
    req.validated.body,
    req
  );
  return sendData(res, { assignment });
};

module.exports = { create, list, getOne, claim, leave, submit };
