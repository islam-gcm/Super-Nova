# SuperNova API Guide

The machine-readable contract is [openapi.yaml](openapi.yaml). This guide
explains conventions, authorization, common workflows, and every endpoint.

## Base addresses

```text
Development: http://localhost:5000/api/v1
Production:  https://api.supernova.example/api/v1
Health:      /api/health (outside the versioned base path)
```

All request and response bodies use JSON. Dates are ISO 8601 strings. Resource
identifiers are 24-character MongoDB ObjectId strings.

## Response envelopes

Success:

```json
{
  "success": true,
  "data": {
    "resource": {}
  }
}
```

Paginated success:

```json
{
  "success": true,
  "data": {
    "items": []
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "pages": 0
  }
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

## Authentication

Browser login sets an `accessToken` cookie with `HttpOnly`, `Secure` in
production, and a one-day lifetime. Browser requests must include credentials:

```js
fetch(`${API_URL}/dashboard`, {
  credentials: "include"
});
```

Native clients may send the same JWT as:

```http
Authorization: Bearer <access-token>
```

The current login response intentionally does not expose the JWT to browser
JavaScript. A future mobile release should add a dedicated device-session and
refresh-token flow rather than extracting browser cookies.

## Role notation

| Code | Role |
|---|---|
| Public | No login required |
| M | Member |
| DH | Department head |
| HR | Human resources administrator |
| L | Lead administrator |

## Endpoint inventory

### Health and authentication

| Method | Path | Access | Result |
|---|---|---|---|
| GET | `/api/health` | Public | Database and transaction readiness |
| POST | `/auth/login` | Public | Set auth cookie and return user |
| POST | `/auth/activate` | Public | Consume invite, set password, set cookie |
| POST | `/auth/logout` | Public | Clear auth cookie |
| GET | `/auth/me` | M/DH/HR/L | Current active user |

### Registration and applications

| Method | Path | Access | Result |
|---|---|---|---|
| GET | `/registration/status` | Public | Open/closed mode, window, next opening |
| PATCH | `/registration/status` | HR/L | Set manual open/closed override |
| POST | `/applications` | Public | Create pending membership application |
| GET | `/applications` | HR/L | Paginated applications, optional status |
| PATCH | `/applications/{id}/decision` | HR/L | Accept with department or reject |

### Departments

| Method | Path | Access | Result |
|---|---|---|---|
| GET | `/departments` | Public | Active departments |
| GET | `/departments/admin` | HR/L | All active and inactive departments |
| POST | `/departments` | HR/L | Create department |
| PATCH | `/departments/{id}` | HR/L | Edit or activate/deactivate department |
| PUT | `/departments/{id}/heads` | HR/L | Replace department head list |

### Tasks and assignments

| Method | Path | Access | Result |
|---|---|---|---|
| GET | `/tasks` | M/DH/HR/L | Visible tasks with filters and pagination |
| POST | `/tasks` | DH/HR/L | Create scoped task |
| GET | `/tasks/{id}` | M/DH/HR/L | Visible task and current user's assignment |
| POST | `/tasks/{id}/claims` | M/HR/L | Atomically claim capacity |
| DELETE | `/tasks/{id}/claims/me` | M/HR/L | Leave own unsubmitted claim |
| POST | `/tasks/{id}/submissions` | M/HR/L | Submit own claimed task |
| GET | `/task-assignments` | DH/HR/L | Scoped review queue |
| PATCH | `/task-assignments/{id}/review` | DH/HR/L | Approve or reject submission |

Department heads may review only assignments belonging to their departments.

### Notifications, dashboard, and leaderboard

| Method | Path | Access | Result |
|---|---|---|---|
| GET | `/notifications` | M/DH/HR/L | Own paginated notifications and unread count |
| PATCH | `/notifications/{id}/read` | M/DH/HR/L | Mark own notification read |
| GET | `/dashboard` | M/DH/HR/L | User, available tasks, active assignments, unread count |
| GET | `/leaderboard` | M/DH/HR/L | Top 100 ranked by approved work |

### Events and official content

| Method | Path | Access | Result |
|---|---|---|---|
| GET | `/events` | Public | Published events/workshops/announcements |
| GET | `/events/admin` | HR/L | All event statuses |
| POST | `/events` | HR/L | Create event |
| PATCH | `/events/{id}` | HR/L | Update/publish/archive event |
| GET | `/content/{kind}` | Public | Ordered `leader` or `achievement` items |
| GET | `/content/{kind}/admin` | HR/L | Administrative content list |
| POST | `/content/{kind}` | HR/L | Add leader or achievement |
| PATCH | `/content/{kind}/{id}` | HR/L | Update content item |
| DELETE | `/content/{kind}/{id}` | HR/L | Delete content item |

### Members and audit

| Method | Path | Access | Result |
|---|---|---|---|
| GET | `/users` | HR/L | Paginated users |
| PATCH | `/users/{id}` | HR/L | Roles, departments, or suspension |
| GET | `/audit-logs` | HR/L | Paginated sensitive action history |

## Pagination and filtering

Paginated endpoints accept `page` from 1 and `limit` from 1 to 100. Default is
page 1 with 20 items.

Additional filters:

```text
GET /applications?status=pending
GET /tasks?status=open&type=department&departmentId=<id>
GET /task-assignments?status=submitted&taskId=<id>
```

## Example: submit an application

```http
POST /api/v1/applications
Content-Type: application/json

