const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 1000 },
    imageUrl: { type: String, trim: true, maxlength: 500000 },
    heads: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

departmentSchema.index({ slug: 1 }, { unique: true });
departmentSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("Department", departmentSchema);
