const { env } = require("../config/env");
const RegistrationSettings = require("../models/RegistrationSettings");

const dateValue = (date) => {
  return (date.getMonth() + 1) * 100 + date.getDate();
};

const isRegistrationOpen = (date = new Date()) => {
  const today = dateValue(date);
  const open = env.registration.openMonth * 100 + env.registration.openDay;
  const close = env.registration.closeMonth * 100 + env.registration.closeDay;

  return open <= close
    ? today >= open && today <= close
    : today >= open || today <= close;
};

const dateFromParts = (year, month, day) => {
  return new Date(year, month - 1, day);
};

const nextOpeningDate = (date = new Date(), scheduleIsOpen = isRegistrationOpen(date)) => {
  const year = date.getFullYear();
  const today = dateValue(date);
  const open = env.registration.openMonth * 100 + env.registration.openDay;

  if (scheduleIsOpen) return dateFromParts(year + 1, env.registration.openMonth, env.registration.openDay);
  return dateFromParts(today < open ? year : year + 1, env.registration.openMonth, env.registration.openDay);
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(date);
};

const getRegistrationStatus = async (date = new Date()) => {
  const settings = await RegistrationSettings.findOne({ key: "global" }).lean();
  const scheduleIsOpen = isRegistrationOpen(date);
  const openDate = dateFromParts(date.getFullYear(), env.registration.openMonth, env.registration.openDay);
  const closeDate = dateFromParts(date.getFullYear(), env.registration.closeMonth, env.registration.closeDay);
  const hasManualOverride = typeof settings?.isOpenOverride === "boolean";
  const isOpen = hasManualOverride ? settings.isOpenOverride : scheduleIsOpen;
  const opening = nextOpeningDate(date, scheduleIsOpen && !hasManualOverride);

  return {
    isOpen,
    mode: hasManualOverride ? "manual" : "schedule",
    scheduleIsOpen,
    nextOpeningDate: formatDate(opening),
    windowText: `${formatDate(openDate)} to ${formatDate(closeDate)}`,
    updatedAt: settings?.updatedAt || null,
  };
};

const assertRegistrationOpen = async (ApiError) => {
  const status = await getRegistrationStatus();
  if (!status.isOpen) {
    throw new ApiError(409, "REGISTRATION_CLOSED", "Registrations are currently closed", status);
  }
  return status;
};

const setRegistrationStatus = async (isOpen, userId) => {
  return RegistrationSettings.findOneAndUpdate(
    { key: "global" },
    { $set: { isOpenOverride: isOpen, updatedBy: userId } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();
};

module.exports = { assertRegistrationOpen, getRegistrationStatus, isRegistrationOpen, setRegistrationStatus };
