# SuperNova Platform

Clean deployment package for the SuperNova Scientific Club. It contains one
Express API and two web clients. No credentials, dependencies, build output,
demo data, archives, or legacy applications are included.

## Project structure

```text
SupeNnova/
|-- backend/                  Express, MongoDB, authentication, workflows
|-- official-frontend/        React public landing site
|-- virtual-club-frontend/    React registration and member/admin workspace
|-- docs/                     API, architecture, database, and operations
|-- .gitignore
|-- package.json
`-- README.md
```

## Documentation

- [Complete workflow](docs/WORKFLOW.md)
- [Deployment guide](docs/DEPLOYMENT.md)
- [API guide](docs/API.md)
- [OpenAPI 3.1 contract](docs/openapi.yaml)
- [Backend architecture](docs/ARCHITECTURE.md)
- [System design](docs/SYSTEM_DESIGN.md)
- [Database presentation](docs/DATABASE.md)
- [Backend architecture diagram](docs/backend-architecture.drawio)
- [System design diagram](docs/system-design.drawio)
- [Database diagram](docs/database-schema.drawio)

## Local requirements

- Node.js 20 or newer
- MongoDB replica set, or a MongoDB Atlas cluster
- Three local ports: API `5000`, Virtual Club `5173`, official site `5500`

## First local setup

1. Create local environment files from every `.env.example`.
2. Put a 32-character or longer random value in `backend/.env` as `JWT_SECRET`.
3. Start MongoDB as a replica set. Task claiming and account workflows use
   transactions and will not work correctly on standalone MongoDB.
4. Install dependencies:

```powershell
npm run install:all
```

5. Create the first Lead and synchronize the original official achievements:

```powershell
npm run seed:admin --prefix backend
npm run seed:official-content --prefix backend
```

6. Run the services in three terminals:

```powershell
npm run dev --prefix backend
npm run dev --prefix virtual-club-frontend
npm run dev --prefix official-frontend
```

Open:

- Official site: `http://localhost:5500`
- Registration: `http://localhost:5173/join`
- Virtual Club entry: `http://localhost:5173/login` (the root URL redirects here)
- API health: `http://localhost:5000/api/health`

## Production shape

Use a shared parent domain when possible:

```text
https://supernova.example       official-frontend
https://app.supernova.example   virtual-club-frontend
https://api.supernova.example   backend
```

Deploy the database first, then the backend, Virtual Club, and official site.
The exact variables and platform settings are in [DEPLOYMENT.md](docs/DEPLOYMENT.md).
Never commit a real `.env`, MongoDB URI, JWT secret, Brevo API key, or account password.

## Release checks

```powershell
npm run check
npm run build
```

Then verify `/api/health`, submit one controlled application, accept it, activate
the invited account, claim and leave a task, and confirm that the official site
loads published events, leaders, departments, and achievements from the API.
