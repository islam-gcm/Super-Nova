const Event = require("../models/Event");
const ApiError = require("../utils/ApiError");
const { sendData } = require("../utils/response");
const { writeAudit } = require("../services/auditService");

const publicList = async (_req, res) => {
  const events = await Event.find({ status: "published" })
    .select("title slug description type startsAt endsAt location coverImage tag subtitle presenterName link")
    .sort({ startsAt: 1 });
  return sendData(res, { events });
};

const adminList = async (_req, res) => {
  const events = await Event.find().populate("createdBy", "fullName").sort({ startsAt: -1 });
  return sendData(res, { events });
};

const create = async (req, res) => {
  const event = await Event.create({ ...req.validated.body, createdBy: req.user._id });
  await writeAudit(req, "event.created", "Event", event._id, req.validated.body);
  return sendData(res, { event }, 201);
};

const update = async (req, res) => {
  const event = await Event.findById(req.validated.params.id);
  if (!event) throw new ApiError(404, "EVENT_NOT_FOUND", "Event not found");

  event.set(req.validated.body);
  if (event.endsAt && event.endsAt < event.startsAt) {
    throw new ApiError(422, "INVALID_EVENT_DATES", "End time cannot be before start time");
  }
  await event.save();
  await writeAudit(req, "event.updated", "Event", event._id, req.validated.body);
  return sendData(res, { event });
};

const remove = async (req, res) => {
  const event = await Event.findByIdAndDelete(req.validated.params.id);
  if (!event) throw new ApiError(404, "EVENT_NOT_FOUND", "Event not found");
  await writeAudit(req, "event.deleted", "Event", event._id, event.toObject());
  return sendData(res, { deletedId: event._id });
};

module.exports = { publicList, adminList, create, update, remove };
