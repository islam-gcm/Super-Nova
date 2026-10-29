const mongoose = require("mongoose");

const siteContentSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["leader", "achievement"], required: true, index: true },
    roleTag: { type: String, trim: true, maxlength: 80 },
    fullName: { type: String, trim: true, maxlength: 120 },
    subtitleRole: { type: String, trim: true, maxlength: 160 },
    title: { type: String, trim: true, maxlength: 180 },
    subtitle: { type: String, trim: true, maxlength: 180 },
    description: { type: String, trim: true, maxlength: 5000 },
    imageUrl: { type: String, trim: true, maxlength: 500000 },
    link: { type: String, trim: true, maxlength: 2000 },
    sortOrder: { type: Number, default: 0, min: 0, max: 100000 },
  },
  { timestamps: true }
);

siteContentSchema.index({ kind: 1, sortOrder: 1, createdAt: 1 });

module.exports = mongoose.model("SiteContent", siteContentSchema);
