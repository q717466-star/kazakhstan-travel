-- Production PostgreSQL 16 Schema for Kazakhstan Travel Platform
-- Parity with packages/core/src/db/schema.sql

CREATE TABLE IF NOT EXISTS tours (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  country TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  price_from_usd INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 6,
  popularity_score INTEGER NOT NULL DEFAULT 50,
  recommended_order INTEGER NOT NULL DEFAULT 100,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  cover_image TEXT NOT NULL,
  data_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS destinations (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  region_tag TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  elevation_m INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 10,
  is_featured BOOLEAN NOT NULL DEFAULT TRUE,
  image TEXT NOT NULL,
  data_json JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_origin TEXT NOT NULL,
  travel_date DATE NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  tour_code TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT TRUE,
  data_json JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS blog_articles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  cover_image TEXT NOT NULL,
  published_at DATE NOT NULL,
  read_minutes INTEGER NOT NULL DEFAULT 5,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  data_json JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS page_blocks (
  key TEXT PRIMARY KEY,
  data_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS lead_number_seq START 1;

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  request_number TEXT NOT NULL UNIQUE,
  channel TEXT NOT NULL CHECK (channel IN ('website', 'telegram', 'whatsapp')),
  locale TEXT NOT NULL CHECK (locale IN ('en', 'ru', 'kk')),
  request_type TEXT NOT NULL CHECK (request_type IN ('book_tour', 'plan_trip')),
  tour_code TEXT,
  tour_title_snapshot TEXT,
  custom_params_json JSONB,
  preferred_date DATE,
  is_flexible_dates BOOLEAN NOT NULL DEFAULT FALSE,
  participants INTEGER NOT NULL CHECK (participants > 0),
  customer_name TEXT NOT NULL,
  contact_method TEXT NOT NULL CHECK (contact_method IN ('chat', 'email', 'phone')),
  contact_value TEXT NOT NULL,
  country TEXT,
  notes TEXT,
  consent_given BOOLEAN NOT NULL CHECK (consent_given = TRUE),
  consent_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('new', 'in_progress', 'proposal_sent', 'awaiting_payment', 'confirmed', 'cancelled')),
  external_chat_id TEXT,
  external_user_handle TEXT,
  idempotency_key TEXT UNIQUE,
  assigned_manager_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_channel ON leads(channel);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

CREATE TABLE IF NOT EXISTS lead_events (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  actor TEXT NOT NULL,
  event_type TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_events_lead_id ON lead_events(lead_id);

CREATE TABLE IF NOT EXISTS bot_sessions (
  session_key TEXT PRIMARY KEY,
  channel TEXT NOT NULL CHECK (channel IN ('telegram', 'whatsapp')),
  chat_id TEXT NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'ru', 'kk')),
  step TEXT NOT NULL,
  draft_json JSONB NOT NULL,
  last_lead_number TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  channel TEXT NOT NULL,
  external_event_id TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  response_json JSONB,
  PRIMARY KEY (channel, external_event_id)
);

CREATE TABLE IF NOT EXISTS manager_notifications (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  request_number TEXT NOT NULL,
  channel TEXT NOT NULL,
  target_url TEXT NOT NULL,
  summary TEXT NOT NULL,
  delivery_status TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'editor')),
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
