const mongoose = require("mongoose");

const inviteTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    application: { type: mongoose.Schema.Types.ObjectId, ref: "MembershipApplication", required: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    expiresAt: { type: Date, required: true },
    usedAt: Date,
  },
  { timestamps: true }
);

inviteTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("InviteToken", inviteTokenSchema);
