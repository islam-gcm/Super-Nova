const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true, trim: true, maxlength: 120 },
    targetModel: { type: String, required: true, trim: true, maxlength: 80 },
    targetId: mongoose.Schema.Types.ObjectId,
    changes: mongoose.Schema.Types.Mixed,
    ip: { type: String, trim: true, maxlength: 100 },
    userAgent: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ targetModel: 1, targetId: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
