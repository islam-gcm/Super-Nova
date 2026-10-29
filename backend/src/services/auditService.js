const AuditLog = require("../models/AuditLog");

const writeAudit = async (req, action, targetModel, targetId, changes, session) => {
  const entries = [{
    actor: req.user?._id,
    action,
    targetModel,
    targetId,
    changes,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  }];

  const [entry] = await AuditLog.create(entries, session ? { session } : undefined);
  return entry;
};

module.exports = { writeAudit };
