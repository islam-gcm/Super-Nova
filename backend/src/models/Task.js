const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    type: { type: String, enum: ["global", "department"], required: true, index: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deadline: { type: Date, required: true, index: true },
    maxAssignees: { type: Number, required: true, min: 1, max: 100 },
    assignedCount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["open", "filled", "in_progress", "submitted", "completed", "cancelled"],
      default: "open",
      index: true,
    },
    points: { type: Number, default: 10, min: 0, max: 10000 },
    notes: { type: String, trim: true, maxlength: 3000 },
  },
  { timestamps: true }
);

taskSchema.pre("validate", function validateDepartment(next) {
  if (this.type === "department" && !this.department) {
    return next(new Error("Department tasks require a department"));
  }
  if (this.type === "global") this.department = undefined;
  return next();
});

taskSchema.index({ status: 1, deadline: 1 });
taskSchema.index({ department: 1, status: 1, deadline: 1 });

module.exports = mongoose.model("Task", taskSchema);
