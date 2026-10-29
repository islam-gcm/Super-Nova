export function formatDate(value, options = {}) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(value));
}

export function formatDateTime(value) {
  return formatDate(value, { hour: "2-digit", minute: "2-digit" });
}

export function timeUntil(value) {
  const hours = Math.ceil((new Date(value).getTime() - Date.now()) / 3600000);
  if (hours <= 0) return "Deadline passed";
  if (hours < 24) return `${hours}h remaining`;
  const days = Math.ceil(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} remaining`;
}

export function titleCase(value = "") {
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export function errorMessage(error) {
  const fields = error?.details?.fieldErrors;
  const firstFieldError = fields && Object.values(fields).flat().find(Boolean);
  return firstFieldError || error?.message || "Something went wrong. Please try again.";
}

export function toLocalInput(value) {
  if (!value) return "";
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}
