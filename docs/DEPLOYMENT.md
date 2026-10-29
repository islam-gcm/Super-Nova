# Deployment Guide

## Recommended topology

| Component | Suggested platform | Public address |
|---|---|---|
| Official frontend | Vercel static deployment | `https://supernova.example` |
| Virtual Club frontend | Vercel Vite deployment | `https://app.supernova.example` |
| Backend | Render web service | `https://api.supernova.example` |
| Database | MongoDB Atlas | Private Atlas connection string |
| Email | Brevo HTTPS API | Server-side only |

Custom subdomains under one parent domain are strongly recommended. They keep
the browser session first-party while CORS still restricts which origins may use
the API.

## 1. MongoDB Atlas

1. Create an Atlas project and production cluster.
2. Create a database user with access only to the SuperNova database.
3. Allow network access from the backend host. Avoid `0.0.0.0/0` when the host
   offers stable outbound addresses.
4. Copy the `mongodb+srv://` connection string into backend `MONGODB_URI`.
5. Enable backups and test a restore procedure before launch.

Atlas is a replica set and supports the transactions required by account
activation, application acceptance, task claims, leaves, and reviews.

## 2. Backend

Create a Node web service with `backend` as its root directory.

```text
Build command: npm ci
Start command: npm start
Health path: /api/health
Node version: 20 or newer
```

Required environment variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<long random secret, at least 32 characters>
JWT_EXPIRES_IN=1d
CLIENT_URL=https://app.supernova.example
CORS_ORIGINS=https://supernova.example,https://app.supernova.example
AUTH_COOKIE_SAME_SITE=lax
AUTH_COOKIE_SECURE=true
INVITE_EXPIRES_HOURS=72

REGISTRATION_OPEN_MONTH=6
REGISTRATION_OPEN_DAY=11
REGISTRATION_CLOSE_MONTH=10
REGISTRATION_CLOSE_DAY=15

BREVO_API_KEY=<Brevo API key, not an SMTP key>
EMAIL_FROM=SuperNova Club <verified-sender@supernova.example>
```

Do not set `AUTH_COOKIE_DOMAIN` unless a shared-domain cookie is intentionally
needed. A host-only API cookie is narrower and works for credentialed requests.

If default Vercel and Render domains are used instead of a shared parent domain:

```env
AUTH_COOKIE_SAME_SITE=none
AUTH_COOKIE_SECURE=true
```

That setup depends on cross-site cookies and may be affected by browser
third-party-cookie restrictions. Custom domains are the reliable design.

Render supplies `PORT` automatically. Free Render blocks outbound SMTP ports,
so use `BREVO_API_KEY` to send over HTTPS. It also has no dashboard shell or
one-off jobs. To create the first Lead on a free service, temporarily add
`ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` (10+ characters), and set the
start command to `npm run seed:admin && npm start`. Deploy once, confirm the
`Lead account ready` message, then immediately restore the start command to
`npm start` and remove the three `ADMIN_*` variables. Do not leave the seed
command in place because each restart would reset that account's password.
Run `npm run seed:official-content` only if the original achievements are needed.

On a paid host, SMTP remains available when `BREVO_API_KEY` is unset and
`SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` are configured.

## 3. Virtual Club frontend

Create a Vercel project with `virtual-club-frontend` as its root directory.

```text
Install command: npm ci
Build command: npm run build
Output directory: dist
```

Set:

```env
VITE_API_URL=https://api.supernova.example/api/v1
```

The included `vercel.json` sends client-side routes such as `/join`, `/activate`,
and `/workspace/tasks` to `index.html`. The root route opens `/login`;
only `/join` and `/activate` remain public for applications and invitations.

## 4. Official frontend

Create another Vercel project with `official-frontend` as its root directory.

```text
Install command: npm ci
Build command: npm run build
Output directory: dist
```

Set:

```env
VITE_API_BASE_URL=https://api.supernova.example/api/v1
VITE_VIRTUAL_CLUB_URL=https://app.supernova.example
```

The official site's Join us button opens the public application route at
`/join`. Members open the Virtual Club at `/login`.

## 5. Brevo

1. Verify the sender address or sending domain in Brevo.
2. Open Brevo's API-key settings and create an API key.
3. Set `BREVO_API_KEY` only on the backend; do not place it in either Vercel
   frontend. An SMTP key will not work for this HTTPS request.
5. Send an acceptance and rejection through a controlled application before launch.

## 6. Release order

1. Back up the database.
2. Deploy backend and confirm `/api/health` reports database connected and
   transactions available.
3. Deploy the Virtual Club and verify login plus `/join`.
4. Deploy the official frontend and verify dynamic content.
5. Run the smoke workflow in the root README.
6. Watch backend logs and Brevo delivery during the first live applications.

## 7. Rollback

- Keep the previous successful frontend deployments available in Vercel.
- Roll back backend code only when it remains compatible with the current schema.
- Restore data only from a verified backup and record the incident.
- Rotate `JWT_SECRET` only when intentionally invalidating every session.
- Rotate MongoDB and Brevo credentials immediately if either is exposed.
