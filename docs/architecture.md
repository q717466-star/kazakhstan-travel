# Architecture & Data Schema — Kazakhstan Travel

## 1. High-Level System Architecture

```text
  +--------------------+       +-------------------------+       +--------------------------+
  |   Public Website   |       |   Telegram Bot API      |       | WhatsApp Cloud API (Meta)|
  |  /en  /ru  /kk     |       | /api/webhooks/telegram  |       | /api/webhooks/whatsapp   |
  | (Tour + Planner)   |       | or long-polling worker  |       | (+ X-Hub-Signature-256)  |
  +---------+----------+       +------------+------------+       +-------------+------------+
            |                               |                                  |
            |                               +----------------+-----------------+
            |                                                |
            |                                                v
            |                               +----------------------------------+
            |                               |   Shared Bot Engine (FSM)        |
            |                               |   packages/core/src/bot-engine   |
            |                               |   EN/RU/KK · Edit/Cancel/Retry   |
            |                               +----------------+-----------------+
            |                                                |
            +------------------------+-----------------------+
                                     |
                                     v
                    +---------------------------------+
                    |     Unified LeadService         |
                    |  Validation · Consent · Redact  |
                    |  Idempotency · #KT-xxxxx Seq    |
                    +----------------+----------------+
                                     |
             +-----------------------+-----------------------+
             v                                               v
+--------------------------+                    +-----------------------------+
| Unified Database         |                    | Manager Notifications       |
| SQLite (local) /         |                    | In-app Admin Bell + link    |
| PostgreSQL 16 (prod)     |                    | Optional Telegram/SMTP push |
+--------------------------+                    +-----------------------------+
```

## 2. Database Schema

Both `packages/core/src/db/schema.sql` (SQLite) and `packages/core/src/db/schema.postgres.sql` (PostgreSQL 16) maintain strict parity across 11 tables:

- `tours`: Expedition catalog (`code`, `slug`, category, country, pricing, difficulty, seasons, activities, JSON localized EN/RU/KK copy, GPS route waypoints, day-by-day itinerary).
- `destinations`, `reviews`, `blog_articles`, `page_blocks`: CMS-managed content tables.
- `lead_sequence`: Atomic counter ensuring sequential `KT-00001`, `KT-00002`, ... numbers across all channels.
- `leads`: Single registry for `website`, `telegram`, and `whatsapp` inquiries (`UNIQUE(request_number)`, `UNIQUE(idempotency_key)`, mandatory `consent_given = 1` + `consent_at`, `participants > 0`, `preferred_date` or `is_flexible_dates`).
- `lead_events`: Immutable interaction and status transition timeline per lead.
- `bot_sessions`: Persistent per-channel conversation FSM state & draft preservation.
- `idempotency_keys`: Webhook message/update deduplication store (`PRIMARY KEY (channel, external_event_id)`).
- `manager_notifications`: Actionable manager alerts linking directly to `/admin/leads/<id>`.
- `staff_users` & `staff_sessions`: `scrypt`-hashed credentials and HMAC-SHA256 session tokens supporting `admin`, `manager`, and `editor` roles.

## 3. Reliability, Security & Privacy Controls

1. **Idempotency at Two Layers:**
   - Transport layer deduplicates webhook retries using `(channel, external_event_id)` in `idempotency_keys`.
   - Domain layer deduplicates rapid double-submit clicks using `idempotency_key = draft:<draftId>` in `leads`.
2. **Failure Preservation:**
   - Inside `createLead()`, request numbers are generated strictly inside the database transaction. If persistence throws `LeadPersistenceError`, no `#KT-...` number is returned and the bot session remains at `consent_gate` with its draft preserved for one-tap retry.
3. **Log Redaction:**
   - `redactSensitive()` strips phones, emails, tokens, secrets, cookies, and signatures before writing structured JSON logs.
4. **301 SEO Migration:**
   - Legacy URLs from `kazakhstan-travel.com` (`/tours/charyn-canyon`, `/about`, `/contacts`, `/reviews`, etc.) permanently redirect via `packages/core/src/seo/redirects.ts` to `/en/...` while preserving search rankings.
