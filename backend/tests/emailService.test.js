const assert = require("node:assert/strict");
const { test } = require("node:test");

process.env.BREVO_API_KEY = "test-api-key";
process.env.EMAIL_FROM = "SuperNova Club <sender@example.com>";
process.env.CLIENT_URL = "https://app.example.com";

const { sendApplicationDecision } = require("../src/services/emailService");

test("accepted applications send an activation link through Brevo HTTPS", async () => {
  const originalFetch = global.fetch;
  let request;
  global.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, status: 201, json: async () => ({ messageId: "test-message" }) };
  };

  try {
    const result = await sendApplicationDecision({
      application: { email: "member@example.com" },
      decision: "accepted",
      inviteToken: "token with spaces",
    });

    assert.equal(result.messageId, "test-message");
    assert.equal(request.url, "https://api.brevo.com/v3/smtp/email");
    assert.equal(request.options.headers["api-key"], "test-api-key");
    const body = JSON.parse(request.options.body);
    assert.deepEqual(body.sender, { name: "SuperNova Club", email: "sender@example.com" });
    assert.deepEqual(body.to, [{ email: "member@example.com" }]);
    assert.match(body.textContent, /https:\/\/app\.example\.com\/activate\?token=token%20with%20spaces/);
  } finally {
    global.fetch = originalFetch;
  }
});

test("Brevo rejects a decision email with an HTTP error", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: false, status: 401 });

  try {
    await assert.rejects(
      sendApplicationDecision({ application: { email: "member@example.com" }, decision: "rejected" }),
      /status 401/
    );
  } finally {
    global.fetch = originalFetch;
  }
});
