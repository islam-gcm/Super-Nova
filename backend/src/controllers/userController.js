const User = require("../models/User");
const Department = require("../models/Department");
const ApiError = require("../utils/ApiError");
const { sendData } = require("../utils/response");
const { pagination, paginationMeta } = require("../utils/pagination");
const { ROLES } = require("../constants");
const { writeAudit } = require("../services/auditService");

const list = async (req, res) => {
  const { page, limit, skip } = pagination(req.validated.query);
  const [users, total] = await Promise.all([
    User.find().populate("departments", "name slug").sort({ fullName: 1 }).skip(skip).limit(limit),
    User.countDocuments(),
  ]);
  return sendData(res, { users }, 200, paginationMeta(page, limit, total));
};

const update = async (req, res) => {
  const { roles, departmentIds, status } = req.validated.body;
  const user = await User.findById(req.validated.params.id);
  if (!user) throw new ApiError(404, "USER_NOT_FOUND", "User not found");

  const removesActiveLead = user.roles.includes(ROLES.LEAD)
    && ((roles && !roles.includes(ROLES.LEAD)) || status === "suspended");
  if (removesActiveLead) {
    const otherActiveLeads = await User.countDocuments({
      _id: { $ne: user._id },
      roles: ROLES.LEAD,
      status: "active",
    });
    if (otherActiveLeads === 0) {
      throw new ApiError(409, "LAST_LEAD_REQUIRED", "Create another active lead before changing this account");
    }
  }

  if (departmentIds) {
    const uniqueDepartmentIds = [...new Set(departmentIds)];
    const [activeCount, headDepartments] = await Promise.all([
      Department.countDocuments({ _id: { $in: uniqueDepartmentIds }, isActive: true }),
      Department.find({ heads: user._id }).select("_id").lean(),
    ]);

    if (activeCount !== uniqueDepartmentIds.length) {
      throw new ApiError(422, "DEPARTMENT_NOT_FOUND", "Every assigned department must be active");
    }

    const assigned = new Set(uniqueDepartmentIds);
    if (headDepartments.some((department) => !assigned.has(String(department._id)))) {
      throw new ApiError(
        409,
        "DEPARTMENT_HEAD_ASSIGNMENT_REQUIRED",
        "Remove the user as department head before removing that department"
      );
    }
    user.departments = uniqueDepartmentIds;
  }

  if (roles) {
    const nextRoles = [...new Set(roles)];
    if (user.roles.includes(ROLES.DEPARTMENT_HEAD)) nextRoles.push(ROLES.DEPARTMENT_HEAD);
    user.roles = [...new Set(nextRoles)];
  }

  if (status) {
    if (user.status === "invited" && status === "active") {
      throw new ApiError(409, "INVITE_ACTIVATION_REQUIRED", "Invited users must activate their own account");
    }
    user.status = status;
  }

  await user.save();
  await writeAudit(req, "user.access_updated", "User", user._id, {
    roles,
    departmentIds,
    status,
  });
  await user.populate("departments", "name slug");
  return sendData(res, { user });
};

module.exports = { list, update };
