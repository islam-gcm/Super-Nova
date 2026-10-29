# System Design

## Context

SuperNova has two browser experiences backed by one API:

- The official site is public and reads departments, events, leaders, and
  achievements. Its Join links open the Virtual Club registration route.
- The Virtual Club provides public registration/activation and the protected
  member, department-head, HR, and Lead workspace.
- A future React Native client should consume the same `/api/v1` contract with
  bearer authentication.

## Production components

```text
Browser
  |-- supernova.example --------> Vercel official static site
  |-- app.supernova.example ----> Vercel React application
  `-- api.supernova.example ----> Render Express API
                                      |-- MongoDB Atlas
                                      `-- Brevo HTTPS API
```

The frontends never connect directly to MongoDB or Brevo. Secrets exist only in
the backend environment.

## Main request flows

### Public content

1. Vercel serves cached static frontend assets.
2. The browser requests public API resources.
3. Express validates the origin and reads indexed MongoDB collections.
4. Only published events and active departments are returned.

### Authenticated workspace

1. Login sets an HTTP-only JWT cookie on the API origin.
2. React sends `credentials: include` with API requests.
3. CORS accepts only the two configured frontend origins.
4. The API verifies the JWT, loads the current user, and applies RBAC and scope.

### Application decision

1. Lead/HR sends a decision command.
2. MongoDB transaction commits application/account/invite/audit changes.
3. After commit, Brevo sends the decision message.
4. Email failure is reported without undoing the authoritative decision.

## Scalability

The API is stateless and can scale horizontally behind the host load balancer.
MongoDB remains the consistency boundary. Before multiple API instances are
introduced, move rate-limit counters from process memory to a shared store.

Public assets are CDN-served. API payloads are paginated where collections can
grow. Database indexes support authentication, status queues, task visibility,
notifications, leaderboard history, and audit lookup.

## Availability and degradation

- If MongoDB is unavailable, health returns `503` and writes must stop.
- If Brevo is unavailable, core decisions remain committed and delivery failure
  is exposed to the administrator.
- If the API is unavailable, static pages still load but dynamic sections show
  empty/unavailable states.
- If one frontend fails, the other frontend and API remain independently deployable.

## Security boundaries

- TLS terminates at managed hosting platforms.
- Helmet sets baseline browser security headers.
- CORS is an exact allowlist, not `*`.
- Body size is limited to 100 KB.
- Login and public application routes are rate-limited.
- JWT secrets, MongoDB credentials, and Brevo API keys remain server-side.
- Audit logs record actor, target, changes, IP, and user agent.

## Observability baseline

Monitor:

- `/api/health` availability and transaction status
- request rate, latency, 4xx/5xx rate, and rate-limit responses
- MongoDB connections, storage, slow operations, and backup status
- Brevo accepted, delivered, bounced, and rejected messages
- application acceptance failures and task transaction conflicts

Add structured request logging and OpenTelemetry before multi-instance or
high-volume production use.
