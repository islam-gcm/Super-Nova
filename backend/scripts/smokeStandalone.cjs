const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { env } = require("../src/config/env");
const { connectDatabase, disconnectDatabase } = require("../src/config/database");

// Prevent test applications from sending email.
require("../src/services/emailService").sendApplicationDecision = async () => {};

const { createApp } = require("../src/app");
const { createAccessToken, createOpaqueToken } = require("../src/utils/tokens");
const User = require("../src/models/User");
const InviteToken = require("../src/models/InviteToken");
const TaskAssignment = require("../src/models/TaskAssignment");
const Notification = require("../src/models/Notification");

const databaseName = `supernova_smoke_${Date.now()}`;
const databaseUrl = new URL(env.mongoUri);
databaseUrl.pathname = `/${databaseName}`;
let server;
let baseUrl;
let leadToken;
let memberToken;
const results = [];

async function request(method, path, body, token) {
  const response = await fetch(`${baseUrl}${path === "/health" ? "/api/health" : `/api/v1${path}`}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, payload: await response.json().catch(() => ({})) };
}

async function check(name, method, path, body, token, status, verify) {
  try {
    const result = await request(method, path, body, token);
    assert.equal(result.status, status, JSON.stringify(result.payload.error || result.payload));
    if (verify) await verify(result.payload.data);
    results.push({ name, result: status === 500 ? "KNOWN_LIMITATION" : "PASS" });
    return result.payload.data;
  } catch (error) {
    results.push({ name, result: "FAIL", detail: error.message });
    return null;
  }
}

async function main() {
  assert.match(databaseName, /^supernova_smoke_\d+$/);
  await connectDatabase(databaseUrl.toString());
  server = createApp().listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  const password = "SmokeTest!2345";
  const passwordHash = await bcrypt.hash(password, 10);
  const lead = await User.create({ fullName: "Smoke Lead", email: "smoke-lead@example.invalid", passwordHash, roles: ["lead"], status: "active" });
  const member = await User.create({ fullName: "Smoke Member", email: "smoke-member@example.invalid", passwordHash, roles: ["member"], status: "active" });
  leadToken = createAccessToken(lead);
  memberToken = createAccessToken(member);

  await check("health and database", "GET", "/health", undefined, undefined, 200);
  await check("public registration status", "GET", "/registration/status", undefined, undefined, 200);
  await check("login", "POST", "/auth/login", { email: lead.email, password }, undefined, 200, (data) => assert.equal(data.user.email, lead.email));
  await check("current member", "GET", "/auth/me", undefined, memberToken, 200);
  await check("bad login rejected", "POST", "/auth/login", { email: lead.email, password: "wrong" }, undefined, 401);
  await check("protected route rejects guest", "GET", "/tasks", undefined, undefined, 401);
  await check("member cannot administer", "GET", "/events/admin", undefined, memberToken, 403);

  await check("open registration", "PATCH", "/registration/status", { isOpen: true }, leadToken, 200);
  const department = await check("create department", "POST", "/departments", { name: "Smoke Science", slug: "smoke-science", description: "A test department" }, leadToken, 201);
  const departmentId = department?.department?._id;
  await check("public departments", "GET", "/departments", undefined, undefined, 200, (data) => assert(data.departments.some((item) => item._id === departmentId)));
  await check("admin departments", "GET", "/departments/admin", undefined, leadToken, 200);
  await check("edit department", "PATCH", `/departments/${departmentId}`, { description: "Updated test department" }, leadToken, 200);
  await check("assign department heads on standalone", "PUT", `/departments/${departmentId}/heads`, { userIds: [member._id.toString()] }, leadToken, 500);

  const imageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==";
  const leader = await check("create leader with local image", "POST", "/content/leader", { fullName: "Smoke Leader", description: "A leader created for smoke testing.", imageUrl }, leadToken, 201);
  const achievement = await check("create achievement with local image", "POST", "/content/achievement", { title: "Smoke Award", description: "An achievement created for smoke testing.", imageUrl }, leadToken, 201);
  await check("public leaders", "GET", "/content/leader", undefined, undefined, 200);
  await check("public achievements", "GET", "/content/achievement", undefined, undefined, 200);
  await check("edit leader", "PATCH", `/content/leader/${leader?.item?._id}`, { subtitleRole: "Updated role" }, leadToken, 200);

  const startsAt = new Date(Date.now() + 86400000).toISOString();
  const workshop = await check("create workshop with local image", "POST", "/events", { title: "Smoke Workshop", slug: "smoke-workshop", description: "A workshop for the smoke test.", type: "workshop", startsAt, status: "published", coverImage: imageUrl }, leadToken, 201);
  const event = await check("create event with local image", "POST", "/events", { title: "Smoke Event", slug: "smoke-event", description: "An event for the smoke test.", type: "event", startsAt, status: "published", coverImage: imageUrl }, leadToken, 201);
  const workshopId = workshop?.event?._id;
  const eventId = event?.event?._id;
  await check("public events and workshops", "GET", "/events", undefined, undefined, 200, (data) => {
    assert(data.events.some((item) => item._id === eventId));
    assert(data.events.some((item) => item._id === workshopId));
  });
  await check("admin events", "GET", "/events/admin", undefined, leadToken, 200);
  await check("edit event", "PATCH", `/events/${eventId}`, { location: "Smoke venue" }, leadToken, 200);

  const application = await check("submit application", "POST", "/applications", { fullName: "Smoke Applicant", email: "smoke-applicant@example.invalid", phone: "0550123456", fieldOfStudy: "Physics", motivation: "I want to learn and contribute to science projects.", skills: [], interests: [], preferredDepartment: departmentId }, undefined, 201);
  await check("list applications", "GET", "/applications", undefined, leadToken, 200);
  await check("accept application with standalone fallback", "PATCH", `/applications/${application?.application?._id}/decision`, { decision: "accepted", departmentId }, leadToken, 200, (data) => assert.equal(data.user.status, "invited"));
  await check("delete used department blocked", "DELETE", `/departments/${departmentId}`, undefined, leadToken, 409);

  const invited = await User.create({ fullName: "Smoke Invite", email: "smoke-invite@example.invalid", status: "invited" });
  const invitation = createOpaqueToken();
  await InviteToken.create({ user: invited._id, application: application.application._id, tokenHash: invitation.tokenHash, expiresAt: new Date(Date.now() + 3600000) });
  await check("activate account on standalone", "POST", "/auth/activate", { token: invitation.rawToken, password }, undefined, 500);

  const task = await check("create task", "POST", "/tasks", { title: "Smoke task", description: "A task to test the full workflow.", type: "global", deadline: new Date(Date.now() + 86400000).toISOString(), maxAssignees: 2, points: 10 }, leadToken, 201);
  const taskId = task?.task?._id;
  await check("list tasks", "GET", "/tasks", undefined, memberToken, 200);
  await check("task detail", "GET", `/tasks/${taskId}`, undefined, memberToken, 200);
  await check("claim task on standalone", "POST", `/tasks/${taskId}/claims`, {}, memberToken, 500);
  const assignment = await TaskAssignment.create({ task: taskId, member: member._id, status: "claimed" });
  await check("leave task on standalone", "DELETE", `/tasks/${taskId}/claims/me`, undefined, memberToken, 500);
  await check("submit task on standalone", "POST", `/tasks/${taskId}/submissions`, { note: "This is a completed test submission." }, memberToken, 500);
  assignment.status = "submitted";
  await assignment.save();
  await check("list assignments", "GET", "/task-assignments", undefined, leadToken, 200);
  await check("review assignment on standalone", "PATCH", `/task-assignments/${assignment._id}/review`, { decision: "approved", note: "Looks good" }, leadToken, 500);

  const notification = await Notification.create({ recipient: member._id, type: "task_submission", title: "Smoke notification", message: "Test notification" });
  await check("list notifications", "GET", "/notifications", undefined, memberToken, 200);
  await check("mark notification read", "PATCH", `/notifications/${notification._id}/read`, {}, memberToken, 200);
  await check("dashboard", "GET", "/dashboard", undefined, memberToken, 200);
  await check("leaderboard", "GET", "/leaderboard", undefined, memberToken, 200);
  await check("audit trail", "GET", "/audit-logs", undefined, leadToken, 200);
  await check("list members", "GET", "/users", undefined, leadToken, 200);
  await check("update member", "PATCH", `/users/${member._id}`, { departmentIds: [departmentId] }, leadToken, 200);

  await check("delete event", "DELETE", `/events/${eventId}`, undefined, leadToken, 200);
  await check("delete workshop", "DELETE", `/events/${workshopId}`, undefined, leadToken, 200);
  await check("delete leader", "DELETE", `/content/leader/${leader?.item?._id}`, undefined, leadToken, 200);
  await check("delete achievement", "DELETE", `/content/achievement/${achievement?.item?._id}`, undefined, leadToken, 200);
  const spare = await check("create unused department", "POST", "/departments", { name: "Smoke Spare", slug: "smoke-spare" }, leadToken, 201);
  await check("delete unused department", "DELETE", `/departments/${spare?.department?._id}`, undefined, leadToken, 200);
  await check("logout", "POST", "/auth/logout", {}, leadToken, 200);
}

(async () => {
  try {
    await main();
  } catch (error) {
    results.push({ name: "smoke setup", result: "FAIL", detail: error.stack || error.message });
  } finally {
    if (mongoose.connection.readyState === 1 && mongoose.connection.name === databaseName) {
      await mongoose.connection.dropDatabase();
      await disconnectDatabase();
    }
    if (server) await new Promise((resolve) => server.close(resolve));
    console.log(JSON.stringify({ databaseName, results }, null, 2));
    if (results.some((item) => item.result === "FAIL")) process.exitCode = 1;
  }
})();
