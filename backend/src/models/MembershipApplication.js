const mongoose = require("mongoose");

const membershipApplicationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    fieldOfStudy: { type: String, required: true, trim: true, maxlength: 160 },
    university: { type: String, trim: true, maxlength: 160 },
    motivation: { type: String, required: true, trim: true, maxlength: 3000 },
    skills: [{ type: String, trim: true, maxlength: 80 }],
    interests: [{ type: String, trim: true, maxlength: 80 }],
    preferredDepartment: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    weeklyMeetingPreference: { type: String, enum: ["yes", "no"] },
    availableTimes: [{ type: String, enum: ["morning", "afternoon", "evening"] }],
    favoriteCosmicPhenomenon: { type: String, trim: true, maxlength: 3000 },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    decisionNote: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

membershipApplicationSchema.index({ email: 1, status: 1 });
membershipApplicationSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);
membershipApplicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("MembershipApplication", membershipApplicationSchema);
