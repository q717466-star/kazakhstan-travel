# Kazakhstan Travel — Digital Expedition Platform, CMS/CRM & Omnichannel Booking Bots

Modernization platform for **Kazakhstan Travel** (`https://www.kazakhstan-travel.com/`), uniting an editorial adventure travel website (`EN / RU / KK`), interactive route maps, a role-based CMS/CRM back-office, and **Telegram Bot API + Meta WhatsApp Cloud API** booking concierges backed by a single shared database and sequential `#KT-xxxxx` lead registry.

---

## Key Capabilities

1. **Editorial Public Platform (`apps/web/src/app/[locale]/`)**
   - Full trilingual localization (`/en`, `/ru`, `/kk`) with zero language mixing, `hreflang` alternates, `canonical` URLs, XML sitemap, JSON-LD (`TravelAgency`, `TouristTrip`, `BreadcrumbList`, `Article`), and 301 migration redirects for legacy URLs.
   - Cinematic Adventure layout: fullscreen parallax hero, 5-field Quick Trip Finder, asymmetric destination showcase, 12 authentic Kazakhstan/Kyrgyzstan/Central Asia 4x4 tours, 8-parameter live catalog filter, day-by-day expandable tour timelines, interactive Leaflet maps, sticky desktop + fixed mobile booking bars, and a 6-step Custom Trip Builder (`/plan-your-trip`).
2. **Omnichannel Booking Engine (`packages/core/src/bot-engine/` + `apps/bots/`)**
   - Channel-agnostic 6-step conversation engine shared by **Telegram Bot API** and **WhatsApp Cloud API** (English default + Russian/Kazakh).
   - Automatic tour deep-link parsing (`/start tour_CHARYN-1D` on Telegram, pre-filled `wa.me` messages with tour code on WhatsApp), graceful fallback for unknown tour codes, server-side `YYYY-MM-DD` non-past date validation, `participants > 0`, international phone numbers (E.164, any country), smart skip of redundant phone prompt when replying in current chat, draft edit & `/cancel`, explicit personal data consent gate, webhook/submit idempotency (no duplicate leads), and DB-failure draft preservation + retry.
3. **Closed CRM, CMS & Live Bot Simulator (`apps/web/src/app/admin/`)**
   - Unified Lead Registry filtering Website, Telegram, and WhatsApp requests side-by-side (`KT-00001`, `KT-00002`, ...) with 6 CRM statuses (`new`, `in_progress`, `proposal_sent`, `awaiting_payment`, `confirmed`, `cancelled`), interaction history, and manager notification links.
   - Built-in **Tours & Content CMS** (create/edit tours, day-by-day itineraries, EN/RU/KK text, photo uploads, destinations, reviews, blog articles) + RBAC user management (`admin`, `manager`, `editor`).
   - Built-in **Bot Webhook Simulator** (`/admin/simulator`) to demonstrate deep links, invalid dates/codes, consent refusal, duplicate webhook replay, and simulated DB save failure recovery cleanly during offline/sandbox evaluation.

---

## Quick Start (Local Development — One Command)

Requirements: **Node.js >= 22.13** (verified on Node 24.14.0; uses built-in `node:sqlite`, so no native database install is required locally).

```bash
# 1. Install dependencies across all workspaces
npm install

# 2. (Optional) Copy .env.example to .env and fill real tokens if using live bots
cp .env.example .env

# 3. Start the Next.js server (public site + APIs + webhooks + Admin CRM/CMS)
npm run dev
```

Open:
- **Public Website:** http://localhost:3000/en (also `/ru`, `/kk`)
- **Admin CRM / CMS / Simulator:** http://localhost:3000/admin/login

### Local Development Staff Accounts (Seeded Automatically)

| Role | Email | Password | Permissions |
| --- | --- | --- | --- |
| Admin | `admin@kazakhstan-travel.local` | `Admin!2026` | Full CRM, CMS, Simulator, Staff RBAC |
| Manager | `manager@kazakhstan-travel.local` | `Manager!2026` | Lead Registry, Statuses, Simulator |
| Editor | `editor@kazakhstan-travel.local` | `Editor!2026` | Tours, Destinations, Reviews, Blog CMS |

> Demo role quick-login buttons appear automatically **only** when `NODE_ENV !== 'production'`.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js web, API, webhook & admin server on port `3000` |
| `npm test` | Run all Vitest automated suites (validation, bot FSM, CRM, webhook HMAC) |
| `npm run build` | Compile `@kt/core`, `@kt/bots`, and production `apps/web` bundle |
| `npm run seed` | Explicitly initialize / re-verify the SQLite database (`./data/kazakhstan-travel.db`) |
| `npm run bot:telegram` | Run standalone Telegram Bot long-polling worker (requires `TELEGRAM_BOT_TOKEN` in `.env`) |
| `npm run typecheck` | Run TypeScript typechecking across all workspaces |

---

## Production Deployment (PostgreSQL + Docker / Vercel)

Local runs default to `./data/kazakhstan-travel.db` (`node:sqlite` in WAL mode). On Vercel serverless (`apps/web/vercel.json`, Root Directory `apps/web`), SQLite uses `/tmp/kazakhstan-travel.db` with automatic seeding and auto-detects `VERCEL_URL` / `NEXT_PUBLIC_SITE_URL`. For Docker production, `docker-compose.yml` and `packages/core/src/db/schema.postgres.sql` ship ready for PostgreSQL 16:

```bash
docker compose up -d --build
```

---

## Integrating an Existing Website / External CRM API

If connecting the bots or website forms to an external legacy CRM API (`kazakhstan-travel.com` Laravel backend):
1. All lead creation flows pass through `createLead()` in `packages/core/src/services/lead.service.ts`.
2. Add an outgoing CRM HTTP client call inside `packages/core/src/services/notification.service.ts` (or mirror the `POST /api/leads` contract) using the `idempotencyKey` header so retries never duplicate records in the external CRM.
3. Preserve all 6 statuses defined in `ALLOWED_STATUSES` (`new`, `in_progress`, `proposal_sent`, `awaiting_payment`, `confirmed`, `cancelled`).

---

## Project Structure

```text
kazakhstan-travel/
├── packages/core/          # Shared domain types, validation, PII-safe logger, SQLite/PG schemas, lead & bot engine
├── apps/bots/              # Telegram Bot API adapter + Meta WhatsApp Cloud API adapter + polling worker
├── apps/web/               # Next.js 15 App Router public website, API routes, webhooks & Admin CRM/CMS
├── tests/                  # Vitest automated verification suite (16+ tests)
├── docs/                   # Architecture, messenger setup, test matrix, and defense script
├── docker-compose.yml      # Production PostgreSQL 16 + web + Telegram worker stack
└── .env.example            # Environment variable template (no secrets committed)
```
