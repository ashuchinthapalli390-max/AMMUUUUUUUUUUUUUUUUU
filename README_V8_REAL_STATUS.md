# Ammu Birthday React v8 — updated from the last attached v5 source

This project was updated using the **actual React v5 ZIP available in the conversation**. Later Antigravity edits were represented by screenshots and written requirements, but the newer Antigravity source tree was not attached, so this is *not* a merge of that tree.

## Included changes

- New React birthday frontdoor: original-style burgundy theatre-curtain introduction -> 23-day Goddess of Little Joys calendar -> real daily check-in -> daily poster -> velvet curtain countdown -> midnight entrance.
- Correct approved black-dress + sunglasses portrait in the public calendar/teaser, no other date selectable, completed day shows handwritten ink mark; animated paper effect.
- Real local Node API endpoints `GET /api/checkin/status`, `POST /api/checkin`, optional authenticated `POST /api/cron/daily`.
- The recipient visitor is tracked through a signed HttpOnly browser cookie. One check-in per day *per browser/session identifier* is enforced on the server. This is not full identity verification for Ammu.
- Consent-gated Resend reminder support, disabled by default. You must opt in, provide verified addresses, a Resend API key, and configure a cron service yourself.
- No public preview controls in the new frontdoor; `.env` defaults to `DEMO_MODE=0`.
- Restored native scrolling inside an active chapter before trying to change scenes.
- More legible scrapbook image instead of opaque white masking, extra moving photos in the hero.
- Bestie ID-card 3D backface overrides and the dedicated `/for-ammu` QR route.
- Letters unfold with a fresh animation on selection.
- Playlist now includes a rotating CD and cursor-hover song-art layer. The original album covers must be provided with the songs later.
- 3D gift-box contents now include animated premium card geometry rather than an empty box.
- The cake retries when the cake scene becomes active, and uses the approved black-dress photo.
- `.env` and `.env.example` included, with intentionally blank secrets and Resend values.

## Local startup

Node 20.19+ required. From the project folder:

```bash
npm install
npm run dev
```

This starts the API on port 4173 and React/Vite on port 5173. Open `http://127.0.0.1:5173`.

**Do not deploy using static Vite hosting alone.** The time lock, check-ins, messages and email actions require a running backend and persistent storage.

## Configure `.env`

- `PUBLIC_URL` publicly reachable HTTPS address, e.g. `https://your-site.example`
- `ADMIN_PASSWORD` strong random password.
- `SESSION_SECRET` long random string, 32+ bytes recommended.
- `CRON_SECRET` random token for scheduled reminders.
- `ASHU_EMAIL` and `AMMU_EMAIL` real, permitted recipient addresses.
- `EMAIL_FROM` Resend-verified sender, e.g. `Birthday <birthday@verified-domain.example>`.
- `RESEND_API_KEY` your Resend secret key.
- `REMINDERS_ENABLED=1` only after testing.
- `REMINDER_CONSENT=1` only after Ammu explicitly agrees to email reminders.
- `DEMO_MODE=0` remains disabled in production.
- `COOKIE_SECURE=1` on HTTPS.
- In production, set the appropriate HOST and PORT for the platform.

Never commit a filled `.env` or `config.local.json` to Git. Keep the `.env.example` placeholders only.

## Sending daily email

The server does not wake itself up. Configure your scheduler to POST `https://your-site.example/api/cron/daily` once per day at the desired IST time, using `Authorization: Bearer <CRON_SECRET>`. The backend deduplicates by date and recipient.

Do not send every-minute or every-second emails. Countdown milestones should be shown in the site, not blasted into the recipient's inbox.

## Not yet production verified / not completed in this archive

- **Vite production build and live Chrome animation checks were not possible here**, as the npm registry could not be reached to install dependencies.
- The original v5 product images are illustrative placeholders. A licensed complete replacement photo collection has *not* been embedded. Sources researched include Pexels, Unsplash, Apple newsroom; check rights for any official brand artwork you import.
- Native Three.js model/cake geometry was enhanced only by startup/retry changes; real-browser visual tests of exact cake cut geometry remain outstanding.
- The check-in system stores on `data/db.json`, which is not durable on typical serverless hosts. Move check-ins, orders and other records to Postgres/Supabase before production.
- A signed visitor cookie only identifies that browser, not a verified human identity. Production one-person check-in requires a verified login or one-time invitation.
- The source bundles existing friendship details in client components. To keep *all* birthday content secret before midnight, move surprise copy/assets behind server-protected APIs rather than relying only on frontend visibility.
- The current server makes no guarantee of email delivery; without valid Resend credentials sending is disabled.
- Preview / admin and order verification flows still need security review and full end-to-end testing before publication.

## Tests actually run in this environment

1. `node --check server.mjs`, `public/js/app.js`, `public/js/experience.js` and related files passed.
2. TypeScript parser checked all JSX source files with zero JSX syntax errors.
3. Existing React layout verifier reported 21 chapters, 37 host components and 28 required interaction IDs.
4. Local API test: fresh signed visitor -> check-in created -> duplicate returns `alreadyCollected: true` -> status returns checkedToday true.
5. Teaser image was accessible via HTTP 200.

These do **not** substitute for `npm run build` and real interactive browser testing.
