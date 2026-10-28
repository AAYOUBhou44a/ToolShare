# ToolShare

ToolShare is a Node.js API project for managing tool stores, equipment,
reservations, loans, and equipment movements. The project uses Express,
MongoDB, and Mongoose.

> **Project status:** this repository is under development. The current API
> exposes a health check and Swagger UI. The Mongoose models are present, but
> the business API routes, authentication, installation workflow, and
> service-layer business rules are not implemented yet.

## Requirements

- Node.js 22 or later and npm (for running the API directly)
- Docker Engine with the Docker Compose plugin (for the containerized setup)

## Run with Docker Compose

Compose starts the API and MongoDB. Create a local `.env` file first; Compose
requires it for the API service:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/toolshare
```

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
MONGODB_URI=mongodb://localhost:27017/toolshare
```

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
| `GET` | `/api-docs` | Opens the Swagger UI. |

Swagger is configured to read route documentation from `src/routes/` and
`src/docs/`. Those route and documentation files have not yet been added, so
the UI does not describe the planned business endpoints.

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

The schemas provide basic field validation and model operations. They do not,
on their own, guarantee rules that require coordinated database operations,
such as preventing overlapping reservations from concurrent requests.

## Tests

Run the configured Jest command with:

```bash
npm test
```

There are currently no test files in the repository. Add tests as the routes
and business logic are implemented.

## Project structure

```text
src/
  app.js              Express application and middleware
  server.js           Environment loading, database connection, and startup
  config/
    database.js       Mongoose connection
    swagger.js        Swagger/OpenAPI setup
  models/             Mongoose data models
```

## Planned capabilities

The project context describes role-based access for administrators, store
managers, and users; store and equipment management; reservations; loans and
returns; and installation of the first administrator. Implementing those
capabilities still requires routes, controllers, services, repositories,
authentication and authorization middleware, error handling, and automated
tests.
