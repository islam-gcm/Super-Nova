const { z } = require("zod");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid resource identifier");
const optionalObjectId = z.preprocess((value) => value === "" ? undefined : value, objectId.optional());
const email = z.string().trim().toLowerCase().email().max(254);
const password = z.string().min(10).max(128)
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/\d/, "Password must contain a number");
const pageQuery = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};
const empty = z.object({}).passthrough();
const contentKind = z.object({ body: empty, params: z.object({ kind: z.enum(["leader", "achievement"]) }), query: empty });
const assetUrl = z.string().trim().max(500000).refine(
  (value) => value === "" || /^(?:https?:\/\/|data:image\/(?:png|jpe?g|webp);base64,)/i.test(value),
  "Image must be an HTTP(S) URL or a PNG/JPEG/WebP data URL"
);
const externalUrl = z.string().trim().max(2000).refine(
  (value) => /^https?:\/\//i.test(value),
  "Link must use HTTP(S)"
);

const applicationCreate = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).max(120),
    email,
    phone: z.string().trim().min(5).max(30),
    fieldOfStudy: z.string().trim().min(2).max(160),
    university: z.string().trim().max(160).optional(),
    motivation: z.string().trim().min(20).max(3000),
    skills: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
    interests: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
    preferredDepartment: objectId.optional(),
    weeklyMeetingPreference: z.enum(["yes", "no"]).optional(),
    availableTimes: z.array(z.enum(["morning", "afternoon", "evening"])).max(3).default([]),
    favoriteCosmicPhenomenon: z.string().trim().max(3000).optional(),
  }).strict(),
  params: empty,
  query: empty,
});

const applicationList = z.object({
  body: empty,
  params: empty,
  query: z.object({ ...pageQuery, status: z.enum(["pending", "accepted", "rejected"]).optional() }),
});

const applicationDecision = z.object({
  body: z.object({
    decision: z.enum(["accepted", "rejected"]),
    note: z.string().trim().max(1000).optional(),
    departmentId: optionalObjectId,
  }).superRefine((value, ctx) => {
    if (value.decision === "accepted" && !value.departmentId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["departmentId"], message: "Accepted members need a department" });
    }
  }),
  params: z.object({ id: objectId }),
  query: empty,
});

const login = z.object({
  body: z.object({ email, password: z.string().min(1).max(128) }).strict(),
  params: empty,
  query: empty,
});

const activateInvite = z.object({
  body: z.object({ token: z.string().min(20).max(200), password }).strict(),
  params: empty,
  query: empty,
});

const departmentCreate = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
    description: z.string().trim().max(1000).optional(),
    imageUrl: assetUrl.optional(),
  }).strict(),
  params: empty,
  query: empty,
});

const departmentUpdate = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100).optional(),
    description: z.string().trim().max(1000).optional(),
    imageUrl: assetUrl.optional(),
    isActive: z.boolean().optional(),
  }).strict().refine((value) => Object.keys(value).length > 0, "At least one field is required"),
  params: z.object({ id: objectId }),
  query: empty,
});

const departmentHeads = z.object({
  body: z.object({ userIds: z.array(objectId).max(20) }).strict(),
  params: z.object({ id: objectId }),
  query: empty,
});

const taskCreate = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(180),
    description: z.string().trim().min(10).max(5000),
    type: z.enum(["global", "department"]),
    departmentId: objectId.optional(),
    deadline: z.coerce.date().refine((date) => date > new Date(), "Deadline must be in the future"),
    maxAssignees: z.coerce.number().int().min(1).max(100),
    points: z.coerce.number().int().min(0).max(10000).default(10),
    notes: z.string().trim().max(3000).optional(),
  }).superRefine((value, ctx) => {
    if (value.type === "department" && !value.departmentId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["departmentId"], message: "Department tasks need a department" });
    }
    if (value.type === "global" && value.departmentId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["departmentId"], message: "Global tasks cannot have a department" });
    }
  }),
  params: empty,
  query: empty,
});

const taskList = z.object({
  body: empty,
  params: empty,
  query: z.object({
    ...pageQuery,
    status: z.enum(["open", "filled", "in_progress", "submitted", "completed", "cancelled"]).optional(),
    type: z.enum(["global", "department"]).optional(),
    departmentId: objectId.optional(),
  }),
});