{
  "fullName": "Student Name",
  "email": "student@example.com",
  "phone": "+213555000000",
  "fieldOfStudy": "Computer Science",
  "university": "University of Boumerdes",
  "preferredDepartment": "66c01234567890abcdef1234",
  "skills": ["JavaScript", "Design"],
  "interests": ["Robotics", "Astronomy"],
  "motivation": "I want to learn, contribute, and build scientific projects with the club."
}
```

## Example: accept an application

```http
PATCH /api/v1/applications/66c01234567890abcdef1234/decision
Content-Type: application/json
Cookie: accessToken=<http-only-cookie>

{
  "decision": "accepted",
  "departmentId": "66c09876543210abcdef1234",
  "note": "Strong motivation and relevant interests."
}
```

## Example: create and claim a task

```http
POST /api/v1/tasks
Content-Type: application/json
Cookie: accessToken=<http-only-cookie>

{
  "title": "Prepare telescope session",
  "description": "Prepare and document all equipment for the observation night.",
  "type": "department",
  "departmentId": "66c09876543210abcdef1234",
  "deadline": "2026-09-15T17:00:00.000Z",
  "maxAssignees": 3,
  "points": 25,
  "notes": "Coordinate with the department head."
}
```

```http
POST /api/v1/tasks/66c0abcdef12345678901234/claims
Cookie: accessToken=<http-only-cookie>
```

## Validation highlights

- Activation passwords: 10-128 characters with lowercase, uppercase, and digit.
- Application motivation: 20-3000 characters.
- Task deadlines must be in the future.
- Global tasks cannot include `departmentId`.
- Department tasks require `departmentId`.
- Accepted applications require `departmentId`.
- Image values must be HTTP(S) URLs or PNG/JPEG/WebP data URLs.
- External links must use HTTP(S).
- JSON and form bodies are limited to 100 KB.

## Rate limits

| Route | Production limit |
|---|---|
| `POST /applications` | 5 requests per IP per hour |
| `POST /auth/login` | 10 requests per IP/email pair per 15 minutes |

Rate-limited responses use HTTP `429` and code `RATE_LIMIT_EXCEEDED`.

## Common errors

| HTTP | Code | Meaning |
|---|---|---|
| 400 | `INVALID_INVITE`, `INVALID_ID` | Invalid request token or identifier |
| 401 | `AUTHENTICATION_REQUIRED`, `INVALID_ACCESS_TOKEN` | Login/session required |
| 403 | `FORBIDDEN`, `ORIGIN_NOT_ALLOWED`, `TASK_SCOPE_FORBIDDEN` | Access denied |
| 404 | `*_NOT_FOUND`, `ROUTE_NOT_FOUND` | Resource or route missing |
| 409 | `DUPLICATE_RESOURCE`, `APPLICATION_PENDING`, `MEMBER_ALREADY_EXISTS` | State conflict |
| 409 | `LAST_LEAD_REQUIRED`, `INVITE_ACTIVATION_REQUIRED` | Protected account invariant |
| 409 | `TASK_FULL`, `ASSIGNMENT_ALREADY_REVIEWED` | Workflow conflict |
| 422 | `VALIDATION_ERROR`, `DATABASE_VALIDATION_ERROR` | Invalid fields or domain input |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_SERVER_ERROR` | Unexpected server failure |
| 503 | health response | Database unavailable |

The API may return additional workflow-specific codes. Clients should branch on
`error.code`, display `error.message`, and treat unknown codes as recoverable
server failures.
