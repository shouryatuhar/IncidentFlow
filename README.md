# IncidentFlow

> **A modern full-stack DevOps incident management platform for engineering teams.**

IncidentFlow allows software engineering teams to declare, track, triage, investigate, and resolve production incidents with real-time timelines, status workflows, role-based access control, automated external monitoring webhooks, and reliability analytics.

Inspired by internal engineering operations tools like Linear and PagerDuty, IncidentFlow prioritizes a clean, high-density, dark-mode user interface, type safety across the stack, and persistent PostgreSQL audit records.

---

## Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React + TypeScript                   │
│         Vite, Tailwind CSS, TanStack Query v5          │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                        REST API                        │
│                 JSON over HTTP / CORS                  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Express + TypeScript                  │
│       Modular Architecture, Zod Validation, JWT        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                       Prisma ORM                       │
│              Type-safe Models & Migrations             │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                       PostgreSQL                       │
│        Foreign Keys, Relational Constraints, Indexes   │
└────────────────────────────────────────────────────────┘
```

### Architecture Rationale

- **React + TypeScript + Vite + Tailwind CSS**: Provides rapid hot-reloading in development and a fast, lightweight production bundle. Tailwind CSS gives full control over a dark-mode engineering design system without the bloat of generic component libraries.
- **TanStack Query (React Query v5)**: Eliminates state synchronization bugs, manages asynchronous server state, provides automatic caching, and simplifies optimistic updates and cache invalidation.
- **Express + TypeScript + Zod**: Provides a battle-tested, modular REST architecture where validation happens at the boundary before controllers execute business logic.
- **Prisma ORM + PostgreSQL**: Guarantees ACID compliance for incident timeline logs and status transitions. Prisma generates end-to-end TypeScript types directly from the database schema, preventing runtime schema mismatches.

*Note: IncidentFlow is built for internal engineering workflows and operational demonstration. While robust and strictly typed, it is not claimed to be a multi-tenant, enterprise production-ready platform without adding distributed rate limiters, SSO/SAML, and cold backup replication.*

---

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite 6
- **Routing**: React Router DOM v6
- **Server State**: TanStack React Query v5
- **Styling**: Tailwind CSS (Dark theme)
- **Visualizations**: Recharts
- **Icons**: Lucide React
- **Testing**: Vitest, React Testing Library, JSDOM

### Backend
- **Runtime**: Node.js (v20+)
- **Server**: Express.js with TypeScript
- **Database ORM**: Prisma ORM v5
- **Database**: PostgreSQL 15+
- **Validation**: Zod
- **Authentication**: JSON Web Tokens (JWT), bcryptjs
- **Testing**: Vitest, Supertest

### Infrastructure & DevOps
- **Containers**: Docker & Docker Compose
- **Web Server**: Nginx (frontend reverse proxy in container)

---

## Project Structure

```
IncidentFlow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # Prisma database schema & relations
│   │   └── seed.ts               # Realistic production seed dataset
│   ├── src/
│   │   ├── config/               # Environment variables and Prisma client
│   │   ├── middleware/           # JWT authentication, RBAC, Zod validation, error handler
│   │   ├── modules/
│   │   │   ├── auth/             # Login, register, me endpoints & services
│   │   │   ├── users/            # Team directory endpoints
│   │   │   ├── services/         # Microservice catalog CRUD & health states
│   │   │   ├── incidents/        # Incident lifecycle, triage, filtering
│   │   │   ├── comments/         # Threaded investigation notes
│   │   │   ├── timeline/         # Persistent chronological audit events
│   │   │   ├── analytics/        # MTTR, severity, and volume aggregations
│   │   │   └── webhooks/         # Automated external monitoring ingress
│   │   ├── utils/                # Custom HTTP AppErrors
│   │   ├── app.ts                # Express application setup
│   │   └── server.ts             # Server startup & graceful shutdown
│   ├── tests/                    # Vitest integration test suites
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/                  # Centralized typed API clients
│   │   ├── components/
│   │   │   ├── common/           # Badges, Buttons, Modals, StatCards, Toast
│   │   │   ├── layout/           # AppLayout, Sidebar, ProtectedRoute
│   │   │   ├── incidents/        # Table, FilterBar, Timeline, Comments, CreateModal
│   │   │   └── services/         # ServiceCards, ServiceModal
│   │   ├── context/              # AuthContext, ToastContext
│   │   ├── pages/                # Dashboard, Incidents, Detail, Services, Analytics, Settings, Auth
│   │   ├── tests/                # Vitest + RTL frontend test suites
│   │   ├── types/                # Shared TypeScript models
│   │   ├── App.tsx               # Client routes
│   │   └── main.tsx              # React DOM mounting
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docker-compose.yml            # Multi-container orchestration (Postgres, Backend, Frontend)
├── .env.example                  # Environment variable reference
├── .gitignore
├── package.json                  # Monorepo management scripts
└── README.md
```

---

## Core Product Features

### 1. Incident Lifecycle Management
- **Severities**: `SEV_1` (Critical), `SEV_2` (Major), `SEV_3` (Minor), `SEV_4` (Low).
- **Statuses**: `INVESTIGATING` → `IDENTIFIED` → `MONITORING` → `RESOLVED`.
- **Assignment**: Route incidents to specific engineers or leave unassigned for triage.
- **Auto-Calculated Resolution Time**: Tracks incident duration (`resolvedAt - startedAt`).

### 2. Persistent Database Audit Timeline
- Unlike UI-only implementations, all timeline events are stored in PostgreSQL table `timeline_events`.
- Automatically logs transitions:
  - Incident declaration (`CREATED` / `WEBHOOK_CREATED`)
  - Engineer assignments (`ASSIGNED` / `UNASSIGNED`)
  - Severity level updates (`SEV_3` → `SEV_2`)
  - Status updates (`INVESTIGATING` → `IDENTIFIED` → `RESOLVED`)
  - Comments posted by operators (`COMMENT_ADDED`)

### 3. Role-Based Access Control (RBAC)
- **ADMIN**:
  - Full CRUD on Microservices catalog (Create, Edit, Delete).
  - Declare, edit, assign, and delete incidents.
  - View dashboard and reliability analytics.
- **ENGINEER**:
  - View all services in catalog.
  - Declare, edit, assign, and resolve incidents.
  - Post investigation comments.
  - View dashboard and reliability analytics.
  - *Blocked by backend middleware from mutating/deleting services or deleting incidents.*

### 4. Operations Dashboard & Reliability Analytics
- **Top KPIs**: Active Incidents, Critical Outages, Affected Services, Mean Time to Resolve (MTTR).
- **Visual Charts**:
  - Daily incident frequency area chart.
  - Severity distribution bar chart.
  - Status breakdown chart.
  - Top affected services bar chart.
- **Recent Alerts**: Live feed of active production incidents.

### 5. Inbound Monitoring Webhook Ingress
External monitoring systems (Datadog, Prometheus Alertmanager, Grafana, CloudWatch) can declare incidents automatically via `POST /api/webhooks/incidents`.
- Authenticated via configurable `x-webhook-secret` header.
- Validates payload with Zod.
- Resolves affected service by name or ID.
- Automatically creates incident and logs initial timeline event.

---

## Development & Demo Seed Dataset

IncidentFlow includes an optional, realistic development seed script (`npm run db:seed`) to facilitate immediate local testing and evaluation.

> [!IMPORTANT]
> - **Zero Hardcoded Data**: The frontend application contains **no fake or hardcoded incidents, services, comments, timeline events, or metrics**. Every table row, chart data point, and badge is queried from PostgreSQL via REST APIs.
> - **Demonstration Purpose**: All initial incidents (e.g. Stripe webhook timeouts, database connection pool exhaustion) and accounts (`admin@incidentflow.dev`, `engineer@incidentflow.dev`) are demo records.
> - **Clean Production Start**: In production (`NODE_ENV=production`), the application boots with a clean schema and **never automatically executes the seed script**. If a clean, empty database is desired for local use, run `npx prisma db push` without running `npm run db:seed`. The UI will display empty states with call-to-action buttons.
> - **Re-seeding**: To reset the demo state at any time, execute `npm run db:seed` from the root directory.

### Seed Accounts (Local Development)

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **ADMIN** | `admin@incidentflow.dev` | `Password123!` | Full admin management + Services CRUD |
| **ENGINEER** | `engineer@incidentflow.dev` | `Password123!` | Incident investigation, triage & comments |
| **SRE** | `sre@incidentflow.dev` | `Password123!` | Engineer triage & comments |
| **DEVOPS** | `devops@incidentflow.dev` | `Password123!` | Engineer triage & comments |

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend Express server port | `4000` |
| `NODE_ENV` | Application environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/incidentflow?schema=public` |
| `JWT_SECRET` | Secret key for signing session tokens | `development-jwt-secret-incidentflow-2026` |
| `JWT_EXPIRES_IN` | Token validity period | `7d` |
| `WEBHOOK_SECRET` | Secret token for `/api/webhooks/incidents` | `incidentflow-whsec-supersecretkey123` |
| `VITE_API_URL` | Frontend API URL base | `http://localhost:4000/api` |

