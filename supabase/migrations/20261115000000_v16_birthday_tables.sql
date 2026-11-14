-- ====================================================================
-- AMMU BIRTHDAY WEBSITE V16 DATABASE SCHEMA
-- Compatible with Supabase Postgres / PostgreSQL 14+
-- ====================================================================

-- 1. COUNTDOWN SUBSCRIPTIONS & CONSENT
CREATE TABLE IF NOT EXISTS countdown_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  recipient_name TEXT DEFAULT 'Ammu',
  tier TEXT NOT NULL CHECK (tier IN ('daily', 'major', 'all_hourly_and_minute')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  opted_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_countdown_subs_email ON countdown_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_countdown_subs_active ON countdown_subscriptions(is_active);

-- 2. COUNTDOWN MILESTONES (Preloaded with all 26 official countdown events)
CREATE TABLE IF NOT EXISTS countdown_milestones (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_ist TIMESTAMPTZ NOT NULL,
  relative_label TEXT NOT NULL,
  subject_template TEXT NOT NULL,
  heading_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  compliment_text TEXT NOT NULL,
  poster_theme TEXT NOT NULL,
  photo_path TEXT NOT NULL,
  is_critical BOOLEAN NOT NULL DEFAULT FALSE,
  tier_required TEXT NOT NULL CHECK (tier_required IN ('daily', 'major', 'all_hourly_and_minute')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. COUNTDOWN POSTERS DEFINITIONS
CREATE TABLE IF NOT EXISTS countdown_posters (
  id TEXT PRIMARY KEY,
  milestone_id TEXT REFERENCES countdown_milestones(id) ON DELETE CASCADE,
  theme_name TEXT NOT NULL,
  photo_asset TEXT NOT NULL,
  badge_text TEXT NOT NULL,
  ribbon_color TEXT DEFAULT '#8b3d64',
  golden_sparkles BOOLEAN DEFAULT TRUE,
  flower_accents BOOLEAN DEFAULT TRUE,
  typography_style TEXT DEFAULT 'editorial-serif',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 4. COUNTDOWN EMAIL JOBS (Transactional queue with idempotency)
CREATE TABLE IF NOT EXISTS countdown_email_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key TEXT NOT NULL UNIQUE,
  milestone_id TEXT NOT NULL REFERENCES countdown_milestones(id),
  recipient_email TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'sent', 'skipped', 'failed', 'cancelled')),
  attempt_count INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  resend_id TEXT,
  last_error TEXT,
  locked_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_jobs_status_sched ON countdown_email_jobs(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_jobs_idempotency ON countdown_email_jobs(idempotency_key);

-- 5. COUNTDOWN EMAIL EVENTS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS countdown_email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES countdown_email_jobs(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. COUNTDOWN EMAIL DELIVERY LOGS (Provider feedback)
CREATE TABLE IF NOT EXISTS countdown_email_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_message_id TEXT,
  recipient_email TEXT NOT NULL,
  milestone_id TEXT,
  status TEXT NOT NULL,
  provider_response JSONB,
  error_message TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. UNSUBSCRIBE TOKENS
CREATE TABLE IF NOT EXISTS unsubscribe_tokens (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. FLYING LOVE NOTES (Customizable messengers)
CREATE TABLE IF NOT EXISTS flying_notes (
  id TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  butterfly_color TEXT NOT NULL DEFAULT 'blush-pink',
  theme TEXT NOT NULL DEFAULT 'heart-seal',
  probability INT NOT NULL DEFAULT 10,
  scene_visibility TEXT NOT NULL DEFAULT 'all',
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. HIDDEN COMPLIMENTS
CREATE TABLE IF NOT EXISTS hidden_compliments (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('cursor', 'scrapbook', 'stars', 'flowers', 'magazine', 'gift')),
  text TEXT NOT NULL,
  discovered_count INT NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE
);

-- 10. LIVE SHARING SESSIONS (Optional synchronized gift reveals)
CREATE TABLE IF NOT EXISTS live_sharing_sessions (
  id TEXT PRIMARY KEY,
  gift_id TEXT NOT NULL,
  ammu_active BOOLEAN NOT NULL DEFAULT TRUE,
  ashu_active BOOLEAN NOT NULL DEFAULT FALSE,
  stage INT NOT NULL DEFAULT 0,
  claimed BOOLEAN NOT NULL DEFAULT FALSE,
  last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
