const MembershipApplication = require("../models/MembershipApplication");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { sendData } = require("../utils/response");
const { pagination, paginationMeta } = require("../utils/pagination");
const { decideApplication } = require("../services/applicationService");
const { assertRegistrationOpen } = require("../services/registrationService");

const create = async (req, res) => {
  await assertRegistrationOpen(ApiError);
  const input = req.validated.body;
  const [pending, existingUser] = await Promise.all([
    MembershipApplication.exists({ email: input.email, status: "pending" }),
    User.exists({ email: input.email }),
  ]);

  if (pending) throw new ApiError(409, "APPLICATION_PENDING", "An application for this email is already pending");
  if (existingUser) throw new ApiError(409, "MEMBER_ALREADY_EXISTS", "This email already belongs to a member");

  const application = await MembershipApplication.create(input);
  return sendData(res, { application }, 201);
};

const list = async (req, res) => {
  const query = req.validated.query;
  const { page, limit, skip } = pagination(query);
  const filter = query.status ? { status: query.status } : {};
  const [applications, total] = await Promise.all([
    MembershipApplication.find(filter)
      .populate("preferredDepartment", "name slug")
      .populate("reviewedBy", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    MembershipApplication.countDocuments(filter),
  ]);

  return sendData(res, { applications }, 200, paginationMeta(page, limit, total));
};

const decide = async (req, res) => {
  const { id } = req.validated.params;
  const { decision, note, departmentId } = req.validated.body;
  const result = await decideApplication({
    applicationId: id,
    decision,
    note,
    departmentId,
    reviewer: req.user,
    req,
  });

  const data = {
    application: result.application,
    user: result.user,
    emailDelivered: result.emailDelivered,
  };
  return sendData(res, data);
};

module.exports = { create, list, decide };