---

## Getting Started (Local Development)

### Prerequisites
- Node.js v20+ and npm
- PostgreSQL 15+ running locally (or via Docker)

### 1. Install Dependencies
```bash
# In backend
cd backend && npm install

# In frontend
cd ../frontend && npm install
```

### 2. Database Migrations & Seeding
Ensure PostgreSQL is running and `DATABASE_URL` is configured in `.env`.

```bash
# In backend directory
cd backend

# Push schema to database
npx prisma db push

# Seed realistic services, incidents, timeline events, and users
npm run db:seed
```

### 3. Start Development Servers
You can run both concurrently from the project root:

```bash
# Start backend API (runs on port 4000)
npm run dev:backend

# In another terminal, start frontend (runs on port 3000)
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Docker Setup

To run the entire multi-tier stack (PostgreSQL, Express Backend, Nginx + React Frontend) using Docker:

```bash
# Build and launch all containers
docker compose up --build

# Run migrations and seed data inside backend container
docker compose exec backend npx prisma db push
docker compose exec backend npm run db:seed

# Stop all containers
docker compose down
```

Services exposed:
- **Frontend Web UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000/api](http://localhost:4000/api)
- **PostgreSQL**: `localhost:5432`

---

## Automated Webhook Integration Example

External monitoring services can declare incidents automatically using `curl`:

```bash
curl -X POST "http://localhost:4000/api/webhooks/incidents" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: incidentflow-whsec-supersecretkey123" \
  -d '{
    "service": "Payment API",
    "title": "Payment API latency above threshold",
    "description": "Average latency exceeded 2 seconds across us-east-1 workers",
    "severity": "SEV_2"
  }'
