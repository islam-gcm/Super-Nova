const mongoose = require("mongoose");
const Department = require("../models/Department");
const User = require("../models/User");
const Task = require("../models/Task");
const MembershipApplication = require("../models/MembershipApplication");
const ApiError = require("../utils/ApiError");
const { sendData } = require("../utils/response");
const { ROLES } = require("../constants");
const { writeAudit } = require("../services/auditService");

const list = async (_req, res) => {
  const departments = await Department.find({ isActive: true })
    .populate("heads", "fullName email")
    .sort({ name: 1 });
  return sendData(res, { departments });
};

const adminList = async (_req, res) => {
  const departments = await Department.find()
    .populate("heads", "fullName email")
    .sort({ isActive: -1, name: 1 });
  return sendData(res, { departments });
};

const create = async (req, res) => {
  const department = await Department.create(req.validated.body);
  await writeAudit(req, "department.created", "Department", department._id, req.validated.body);
  return sendData(res, { department }, 201);
};

const update = async (req, res) => {
  const department = await Department.findByIdAndUpdate(
    req.validated.params.id,
    { $set: req.validated.body },
    { new: true, runValidators: true }
  );
  if (!department) throw new ApiError(404, "DEPARTMENT_NOT_FOUND", "Department not found");
  await writeAudit(req, "department.updated", "Department", department._id, req.validated.body);
  return sendData(res, { department });
};

const remove = async (req, res) => {
  const { id } = req.validated.params;
  const department = await Department.findById(id);
  if (!department) throw new ApiError(404, "DEPARTMENT_NOT_FOUND", "Department not found");
  const [members, tasks, applications] = await Promise.all([
    User.exists({ departments: id }),
    Task.exists({ department: id }),
    MembershipApplication.exists({ preferredDepartment: id }),
  ]);
  if (members || tasks || applications) {
    throw new ApiError(409, "DEPARTMENT_IN_USE", "This department has members, tasks, or applications. Set it inactive instead.");
  }
  await Department.deleteOne({ _id: id });
  await writeAudit(req, "department.deleted", "Department", department._id, department.toObject());
  return sendData(res, { deletedId: department._id });
};

const setHeads = async (req, res) => {
  const { id } = req.validated.params;
  const uniqueUserIds = [...new Set(req.validated.body.userIds)];
  const session = await mongoose.startSession();
  let department;

  try {
    await session.withTransaction(async () => {
      department = await Department.findById(id).session(session);
      if (!department) throw new ApiError(404, "DEPARTMENT_NOT_FOUND", "Department not found");

      const validUsers = await User.countDocuments({
        _id: { $in: uniqueUserIds },
        status: "active",
      }).session(session);
      if (validUsers !== uniqueUserIds.length) {
        throw new ApiError(422, "INVALID_DEPARTMENT_HEAD", "Every department head must be an active user");
      }

      const previousIds = department.heads.map(String);
      const removedIds = previousIds.filter((userId) => !uniqueUserIds.includes(userId));
      department.heads = uniqueUserIds;
      await department.save({ session });

      if (uniqueUserIds.length) {
        await User.updateMany(
          { _id: { $in: uniqueUserIds } },
          { $addToSet: { roles: ROLES.DEPARTMENT_HEAD, departments: department._id } },
          { session }
        );
      }

      for (const removedId of removedIds) {
        await User.updateOne({ _id: removedId }, { $pull: { departments: department._id } }, { session });
        const otherHeadships = await Department.countDocuments({
          _id: { $ne: department._id },
          heads: removedId,
        }).session(session);
        if (otherHeadships === 0) {
          await User.updateOne({ _id: removedId }, { $pull: { roles: ROLES.DEPARTMENT_HEAD } }, { session });
        }
      }

      await writeAudit(req, "department.heads_updated", "Department", department._id, {
        previousIds,
        userIds: uniqueUserIds,
      }, session);
    });
  } finally {
    await session.endSession();
  }

  await department.populate("heads", "fullName email");
  return sendData(res, { department });
};

module.exports = { list, adminList, create, update, remove, setHeads };
