const mongoose = require("mongoose");
const { ROLES } = require("../constants");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    passwordHash: { type: String, select: false },
    phone: { type: String, trim: true, maxlength: 30 },
    roles: {
      type: [{ type: String, enum: Object.values(ROLES) }],
      default: [ROLES.MEMBER],
      validate: [(roles) => roles.length > 0, "A user must have at least one role"],
    },
    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Department" }],
    status: {
      type: String,
      enum: ["invited", "active", "suspended"],
      default: "invited",
      index: true,
    },
    points: { type: Number, default: 0, min: 0 },
    completedTasksCount: { type: Number, default: 0, min: 0 },
    lastLoginAt: Date,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ points: -1, completedTasksCount: -1, fullName: 1 });

userSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