```

### Expected Response:
```json
{
  "success": true,
  "data": {
    "id": "c1f7b0e1-...",
    "title": "Payment API latency above threshold",
    "description": "Average latency exceeded 2 seconds across us-east-1 workers",
    "severity": "SEV_2",
    "status": "INVESTIGATING",
    "serviceId": "...",
    "startedAt": "2026-09-03T...",
    "service": {
      "name": "Payment API"
    }
  }
}
```

---

## Running Tests

### Backend Test Suite (Auth, RBAC, Incidents, Webhooks, Analytics)
```bash
cd backend
npm test
```

### Frontend Test Suite (Login, Incident List, Filter Bar)
```bash
cd frontend
npm test
```

---

## Building for Production

### Backend Build
```bash
cd backend
npm run build
```
Generates production JavaScript files in `backend/dist/`.

### Frontend Build
```bash
cd frontend
npm run build
```
Compiles and bundles static assets in `frontend/dist/`.

---

## REST API Reference

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `GET` | `/api/users` | Authenticated | List team members for assignment |
| `GET` | `/api/services` | Authenticated | List microservices and health statuses |
| `POST` | `/api/services` | Admin Only | Register a new microservice |
| `GET` | `/api/services/:id` | Authenticated | Inspect single service details |
| `PATCH` | `/api/services/:id` | Admin Only | Update service details or health status |
| `DELETE`| `/api/services/:id` | Admin Only | Remove service from registry |
| `GET` | `/api/incidents` | Authenticated | Query incidents (search, filter, paginate) |
| `POST` | `/api/incidents` | Authenticated | Declare new production incident |
| `GET` | `/api/incidents/:id` | Authenticated | Retrieve incident investigation file |
| `PATCH` | `/api/incidents/:id` | Authenticated | Update status, severity, or assignee |
| `DELETE`| `/api/incidents/:id` | Admin Only | Delete incident record |
| `GET` | `/api/incidents/:id/comments` | Authenticated | List incident investigation notes |
| `POST` | `/api/incidents/:id/comments` | Authenticated | Post investigation note |
| `GET` | `/api/incidents/:id/timeline` | Authenticated | Retrieve audit timeline events |
| `GET` | `/api/analytics/overview` | Authenticated | Retrieve KPI overview (MTTR, active count) |
| `GET` | `/api/analytics/incidents` | Authenticated | Retrieve severity/service/volume charts |
| `POST` | `/api/webhooks/incidents` | Webhook Secret | Ingress incident from external monitoring |

---

## Future Improvements
- Multi-factor authentication (MFA/TOTP) and SAML/Okta integration.
- WebSockets or Server-Sent Events (SSE) for live timeline broadcasting across connected operators.
- Slack / PagerDuty bidirectional alert synchronization.
- Post-Mortem / RCA export to Markdown and PDF.
