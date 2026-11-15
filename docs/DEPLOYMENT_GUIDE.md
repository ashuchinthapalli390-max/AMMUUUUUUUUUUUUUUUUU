# AMMU BIRTHDAY WEBSITE — DEPLOYMENT & CONFIGURATION GUIDE (V16)

This document provides step-by-step instructions for deploying and configuring the Ammu Birthday Universe website.

---

## 1. Architecture Overview

- **Frontend**: React 19, Three.js, GSAP, Framer Motion, Vite, CSS custom properties.
- **Backend**: Node.js (>=20.19) HTTP API / Vercel Serverless API.
- **Data Layer**: Supabase Postgres (production) with durable labeled JSON fallback (`data/db.json`) for local development.
- **Email Delivery**: Resend API with idempotency tracking and opt-in consent enforcement.
- **Embedded Celebration**: 3D Birthday Celebration at `https://ammu-birthday-celebration-three.vercel.app/`.

---

## 2. Environment Variables Specification

Configure the following environment variables in your Vercel project settings or production hosting environment:

| Variable Name | Required | Default / Example | Purpose |
|---|---|---|---|
| `NODE_ENV` | Yes | `production` | Node environment |
| `APP_BASE_URL` | Yes | `https://ammu-birthday.vercel.app` | Public HTTPS domain for email links |
| `APP_TIMEZONE` | Yes | `Asia/Kolkata` | Canonical timezone for all countdown events |
| `BIRTHDAY_UNLOCK_AT` | Yes | `2026-11-17T00:00:00+05:30` | Midnight unlock timestamp (Asia/Kolkata) |
| `CELEBRATION_URL` | Yes | `https://ammu-birthday-celebration-three.vercel.app` | Embedded 3D celebration app URL |
| `CELEBRATION_ALLOWED_ORIGIN` | Yes | `https://ammu-birthday-celebration-three.vercel.app` | Origin for secure postMessage validation |
| `DATABASE_URL` | Optional | `postgres://user:pass@host:5432/db` | Direct PostgreSQL connection string |
| `SUPABASE_URL` | Optional | `https://xyzcompany.supabase.co` | Supabase API URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | `eyJhb...` | Supabase private service key (server-side ONLY) |
| `ADMIN_PASSWORD` | Yes | *(Strong secret)* | Password for Ashu's Studio (`/admin`) |
| `ADMIN_SESSION_SECRET` | Yes | *(64-char hex)* | HMAC secret for signing admin session cookies |
| `RESEND_API_KEY` | Yes | `re_...` | Resend API key for automated countdown emails |
| `RESEND_FROM_EMAIL` | Yes | `Ashu <birthday@yourdomain.com>` | Verified sender address in Resend |
| `AMMU_RECIPIENT_EMAIL` | Optional | `ammu@example.com` | Verified Ammu email (recipient) |
| `ASHU_NOTIFICATION_EMAIL`| Optional | `ashu@example.com` | Email for wishes notifications & test previews |
| `COUNTDOWN_EMAILS_ENABLED`| Yes | `true` (prod) / `false` (dev) | Master switch for countdown mail scheduler |
| `EMAIL_SCHEDULER_SECRET`| Yes | *(Random secret)* | Bearer token for triggering `/api/cron/countdown` |
| `EMAIL_DEFAULT_TIMEZONE`| Yes | `Asia/Kolkata` | Scheduler timezone |
| `EMAIL_DRY_RUN` | Yes | `false` (prod) / `true` (dev) | When `true`, logs jobs without calling Resend |
| `LIVE_SHARING_ENABLED` | Yes | `true` | Enables "Share With Ashu" realtime gift reveals |

> [!CAUTION]
> **Never prefix secret server keys with `VITE_`**. Keys prefixed with `VITE_` are embedded into client JavaScript bundles and visible to any public visitor.

---

## 3. Database Setup (Supabase)

1. Open your Supabase Dashboard: `https://supabase.com/dashboard`
2. Create a new project or select your existing project.
3. In the SQL Editor, paste and execute the schema from:
   `supabase/migrations/20261115000000_v16_birthday_tables.sql`
4. Copy `Project URL` to `SUPABASE_URL` and `service_role` key to `SUPABASE_SERVICE_ROLE_KEY`.

---

## 4. Email Scheduler Configuration (Vercel Cron / GitHub Actions)

To trigger the countdown check automatically every minute leading up to November 17, configure a cron trigger:

### Option A: Vercel Cron
Add a cron job in `vercel.json` hitting `/api/cron/countdown`:
```json
{
  "crons": [
    {
      "path": "/api/cron/countdown",
      "schedule": "* * * * *"
    }
  ]
}
```

### Option B: External Cron Service (e.g. Cron-Job.org / Upstash)
- **URL**: `https://your-domain.vercel.app/api/cron/countdown`
- **Method**: `POST`
- **Header**: `Authorization: Bearer <EMAIL_SCHEDULER_SECRET>`
- **Interval**: Every 1 minute starting November 15, 2026 00:00 IST until November 17, 2026 00:05 IST.

---

## 5. Security & Isolation Guidelines

- **Public Gate**: Prior to `2026-11-17T00:00:00+05:30`, all visitors (including unauthenticated visitors and logged-in admins) see the locked GateView with the live countdown clock. Protected assets return 403 until the exact server timestamp arrives.
- **Admin Studio**: Accessible strictly by logging into `/admin` with the configured `ADMIN_PASSWORD`. Validated server-side with `HttpOnly`, `SameSite=Lax` encrypted session cookies to manage content, settings, and monitor countdown emails.
- **Shopping Disabled**: All checkout, cart, payment, and product APIs are permanently disabled and return 404/403.
- **Consent Enforcement**: Emails are only sent if the recipient opted in to countdown milestones. Unsubscribe links take immediate effect.
