const mongoose = require("mongoose");
const Task = require("../models/Task");
const TaskAssignment = require("../models/TaskAssignment");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { PRIVILEGED_ROLES, ROLES } = require("../constants");
const { writeAudit } = require("./auditService");
const { notifyRecipients, findTaskManagerIds } = require("./notificationService");

const isPrivileged = (user) => {
  return user.roles.some((role) => PRIVILEGED_ROLES.includes(role));
};

const managesDepartment = (user, departmentId) => {
  return user.roles.includes(ROLES.DEPARTMENT_HEAD)
    && user.departments.some((id) => id.equals(departmentId));
};

const assertCanManageTask = (user, task) => {
  if (isPrivileged(user)) return;
  if (task.type === "department" && task.department && managesDepartment(user, task.department)) return;
  throw new ApiError(403, "TASK_SCOPE_FORBIDDEN", "You cannot manage tasks outside your department");
};

const claimTask = async (taskId, member, req) => {
  const session = await mongoose.startSession();
  let assignment;

  try {
    await session.withTransaction(async () => {
      const visibleTask = await Task.findById(taskId).session(session);
      if (!visibleTask) throw new ApiError(404, "TASK_NOT_FOUND", "Task not found");

      const canSee = visibleTask.type === "global"
        || member.departments.some((id) => id.equals(visibleTask.department));
      if (!canSee) throw new ApiError(403, "TASK_SCOPE_FORBIDDEN", "This task belongs to another department");

      const task = await Task.findOneAndUpdate(
        {
          _id: taskId,
          status: "open",
          deadline: { $gt: new Date() },
          $expr: { $lt: ["$assignedCount", "$maxAssignees"] },
        },
        { $inc: { assignedCount: 1 } },
        { new: true, session }
      );

      if (!task) {
        throw new ApiError(409, "TASK_UNAVAILABLE", "This task is full, closed, or past its deadline");
      }

      assignment = await TaskAssignment.findOne({ task: taskId, member: member._id }).session(session);
      if (assignment && ["claimed", "submitted", "approved"].includes(assignment.status)) {
        throw new ApiError(409, "TASK_ALREADY_CLAIMED", "You already have an active assignment for this task");
      }

      if (assignment) {
        assignment.set({
          status: "claimed",
          claimedAt: new Date(),
          leftAt: undefined,
          submittedAt: undefined,
          submissionNote: undefined,
          submissionUrl: undefined,
          reviewedBy: undefined,
          reviewedAt: undefined,
          reviewNote: undefined,
        });
        await assignment.save({ session });
      } else {
        [assignment] = await TaskAssignment.create([{
          task: taskId,
          member: member._id,
          status: "claimed",
        }], { session });
      }

      if (task.assignedCount >= task.maxAssignees) {
        task.status = "filled";
        await task.save({ session });
      }

      await writeAudit(req, "task.claimed", "TaskAssignment", assignment._id, { taskId }, session);
    });
  } finally {
    await session.endSession();
  }

  return assignment;
};

const leaveTask = async (taskId, member, req) => {
  const session = await mongoose.startSession();
  let assignment;

  try {
    await session.withTransaction(async () => {
      assignment = await TaskAssignment.findOneAndUpdate(
        { task: taskId, member: member._id, status: "claimed" },
        { $set: { status: "left", leftAt: new Date() } },
        { new: true, session }
      );
      if (!assignment) throw new ApiError(409, "ASSIGNMENT_NOT_LEAVABLE", "Only a claimed task can be left");

      const task = await Task.findOneAndUpdate(
        { _id: taskId, assignedCount: { $gt: 0 }, status: { $nin: ["completed", "cancelled"] } },
        { $inc: { assignedCount: -1 }, $set: { status: "open" } },
        { new: true, session }
      );
      if (!task) throw new ApiError(409, "TASK_NOT_REOPENABLE", "This task can no longer be reopened");

      await writeAudit(req, "task.left", "TaskAssignment", assignment._id, { taskId }, session);
    });
  } finally {
    await session.endSession();
  }

  return assignment;
};

