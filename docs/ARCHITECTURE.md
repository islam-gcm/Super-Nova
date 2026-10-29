# Backend Architecture

## Architectural style

SuperNova uses a modular monolith: one stateless Express process with clear
route, controller, service, and Mongoose model boundaries. This is appropriate
for a university club because deployment and operations stay simple while the
domain remains separated enough to extract services later if real load demands it.

## Request path

```text
HTTP request
  -> Helmet and CORS
  -> JSON/body limits and cookie parsing
  -> rate limit where applicable
  -> authentication and role authorization
  -> Zod validation
  -> controller
  -> domain service / transaction
  -> Mongoose model
  -> MongoDB
  -> standard response envelope
```

## Module boundaries

| Module | Responsibility |
|---|---|
| Authentication | Login, logout, invite activation, JWT cookie |
| Registration | Scheduled/manual registration availability |
| Applications | Submission, review, account invitation, decision email |
| Departments | Department metadata, active state, heads, role synchronization |
| Tasks | Visibility, publication, capacity, claims, leaves, submissions |
| Assignments | Review queue, scoped approval/rejection, points |
| Members | Roles, departments, suspension, final-Lead protection |
| Notifications | Recipient-owned activity feed |
| Events | Draft/published/archive public programming |
| Site content | Public leaders and achievements |
| Audit | Sensitive action history |
| Dashboard/leaderboard | Aggregated member views and approved-work ranking |

## Data consistency

MongoDB transactions protect workflows that update several documents:

- accepted application -> application, user, invite, audit records
- account activation -> user, invite, audit records
- task claim/leave -> task capacity and assignment
- assignment review -> assignment, task, user counters, notifications, audit
- department heads -> department and user roles/departments

The backend refuses to start in production without transaction-capable MongoDB.

## Authentication and authorization

- Passwords are hashed with bcrypt.
- Browser JWTs use HTTP-only cookies and are never returned in response bodies.
- Bearer JWTs are accepted for future native clients.
- Every protected request reloads the active user from MongoDB.
- Route-level RBAC handles Lead, HR, department head, and member access.
- Service-level checks enforce department scope and business invariants.
- CORS uses an exact origin allowlist with credentials enabled.

## API conventions

- Base path: `/api/v1`
- Health path: `/api/health`
- JSON success envelope: `{ "success": true, "data": ... }`
- JSON error envelope: `{ "success": false, "error": { "code", "message" } }`
- Paginated endpoints add `{ "meta": { "page", "limit", "total", "pages" } }`
- Input is validated before controllers execute.
- Sensitive changes write an `AuditLog` record.

## External integrations

MongoDB Atlas is the system of record. Brevo HTTPS API (or SMTP on a paid host) is an outbound adapter for
application decisions and invitation links. The frontend clients communicate
only through the versioned HTTPS API.

## Operational risks and next steps

| Risk | Current control | Upgrade trigger |
|---|---|---|
| Email provider outage | Decision persists and reports delivery failure | Add durable email outbox and retries |
| Multiple API instances | Stateless JWT API and shared MongoDB | Add shared rate-limit store |
| Large notification volume | Indexed recipient queries | Add retention/archive policy |
| Large audit history | Indexed chronological queries | Add archival and export |
| Image data URLs | Request limit and validation | Move images to object storage |
| Mobile expansion | Bearer token accepted | Add refresh-token rotation/device sessions |

Avoid microservices, queues, Redis, or event sourcing until measured traffic or
operational requirements justify them.
