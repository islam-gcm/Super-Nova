const SiteContent = require("../models/SiteContent");
const ApiError = require("../utils/ApiError");
const { sendData } = require("../utils/response");
const { writeAudit } = require("../services/auditService");

const KIND_FIELDS = {
  leader: ["roleTag", "fullName", "subtitleRole", "description", "imageUrl", "sortOrder"],
  achievement: ["title", "subtitle", "description", "imageUrl", "link", "sortOrder"],
};

const assertKind = (kind) => {
  if (!KIND_FIELDS[kind]) throw new ApiError(404, "CONTENT_KIND_NOT_FOUND", "Content kind not found");
};

const cleanBody = (kind, body) => {
  return Object.fromEntries(Object.entries(body).filter(([key]) => KIND_FIELDS[kind].includes(key)));
};

const requiredFields = (kind, body) => {
  const fields = kind === "leader" ? ["fullName", "description"] : ["title", "description"];
  return fields.filter((field) => !String(body[field] || "").trim());
};

const publicList = async (req, res) => {
  assertKind(req.params.kind);
  const items = await SiteContent.find({ kind: req.params.kind })
    .sort({ sortOrder: 1, createdAt: 1 })
    .select("-__v");
  return sendData(res, { items });
};

const adminList = async (req, res) => {
  return publicList(req, res);
};

const create = async (req, res) => {
  const { kind } = req.validated.params;
  const body = cleanBody(kind, req.validated.body);
  const missing = requiredFields(kind, body);
  if (missing.length) throw new ApiError(422, "CONTENT_REQUIRED", `Missing required fields: ${missing.join(", ")}`);

  const item = await SiteContent.create({ kind, ...body });
  await writeAudit(req, `content.${kind}.created`, "SiteContent", item._id, body);
  return sendData(res, { item }, 201);
};

const update = async (req, res) => {
  const { kind, id } = req.validated.params;
  const body = cleanBody(kind, req.validated.body);
  const item = await SiteContent.findOne({ _id: id, kind });
  if (!item) throw new ApiError(404, "CONTENT_NOT_FOUND", "Content item not found");

  item.set(body);
  const missing = requiredFields(kind, item);
  if (missing.length) throw new ApiError(422, "CONTENT_REQUIRED", `Missing required fields: ${missing.join(", ")}`);
  await item.save();
  await writeAudit(req, `content.${kind}.updated`, "SiteContent", item._id, body);
  return sendData(res, { item });
};

const remove = async (req, res) => {
  const { kind, id } = req.validated.params;
  const item = await SiteContent.findOneAndDelete({ _id: id, kind });
  if (!item) throw new ApiError(404, "CONTENT_NOT_FOUND", "Content item not found");

  await writeAudit(req, `content.${kind}.deleted`, "SiteContent", item._id, item.toObject());
  return sendData(res, { item });
};

module.exports = { adminList, create, publicList, remove, update };