const submitTask = async (taskId, member, submission, req) => {
  const session = await mongoose.startSession();
  let assignment;

  try {
    await session.withTransaction(async () => {
      assignment = await TaskAssignment.findOneAndUpdate(
        { task: taskId, member: member._id, status: "claimed" },
        {
          $set: {
            status: "submitted",
            submittedAt: new Date(),
            submissionNote: submission.note,
            submissionUrl: submission.url,
          },
        },
        { new: true, session }
      );
      if (!assignment) throw new ApiError(409, "ASSIGNMENT_NOT_SUBMITTABLE", "Only a claimed task can be submitted");

      const task = await Task.findById(taskId).session(session);
      if (!task) throw new ApiError(404, "TASK_NOT_FOUND", "Task not found");

      const activeNotSubmitted = await TaskAssignment.countDocuments({
        task: taskId,
        status: "claimed",
      }).session(session);
      if (task.assignedCount >= task.maxAssignees && activeNotSubmitted === 0) {
        task.status = "submitted";
        await task.save({ session });
      }

      const managerIds = await findTaskManagerIds(task, session);
      await notifyRecipients(managerIds, {
        type: "task_submission",
        title: "Task submitted",
        message: `${member.fullName} submitted ${task.title}`,
        link: `/tasks/${task.id}/assignments/${assignment.id}`,
        relatedType: "TaskAssignment",
        relatedId: assignment._id,
      }, session);

      await writeAudit(req, "task.submitted", "TaskAssignment", assignment._id, { taskId }, session);
    });
  } finally {
    await session.endSession();
  }

  return assignment;
};

const reviewAssignment = async (assignmentId, reviewer, decision, note, req) => {
  const session = await mongoose.startSession();
  let assignment;

  try {
    await session.withTransaction(async () => {
      assignment = await TaskAssignment.findById(assignmentId).session(session);
      if (!assignment) throw new ApiError(404, "ASSIGNMENT_NOT_FOUND", "Task assignment not found");
      if (assignment.status !== "submitted") {
        throw new ApiError(409, "ASSIGNMENT_ALREADY_REVIEWED", "Only submitted assignments can be reviewed");
      }

      const task = await Task.findById(assignment.task).session(session);
      if (!task) throw new ApiError(404, "TASK_NOT_FOUND", "Task not found");
      assertCanManageTask(reviewer, task);

      assignment.status = decision;
      assignment.reviewedBy = reviewer._id;
      assignment.reviewedAt = new Date();
      assignment.reviewNote = note;
      await assignment.save({ session });

      if (decision === "approved") {
        await User.updateOne(
          { _id: assignment.member },
          { $inc: { points: task.points, completedTasksCount: 1 } },
          { session }
        );

        const approvedCount = await TaskAssignment.countDocuments({ task: task._id, status: "approved" }).session(session);
        task.status = approvedCount >= task.maxAssignees ? "completed" : "in_progress";
      } else {
        task.assignedCount = Math.max(0, task.assignedCount - 1);
        task.status = "open";
      }
      await task.save({ session });

      await notifyRecipients([assignment.member], {
        type: `task_${decision}`,
        title: decision === "approved" ? "Task approved" : "Task needs another volunteer",
        message: decision === "approved"
          ? `${task.title} was approved. You earned ${task.points} points.`
          : `${task.title} was not approved.${note ? ` ${note}` : ""}`,
        link: `/tasks/${task.id}`,
        relatedType: "TaskAssignment",
        relatedId: assignment._id,
      }, session);

      await writeAudit(req, `task.${decision}`, "TaskAssignment", assignment._id, {
        taskId: task.id,
        points: decision === "approved" ? task.points : 0,
      }, session);
    });
  } finally {
    await session.endSession();
  }

  return assignment;
};

module.exports = {
  isPrivileged,
  managesDepartment,
  assertCanManageTask,
  claimTask,
  leaveTask,
  submitTask,
  reviewAssignment,
};
