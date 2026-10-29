const { getRegistrationStatus, setRegistrationStatus } = require("../services/registrationService");
const { sendData } = require("../utils/response");
const { writeAudit } = require("../services/auditService");

const status = async (_req, res) => {
  return sendData(res, { registration: await getRegistrationStatus() });
};

const updateStatus = async (req, res) => {
  const { isOpen } = req.validated.body;
  const previous = await getRegistrationStatus();
  const settings = await setRegistrationStatus(isOpen, req.user._id);

  await writeAudit(req, `registration.${isOpen ? "opened" : "closed"}`, "RegistrationSettings", settings._id, {
    previousIsOpen: previous.isOpen,
    isOpen,
    mode: "manual",
  });

  return sendData(res, { registration: await getRegistrationStatus() });
};

module.exports = { status, updateStatus };
