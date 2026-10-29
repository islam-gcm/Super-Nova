const nodemailer = require("nodemailer");
const { env } = require("../config/env");

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  const smtpConfigured = env.smtp.host && env.smtp.user && env.smtp.pass;
  transporter = smtpConfigured
    ? nodemailer.createTransport({
        host: env.smtp.host,
        port: env.smtp.port,
        secure: env.smtp.secure,
        requireTLS: !env.smtp.secure,
        auth: { user: env.smtp.user, pass: env.smtp.pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
      })
    : nodemailer.createTransport({ jsonTransport: true });

  return transporter;
};

const sendViaBrevoApi = async ({ to, subject, text }) => {
  const from = env.smtp.from.trim();
  const namedSender = from.match(/^(.+?)\s*<([^<>]+)>$/);
  const sender = namedSender
    ? { name: namedSender[1].trim().replace(/^"|"$/g, ""), email: namedSender[2].trim() }
    : { email: from };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": env.brevoApiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({ sender, to: [{ email: to }], subject, textContent: text }),
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`Brevo email request failed with status ${response.status}`);
  }

  return response.json();
};

const sendApplicationDecision = async ({ application, decision, inviteToken }) => {
  const accepted = decision === "accepted";
  const subject = accepted ? "Welcome to SuperNova" : "Your SuperNova application";
  const activationUrl = accepted
    ? `${env.clientUrl.replace(/\/$/, "")}/activate?token=${encodeURIComponent(inviteToken)}`
    : null;
  const text = accepted
    ? `Your application was accepted. Activate your account within ${env.inviteExpiresHours} hours: ${activationUrl}`
    : "Thank you for applying to SuperNova. Your application was not accepted at this time.";

  if (env.brevoApiKey) {
    return sendViaBrevoApi({ to: application.email, subject, text });
  }

  return getTransporter().sendMail({
    from: env.smtp.from,
    to: application.email,
    subject,
    text,
  });
};

module.exports = { sendApplicationDecision };
