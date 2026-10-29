const mongoose = require("mongoose");

const taskAssignmentSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["claimed", "left", "submitted", "approved", "rejected"],
      default: "claimed",
      index: true,
    },
    claimedAt: { type: Date, default: Date.now },
    leftAt: Date,
    submittedAt: Date,
    submissionNote: { type: String, trim: true, maxlength: 3000 },
    submissionUrl: { type: String, trim: true, maxlength: 2000 },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    reviewNote: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

taskAssignmentSchema.index({ task: 1, member: 1 }, { unique: true });
taskAssignmentSchema.index({ member: 1, status: 1, updatedAt: -1 });
taskAssignmentSchema.index({ task: 1, status: 1 });

module.exports = mongoose.model("TaskAssignment", taskAssignmentSchema);
