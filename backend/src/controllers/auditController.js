const AuditLog = require("../models/AuditLog");
const { sendData } = require("../utils/response");
const { pagination, paginationMeta } = require("../utils/pagination");

const list = async (req, res) => {
  const { page, limit, skip } = pagination(req.validated.query);
  const [logs, total] = await Promise.all([
    AuditLog.find().populate("actor", "fullName email").sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments(),
  ]);
  return sendData(res, { logs }, 200, paginationMeta(page, limit, total));
};

module.exports = { list };
