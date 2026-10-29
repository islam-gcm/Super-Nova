# SuperNova Virtual Club Frontend

React and Vite application containing the canonical registration form, account
activation, login, member workspace, and role-aware administration.

## Run

```powershell
Copy-Item .env.example .env
npm ci
npm run dev
```

The local address is `http://localhost:5173`, which opens the login page. Required variables:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Build

```powershell
npm run check
npm run build
```

The included Vercel rewrite supports React Router deep links. `/` redirects to
`/login`; `/join` remains public for membership applications, and `/activate`
is used by invited applicants. `/workspace/*` is protected and checked against
the current API session. Events, workshops, departments, leaders, and achievements accept
images selected from the administrator's computer. Departments already used by
members, tasks, or applications can be deactivated but cannot be deleted.
