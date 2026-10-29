const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    ...options,
    body: options.body && typeof options.body !== "string" ? JSON.stringify(options.body) : options.body,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = payload?.error;
    throw new ApiError(
      error?.message || "The SuperNova service could not complete this request.",
      response.status,
      error?.code || "REQUEST_FAILED",
      error?.details
    );
  }

  return payload;
}

export function queryString(values) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const endpoints = {
  public: {
    departments: () => api("/departments"),
    events: () => api("/events"),
    apply: (body) => api("/applications", { method: "POST", body }),
  },
  auth: {
    me: () => api("/auth/me"),
    login: (body) => api("/auth/login", { method: "POST", body }),
    activate: (body) => api("/auth/activate", { method: "POST", body }),
    logout: () => api("/auth/logout", { method: "POST" }),
  },
  registration: {
    status: () => api("/registration/status"),
    updateStatus: (isOpen) => api("/registration/status", { method: "PATCH", body: { isOpen } }),
  },
  dashboard: () => api("/dashboard"),
  tasks: {
    list: (filters = {}) => api(`/tasks${queryString(filters)}`),
    one: (id) => api(`/tasks/${id}`),
    create: (body) => api("/tasks", { method: "POST", body }),
    claim: (id) => api(`/tasks/${id}/claims`, { method: "POST" }),
    leave: (id) => api(`/tasks/${id}/claims/me`, { method: "DELETE" }),
    submit: (id, body) => api(`/tasks/${id}/submissions`, { method: "POST", body }),
  },
  assignments: {
    list: (filters = {}) => api(`/task-assignments${queryString(filters)}`),
    review: (id, body) => api(`/task-assignments/${id}/review`, { method: "PATCH", body }),
  },
  notifications: {
    list: (filters = {}) => api(`/notifications${queryString(filters)}`),
    read: (id) => api(`/notifications/${id}/read`, { method: "PATCH" }),
  },
  leaderboard: () => api("/leaderboard"),
  applications: {
    list: (filters = {}) => api(`/applications${queryString(filters)}`),
    decide: (id, body) => api(`/applications/${id}/decision`, { method: "PATCH", body }),
  },
  events: {
    list: () => api("/events/admin"),
    create: (body) => api("/events", { method: "POST", body }),
    update: (id, body) => api(`/events/${id}`, { method: "PATCH", body }),
    remove: (id) => api(`/events/${id}`, { method: "DELETE" }),
  },
  departments: {
    list: () => api("/departments"),
    adminList: () => api("/departments/admin"),
    create: (body) => api("/departments", { method: "POST", body }),
    update: (id, body) => api(`/departments/${id}`, { method: "PATCH", body }),
    remove: (id) => api(`/departments/${id}`, { method: "DELETE" }),
    heads: (id, userIds) => api(`/departments/${id}/heads`, { method: "PUT", body: { userIds } }),
  },
  content: {
    adminList: (kind) => api(`/content/${kind}/admin`),
    create: (kind, body) => api(`/content/${kind}`, { method: "POST", body }),
    update: (kind, id, body) => api(`/content/${kind}/${id}`, { method: "PATCH", body }),
    remove: (kind, id) => api(`/content/${kind}/${id}`, { method: "DELETE" }),
  },
  users: {
    list: (filters = {}) => api(`/users${queryString(filters)}`),
    update: (id, body) => api(`/users/${id}`, { method: "PATCH", body }),
  },
  audit: (filters = {}) => api(`/audit-logs${queryString(filters)}`),
};
