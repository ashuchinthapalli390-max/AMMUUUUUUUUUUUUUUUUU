-- ====================================================================
-- AMMU BIRTHDAY CHECK-INS & DURABLE PERSISTENCE SCHEMA
-- Compatible with Supabase PostgreSQL / Postgres 14+
-- ====================================================================

-- 1. BIRTHDAY VISITORS
CREATE TABLE IF NOT EXISTS birthday_visitors (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email_subscription_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_birthday_visitors_last_seen ON birthday_visitors(last_seen_at);

-- 2. BIRTHDAY CHECK-INS
CREATE TABLE IF NOT EXISTS birthday_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL REFERENCES birthday_visitors(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  poster_id TEXT,
  source TEXT NOT NULL DEFAULT 'web',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_visitor_checkin_date UNIQUE(visitor_id, checkin_date)
);

CREATE INDEX IF NOT EXISTS idx_birthday_checkins_date ON birthday_checkins(checkin_date);
CREATE INDEX IF NOT EXISTS idx_birthday_checkins_visitor ON birthday_checkins(visitor_id);

-- 3. BIRTHDAY POSTERS
CREATE TABLE IF NOT EXISTS birthday_posters (
  id TEXT PRIMARY KEY,
  milestone_key TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  target_datetime TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CHECK-IN CONFIRMATION LOGS
CREATE TABLE IF NOT EXISTS checkin_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  checkin_date DATE NOT NULL,
  resend_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_checkin_email_date UNIQUE(recipient_email, checkin_date)
);
