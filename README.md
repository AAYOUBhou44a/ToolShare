# ToolShare

ToolShare is a Node.js and Express API for tool stores, equipment,
reservations, loans, and equipment movements. It uses MongoDB and Mongoose.

> **Project status:** authentication, store management, reservations, and
> manager loan/return endpoints are in development. Account provisioning,
> installation, and equipment management still need completion.

## Requirements

- Node.js 22 or later and npm (for running the API directly)
- Docker Engine with the Docker Compose plugin (for the containerized setup)

## Run with Docker Compose

Compose starts the API and MongoDB. MongoDB runs as a single-node replica set
to support transactions used to prevent concurrent overlapping reservations.
Create a local `.env` file first; Compose requires it for the API service:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/toolshare
JWT_SECRET=replace-with-at-least-32-random-characters
JWT_EXPIRES_IN=1h
```

Generate `JWT_SECRET` locally (for example with `openssl rand -base64 32`).
Do not commit the `.env` file. The API requires a secret with at least 32
characters.

Then start the services:

```bash
docker compose up --build
```

The API is available at <http://localhost:3000>. MongoDB data is stored in the
named `toolshare_data` volume and is retained when the containers are stopped
with `docker compose down`.

To remove the database volume as well, run `docker compose down --volumes`.
This permanently deletes the MongoDB data.

## Run locally

Start MongoDB separately, then install dependencies and configure the
connection:

```bash
npm ci
```

Create `.env` in the project root:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/toolshare?replicaSet=rs0
JWT_SECRET=replace-with-at-least-32-random-characters
JWT_EXPIRES_IN=1h
```

When running outside Compose, MongoDB must be configured as a replica set;
standalone MongoDB servers do not support reservation transactions.

Start the server:

```bash
node src/server.js
```

The server connects to MongoDB before listening for requests. It exits if the
database connection fails.

## Current endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET` | `/api/health` | Confirms that the API process is responding. |
| `POST` | `/api/auth/login` | Sign in with an account created by an administrator or manager. |
| `GET` | `/api/auth/me` | Get the authenticated user's profile. |
| `PATCH` | `/api/auth/me` | Update the authenticated user's name or email. |
| `PATCH` | `/api/auth/change-password` | Change the authenticated user's password. |
| `GET` | `/api/magasins` | List stores visible to the authenticated user. |
| `GET` | `/api/magasins/:id` | Get a store visible to the authenticated user. |
| `POST` | `/api/magasins` | Create a store (Admin only). |
| `PATCH` | `/api/magasins/:id` | Update a store (Admin only). |
| `PATCH` | `/api/magasins/:id/desactiver` | Deactivate a store (Admin only). |
| `GET` | `/api/reservations/disponibilite` | Check equipment availability for a selected store and time slot. |
| `POST` | `/api/reservations` | Create a reservation (User role only). |
| `GET` | `/api/reservations` | List reservations visible to the authenticated role. |
| `GET` | `/api/reservations/:id` | Get a reservation within the authenticated user's scope. |
| `PATCH` | `/api/reservations/:id/annuler` | Cancel the user's own confirmed reservation before it starts. |
| `GET` | `/api-docs` | Opens the Swagger UI. |

Protected routes require an `Authorization: Bearer <token>` header. Swagger is
available at `/api-docs`.

### Reservation rules

Reservation creation requires `magasin`, `materiel`, `dateDebut` (ISO 8601),
and a strictly positive `dureeHeures`. The selected store must be active and
the equipment must belong to it, be active, and be available. The API computes
`dateFin` and rejects overlaps with `CONFIRMEE` or `EN_COURS` reservations.
Intervals are half-open: a reservation can start exactly when another ends.
Creation is transactional and uses a per-equipment write guard so simultaneous
requests cannot both claim an overlapping slot.

Admins can list all reservations, managers can list reservations belonging to
their assigned store, and users can see only their own. Listing accepts
`materiel`, `statut`, `du`, and `au` filters. Users can cancel only their own
confirmed reservations before the start time; cancellation preserves the
record and releases its time slot.

## Data models

Mongoose models are in `src/models/` and are exported from
`src/models/index.js`.

| Model | Purpose |
| ----- | ------- |
| `Utilisateur` | User account, role, active state, optional store assignment, and password hashing. |
| `Magasin` | Tool store and active state. |
| `Materiel` | Physical equipment, unique reference, store, availability, and active state. |
| `Reservation` | User, equipment, dates, duration, and reservation status. |
| `Emprunt` | Loan associated with a reservation, including actual checkout and return details. |
| `Mouvement` | Equipment movement history, optionally associated with a user. |
| `Installation` | Persistent installation state and reference to the initial administrator. |

Example:

```js
const { Utilisateur, Reservation } = require('./src/models');
```

The reservation service enforces availability, role scope, and transactional
overlap prevention in addition to schema-level validation.

## Tests

Run the Jest suite with:

```bash
npm test
```

The tests cover authentication, store access, reservation validation,
availability, transaction guards, role scoping, and cancellation.

## Project structure

```text
src/
  app.js              Express application and route mounting
  server.js           Environment loading and server startup
  config/
    database.js       Mongoose connection
    jwt.js            JWT configuration
    swagger.js        Swagger/OpenAPI setup
  controllers/        HTTP request handlers
  docs/               OpenAPI route documentation
  middlewares/        Authentication, request validation, and error handling
  models/             Mongoose data models
  repositories/       Database access
  routes/             Express route definitions
  services/           Application business logic
```
