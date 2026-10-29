const mongoose = require("mongoose");

const registrationSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, enum: ["global"], unique: true, default: "global" },
    isOpenOverride: { type: Boolean, default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RegistrationSettings", registrationSettingsSchema);
