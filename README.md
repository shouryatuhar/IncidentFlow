# IncidentFlow

> **A modern full-stack DevOps incident management platform for engineering teams.**

[![IncidentFlow CI](https://github.com/shouryatuhar/IncidentFlow/actions/workflows/ci.yml/badge.svg)](https://github.com/shouryatuhar/IncidentFlow/actions)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-success?style=flat&logo=vercel)](https://frontend-murex-omega-87.vercel.app)
[![API Docs](https://img.shields.io/badge/OpenAPI-Swagger%203.0-blue?style=flat&logo=swagger)](http://localhost:4000/api/docs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

IncidentFlow allows software engineering teams to declare, track, triage, investigate, and resolve production incidents with real-time timelines, status workflows, role-based access control, automated external monitoring webhooks, and reliability analytics.

Inspired by internal engineering operations tools like Linear and PagerDuty, IncidentFlow prioritizes a clean, high-density, dark-mode user interface, type safety across the stack, and persistent PostgreSQL audit records.

---

## 🌐 Live Cloud Deployments & Documentation

- **Production Web Application**: [https://frontend-murex-omega-87.vercel.app](https://frontend-murex-omega-87.vercel.app)
- **Production REST API**: [https://backend-pink-gamma-zqtni7yani.vercel.app/api](https://backend-pink-gamma-zqtni7yani.vercel.app/api)
- **Live Interactive Swagger UI**: [https://backend-pink-gamma-zqtni7yani.vercel.app/api/docs](https://backend-pink-gamma-zqtni7yani.vercel.app/api/docs)
- **Live OpenAPI 3.0 JSON Spec**: [https://backend-pink-gamma-zqtni7yani.vercel.app/api/docs.json](https://backend-pink-gamma-zqtni7yani.vercel.app/api/docs.json)
- **Live Health Probe**: [https://backend-pink-gamma-zqtni7yani.vercel.app/api/health](https://backend-pink-gamma-zqtni7yani.vercel.app/api/health)
- **Cloud Database**: Managed PostgreSQL via Neon (AWS us-east-2) with SSL encryption
- **1-Click Infrastructure Blueprint**: [`render.yaml`](./render.yaml) (Turnkey Render blueprint)

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
│       Helmet, Rate Limiter, Zod Validation, JWT        │
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

### Architecture Highlights

- **Frontend**: React 18 SPA built with Vite for fast HMR. UI state and caching managed with TanStack React Query v5. Styled with Tailwind CSS in an engineering-grade dark theme (`slate-950`/`slate-900`).
- **Backend**: Express.js in strict TypeScript. Layered modular architecture separating routes, controllers, business services, and validation schemas.
- **Database & ORM**: PostgreSQL with Prisma ORM providing compile-time type safety, relational foreign key constraints, cascade deletes, and migrations.
- **Security**: Hardened with `helmet` HTTP headers, `express-rate-limit` against brute-force and DDoS, bcrypt password hashing, and signed JWT tokens.
- **API Documentation**: Built-in interactive OpenAPI 3.0 / Swagger documentation mounted at `/api/docs`.

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend Framework** | React 18 + Vite 6 | Industry-standard component model with instant HMR and optimized production bundles |
| **Styling** | Tailwind CSS | Utility-first CSS enabling an engineering dark-mode design system without runtime overhead |
| **Server State** | TanStack Query v5 | Automatic background refetching, caching, window focus revalidation, and mutation invalidation |
| **Routing** | React Router v6 | Client-side routing with protected route middleware and session-aware navigation |
| **Charts** | Recharts | Composable SVG data visualizations for MTTR, severity distributions, and incident volume |
| **Backend Runtime** | Node.js (v20+) + Express | Mature, predictable event-driven runtime with low latency and clean middleware architecture |
| **Type Safety** | TypeScript (Strict) | End-to-end type safety between database models, API payloads, and frontend state |
| **Database ORM** | Prisma ORM v5 | Type-safe queries, migration engine, and schema synchronization |
| **Database** | PostgreSQL 15 | Battle-tested relational database with ACID compliance and robust date-arithmetic for MTTR |
| **Security** | Helmet + Rate Limit | HTTP security headers, anti-sniffing, anti-clickjacking, and windowed rate limiting |
| **API Docs** | Swagger UI + OpenAPI 3.0 | Self-documenting API explorer for developer ease and third-party integrations |
| **Validation** | Zod | Runtime validation for inbound HTTP request bodies, params, and webhook payloads |
| **Testing** | Vitest + RTL + Supertest | Blazing-fast test runner for backend integration and frontend UI component suites |
| **DevOps** | Docker + Compose + Actions | Reproducible multi-container environments and automated CI testing pipelines |

---

## Project Structure

```
IncidentFlow/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI workflow (PostgreSQL + Test + Build)
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema (User, Service, Incident, Comment, Timeline)
│   │   └── seed.ts            # Realistic development/demo dataset
│   ├── src/
│   │   ├── config/            # Environment variables, Prisma client, Swagger spec
│   │   ├── middleware/        # JWT auth, RBAC guard, Zod validation, error handler
│   │   ├── modules/
│   │   │   ├── analytics/     # MTTR and incident volume aggregation endpoints
│   │   │   ├── auth/          # Register, Login, Session (/api/auth/me)
│   │   │   ├── comments/      # Incident comments and auto-timeline logging
│   │   │   ├── incidents/     # Incident CRUD, triage, filtering, search
│   │   │   ├── services/      # Microservice catalog CRUD with RBAC
│   │   │   ├── timeline/      # Chronological PostgreSQL audit timeline
│   │   │   ├── users/         # Team member directory
│   │   │   └── webhooks/      # Inbound monitoring webhook ingress
│   │   ├── utils/             # Typed application error classes
│   │   ├── app.ts             # Express app setup, Helmet, Rate Limiter, Swagger
│   │   └── server.ts          # Server entrypoint with graceful shutdown
│   ├── tests/                 # Backend Vitest integration suites (Auth, RBAC, Security, etc.)
│   ├── Dockerfile
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/               # Typed Axios/Fetch client modules
│   │   ├── components/        # Badges, Buttons, Modals, Tables, Timeline, Comments
│   │   ├── context/           # AuthContext and ToastContext
│   │   ├── pages/             # Dashboard, Incidents, Detail, Services, Analytics, Settings, Auth
│   │   └── tests/             # React Testing Library component tests
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vercel.json            # Vercel deployment configuration
│   └── vite.config.ts
├── docker-compose.yml         # Multi-container Postgres + Backend + Frontend
├── render.yaml                # Render 1-click cloud deployment blueprint
├── .env.example
├── .gitignore
├── package.json               # Monorepo management scripts
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
- All timeline events are stored in PostgreSQL table `timeline_events`.
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
- Validates payload with Zod schemas.
- Resolves affected service by name or ID.
- Automatically creates incident, auto-assigns service owner, and logs initial timeline event.

---

## Security & Reliability Engineering

IncidentFlow adheres to enterprise security standards:

- **Helmet Security Headers**: Automatically applies `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-DNS-Prefetch-Control: off`, and Strict-Transport-Security.
- **Rate Limiting**:
  - **General API Limiter**: 120 requests/minute per IP across `/api/*`.
  - **Strict Auth Limiter**: 30 requests/15 minutes on `/api/auth/login` and `/api/auth/register` to mitigate credential brute-forcing.
- **Zod Runtime Schema Validation**: Every inbound request body, path parameter, and query string is verified against strict schemas before executing business logic.
- **Sanitized Errors**: Operational exceptions return uniform `{ success: false, error: { message, details } }` responses. Database exceptions and server stack traces are never exposed to clients.
- **PostgreSQL Cascades & Foreign Keys**: Relational data integrity is strictly enforced at the database engine level with cascade deletion on incident relations.

---

## Interactive API Documentation (OpenAPI / Swagger)

IncidentFlow serves an interactive Swagger UI directly from the backend server:

- **Swagger UI**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **Raw OpenAPI 3.0 Spec**: [http://localhost:4000/api/docs.json](http://localhost:4000/api/docs.json)

The specification details request bodies, query parameters, authorization requirements (`BearerAuth` and `WebhookSecretAuth`), and response models for all 14 REST endpoints.

---

## Continuous Integration (GitHub Actions)

A full CI workflow is configured in [`.github/workflows/ci.yml`](./.github/workflows/ci.yml):

- **Service Container**: Automatically starts an isolated PostgreSQL 15 instance.
- **Schema Migration**: Executes `prisma db push` to verify DDL scripts.
- **Seeding**: Executes `db:seed` against test database.
- **Test Suites**: Executes **all 33 automated tests** (28 backend integration tests + 8 frontend component tests).
- **Production Build**: Compiles backend (`tsc`) and frontend (`vite build`) to guarantee zero compile-time regressions.

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
npm install
```

### 2. Set Up Database

```bash
# Push schema migrations to PostgreSQL
npm run db:migrate

# Seed demo users, services, and realistic incidents
npm run db:seed
```

### 3. Start Development Servers

Run backend and frontend concurrently:

```bash
# Start backend API (http://localhost:4000)
npm run dev:backend

# In a separate terminal, start frontend (http://localhost:3000)
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Click **Admin Demo** or **Engineer Demo** to sign in immediately.

---

## Docker Compose Setup

Run the entire application (PostgreSQL, Backend API, Frontend Nginx) with a single command:

```bash
docker compose up --build
```

Access:
- **Frontend Web UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000/api](http://localhost:4000/api)
- **API Health Check**: [http://localhost:4000/api/health](http://localhost:4000/api/health)
- **Swagger Documentation**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

To seed initial data inside Docker:

```bash
docker compose exec backend npx prisma db push
docker compose exec backend npm run db:seed
```

---

## Testing & Quality Assurance

Run the automated test suites:

```bash
# Run all tests (backend + frontend)
npm run test

# Run backend tests only (Vitest + Supertest)
npm run test:backend

# Run frontend tests only (Vitest + React Testing Library)
npm run test:frontend

# Run complete 36-point live end-to-end integration audit
npx tsx backend/tests/full_audit.ts

# Production build check
npm run build
```

---

## Monitoring Webhook Example

Simulate an alert from Datadog or Prometheus using `cURL`:

```bash
curl -X POST "http://localhost:4000/api/webhooks/incidents" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: incidentflow-whsec-supersecretkey123" \
  -d '{
    "service": "Payment API",
    "title": "Payment API latency above threshold",
    "description": "Average latency exceeded 2.5 seconds across worker pods in us-east-1",
    "severity": "SEV_2"
  }'
```

---

## License

This project is licensed under the MIT License.
