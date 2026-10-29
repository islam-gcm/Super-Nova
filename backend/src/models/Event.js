const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 180 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    type: { type: String, enum: ["workshop", "event", "announcement"], required: true },
    startsAt: { type: Date, required: true, index: true },
    endsAt: Date,
    location: { type: String, trim: true, maxlength: 300 },
    status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    coverImage: { type: String, trim: true, maxlength: 500000 },
    tag: { type: String, trim: true, maxlength: 80 },
    subtitle: { type: String, trim: true, maxlength: 180 },
    presenterName: { type: String, trim: true, maxlength: 160 },
    link: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

eventSchema.index({ slug: 1 }, { unique: true });
eventSchema.index({ status: 1, startsAt: 1 });

module.exports = mongoose.model("Event", eventSchema);
