const Notification = require("../models/Notification");
const ApiError = require("../utils/ApiError");
const { sendData } = require("../utils/response");
const { pagination, paginationMeta } = require("../utils/pagination");

const list = async (req, res) => {
  const { page, limit, skip } = pagination(req.validated.query);
  const filter = { recipient: req.user._id };
  const [notifications, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, readAt: { $exists: false } }),
  ]);
  return sendData(res, { notifications, unread }, 200, paginationMeta(page, limit, total));
};

const markRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.validated.params.id, recipient: req.user._id },
    { $set: { readAt: new Date() } },
    { new: true }
  );
  if (!notification) throw new ApiError(404, "NOTIFICATION_NOT_FOUND", "Notification not found");
  return sendData(res, { notification });
};

module.exports = { list, markRead };
