# SuperNova Backend

Express and MongoDB API for the SuperNova platform.

## Run

```powershell
npm ci
npm run dev
```

MongoDB must be a replica set. Verify startup at
`http://localhost:5000/api/health`.

## Operational commands

```powershell
npm run seed:admin
npm run seed:official-content
npm start
```

Use `seed:admin` for the first Lead and remove its three `ADMIN_*` environment
values afterward. `seed:official-content` idempotently inserts the three original
achievement records when they are missing.

See `../docs/API.md`, `../docs/openapi.yaml`, and `../docs/DEPLOYMENT.md` for the
complete contract and production configuration.

## Structure

```text
backend/
|-- scripts/              Operational database scripts
|-- src/
|   |-- config/           Environment and database configuration
|   |-- controllers/      HTTP request and response handlers
|   |-- middleware/       Authentication, authorization, validation, and errors
|   |-- models/           Mongoose schemas and models
|   |-- routes/           One route module per API area
|   |-- services/         Reusable business workflows and transactions
|   |-- utils/            Shared response, token, and pagination helpers
|   |-- validation/       Request schemas
|   |-- app.js            Express application configuration
|   `-- server.js         Database connection and server lifecycle
|-- .env                  Local environment values, excluded from Git
`-- package.json
```

The usual request flow is route -> middleware -> controller -> service -> model.
Simple reads may go directly from a controller to a model.