const idParam = z.object({ body: empty, params: z.object({ id: objectId }), query: empty });
const taskAction = z.object({ body: empty, params: z.object({ id: objectId }), query: empty });
const taskSubmit = z.object({
  body: z.object({
    note: z.string().trim().min(3).max(3000),
    url: externalUrl.optional(),
  }).strict(),
  params: z.object({ id: objectId }),
  query: empty,
});

const assignmentReview = z.object({
  body: z.object({
    decision: z.enum(["approved", "rejected"]),
    note: z.string().trim().max(2000).optional(),
  }).strict(),
  params: z.object({ id: objectId }),
  query: empty,
});

const registrationStatusUpdate = z.object({
  body: z.object({ isOpen: z.boolean() }).strict(),
  params: empty,
  query: empty,
});

const assignmentList = z.object({
  body: empty,
  params: empty,
  query: z.object({
    ...pageQuery,
    status: z.enum(["claimed", "left", "submitted", "approved", "rejected"]).optional(),
    taskId: objectId.optional(),
  }),
});

const eventBody = z.object({
    title: z.string().trim().min(3).max(180),
    slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
    description: z.string().trim().min(10).max(5000),
    type: z.enum(["workshop", "event", "announcement"]),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date().optional(),
    location: z.string().trim().max(300).optional(),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
    coverImage: assetUrl.optional(),
    tag: z.string().trim().max(80).optional(),
    subtitle: z.string().trim().max(180).optional(),
    presenterName: z.string().trim().max(160).optional(),
    link: externalUrl.optional(),
  });

const validateEventDates = (value, ctx) => {
    if (value.endsAt && value.endsAt < value.startsAt) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["endsAt"], message: "End time cannot be before start time" });
    }
  };

const eventCreate = z.object({
  body: eventBody.superRefine(validateEventDates),
  params: empty,
  query: empty,
});

const eventUpdate = z.object({
  body: eventBody.partial().refine((value) => Object.keys(value).length > 0, "At least one field is required"),
  params: z.object({ id: objectId }),
  query: empty,
});

const userUpdate = z.object({
  body: z.object({
    roles: z.array(z.enum(["lead", "hr", "member"])).min(1).max(3).optional(),
    departmentIds: z.array(objectId).max(20).optional(),
    status: z.enum(["active", "suspended"]).optional(),
  }).strict().refine((value) => Object.keys(value).length > 0, "At least one field is required"),
  params: z.object({ id: objectId }),
  query: empty,
});

const listQuery = z.object({ body: empty, params: empty, query: z.object(pageQuery) });

const contentFields = {
  roleTag: z.string().trim().max(80).optional(),
  fullName: z.string().trim().max(120).optional(),
  subtitleRole: z.string().trim().max(160).optional(),
  title: z.string().trim().max(180).optional(),
  subtitle: z.string().trim().max(180).optional(),
  description: z.string().trim().max(5000).optional(),
  imageUrl: assetUrl.optional(),
  link: externalUrl.optional(),
  sortOrder: z.coerce.number().int().min(0).max(100000).optional(),
};
const contentCreate = z.object({ body: z.object(contentFields).strict(), params: z.object({ kind: z.enum(["leader", "achievement"]) }), query: empty });
const contentUpdate = z.object({ body: z.object(contentFields).strict().refine((value) => Object.keys(value).length > 0, "At least one field is required"), params: z.object({ kind: z.enum(["leader", "achievement"]), id: objectId }), query: empty });
const contentItem = z.object({ body: empty, params: z.object({ kind: z.enum(["leader", "achievement"]), id: objectId }), query: empty });

module.exports = {
  applicationCreate,
  applicationList,
  applicationDecision,
  registrationStatusUpdate,
  login,
  activateInvite,
  departmentCreate,
  departmentUpdate,
  departmentHeads,
  taskCreate,
  taskList,
  idParam,
  taskAction,
  taskSubmit,
  assignmentReview,
  assignmentList,
  eventCreate,
  eventUpdate,
  userUpdate,
  listQuery,
  contentKind,
  contentCreate,
  contentUpdate,
  contentItem,
};
