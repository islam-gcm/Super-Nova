const mongoose = require("mongoose");
const MembershipApplication = require("../models/MembershipApplication");
const InviteToken = require("../models/InviteToken");
const User = require("../models/User");
const Department = require("../models/Department");
const AuditLog = require("../models/AuditLog");
const ApiError = require("../utils/ApiError");
const { createOpaqueToken } = require("../utils/tokens");
const { env } = require("../config/env");
const { ROLES } = require("../constants");
const { writeAudit } = require("./auditService");
const { sendApplicationDecision } = require("./emailService");
const { supportsTransactions } = require("../config/database");

const decideApplicationWithoutTransaction = async ({ applicationId, decision, note, departmentId, reviewer, req }) => {
  let application;
  let user;
  let inviteToken;
  let auditEntry;

  try {
    application = await MembershipApplication.findOneAndUpdate(
      { _id: applicationId, status: "pending" },
      {
        $set: {
          status: decision,
          decisionNote: note,
          reviewedBy: reviewer._id,
          reviewedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!application) {
      throw new ApiError(409, "APPLICATION_ALREADY_REVIEWED", "This application has already been reviewed");
    }

    let rawToken;
    if (decision === "accepted") {
      const existingUser = await User.findOne({ email: application.email });
      if (existingUser) {
        throw new ApiError(409, "USER_ALREADY_EXISTS", "A user already exists for this email address");
      }

      const departmentExists = await Department.exists({ _id: departmentId, isActive: true });
      if (!departmentExists) {
        throw new ApiError(422, "DEPARTMENT_NOT_FOUND", "The selected department is unavailable");
      }

      user = await User.create({
        fullName: application.fullName,
        email: application.email,
        phone: application.phone,
        roles: [ROLES.MEMBER],
        departments: departmentId ? [departmentId] : [],
        status: "invited",
      });

      const generated = createOpaqueToken();
      rawToken = generated.rawToken;
      inviteToken = await InviteToken.create({
        user: user._id,
        application: application._id,
        tokenHash: generated.tokenHash,
        expiresAt: new Date(Date.now() + env.inviteExpiresHours * 60 * 60 * 1000),
      });
    }

    auditEntry = await writeAudit(req, `application.${decision}`, "MembershipApplication", application._id, {
      decision,
      departmentId,
    });

    return { application, user, rawToken };
  } catch (error) {
    if (auditEntry) await AuditLog.deleteOne({ _id: auditEntry._id });
    if (inviteToken) await InviteToken.deleteOne({ _id: inviteToken._id });
    if (user) await User.deleteOne({ _id: user._id });
    if (application) {
      await MembershipApplication.updateOne(
        { _id: application._id, status: decision, reviewedBy: reviewer._id },
        {
          $set: { status: "pending" },
          $unset: { decisionNote: "", reviewedBy: "", reviewedAt: "" },
        }
      );
    }
    throw error;
  }
};

const sendDecisionEmail = async (result, decision) => {
  let emailDelivered = true;
  try {
    await sendApplicationDecision({
      application: result.application,
      decision,
      inviteToken: result.rawToken,
    });
  } catch (_error) {
    emailDelivered = false;
  }
  return { application: result.application, user: result.user, emailDelivered };
};

const decideApplication = async ({ applicationId, decision, note, departmentId, reviewer, req }) => {
  if (!supportsTransactions()) {
    const result = await decideApplicationWithoutTransaction({ applicationId, decision, note, departmentId, reviewer, req });
    return sendDecisionEmail(result, decision);
  }

  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      const application = await MembershipApplication.findOneAndUpdate(
        { _id: applicationId, status: "pending" },
        {
          $set: {
            status: decision,
            decisionNote: note,
            reviewedBy: reviewer._id,
            reviewedAt: new Date(),
          },
        },
        { new: true, session }
      );

      if (!application) {
        throw new ApiError(409, "APPLICATION_ALREADY_REVIEWED", "This application has already been reviewed");
      }

      let rawToken;
      let user;

      if (decision === "accepted") {
        const existingUser = await User.findOne({ email: application.email }).session(session);
        if (existingUser) {
          throw new ApiError(409, "USER_ALREADY_EXISTS", "A user already exists for this email address");
        }

        const departmentExists = await Department.exists({ _id: departmentId, isActive: true }).session(session);
        if (!departmentExists) {
          throw new ApiError(422, "DEPARTMENT_NOT_FOUND", "The selected department is unavailable");
        }

        [user] = await User.create([{
          fullName: application.fullName,
          email: application.email,
          phone: application.phone,
          roles: [ROLES.MEMBER],
          departments: departmentId ? [departmentId] : [],
          status: "invited",
        }], { session });

        const generated = createOpaqueToken();
        rawToken = generated.rawToken;
        await InviteToken.create([{
          user: user._id,
          application: application._id,
          tokenHash: generated.tokenHash,
          expiresAt: new Date(Date.now() + env.inviteExpiresHours * 60 * 60 * 1000),
        }], { session });
      }

      await writeAudit(req, `application.${decision}`, "MembershipApplication", application._id, {
        decision,
        departmentId,
      }, session);

      result = { application, user, rawToken };
    });
  } finally {
    await session.endSession();
  }

  return sendDecisionEmail(result, decision);
};

module.exports = { decideApplication };
