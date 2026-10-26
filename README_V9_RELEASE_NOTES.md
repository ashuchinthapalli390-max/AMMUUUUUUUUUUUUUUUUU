# Ammu Birthday Website v9 — source package and actual verification

This edition preserves the existing React/Vite + Three.js + GSAP birthday website, including all **21 birthday chapters**, the diary/check-in, photographs, interactive magazine, keepsake ID, cake studio, gifts, shopping workflow, letters, playlist, mini-games, certificates, admin Studio, and backend.

It was assembled from the **last available v8 ZIP**, not from newer Antigravity edits which were not uploaded as source files. The screenshots, earlier specs, and reference video informed the updates.

## Changes completed in v9

1. Scrapbook liquid-photo overlay repaints a thin translucent paper sheet each frame, preventing the accumulated opaque white mask from permanently hiding Ammu's face. The original photo is unchanged.
2. **Delivery OTP actions are admin-only**. Ammu's guest tracking screen now shows tracking and gift statuses, but no code field. Ashu can request an email OTP and enter the code voluntarily supplied after real delivery through authenticated Studio. Codes must be six digits, expire after ten minutes, and have limited attempts.
3. Production/public preview endpoint removed. The birthday gate checks the server before entering, and reboots legacy guest controllers after midnight so the clock doesn't remain stuck in a pre-unlock state. Protected image assets return 403 before unlock.
4. Dedicated portrait/photo page, magazine, ID front/back flip styles, editable playlist and 3D birthday cake module are preserved. Extra backface CSS improves WebKit card visibility. QR directs to `/for-ammu` on the active origin.
5. Improved editorial birthday poster preview and changed calendar labels; the calendar has only noninteractive dates except today's check-in button. The intro uses two supplied reference photos without invented faces.
6. Cinema archive now uses large poster-style layouts with staggered animation, accurate watched/planned labels, and **editable real poster paths**. When no licensed poster is supplied, it displays an honestly stylised title-based placeholder rather than pretending another picture is the film's official artwork.
7. Eight staged memberships/vouchers with claim-driven Three.js card emergence; the shopping coupon card stays hidden until the membership sequence finishes. The existing claim/redeem flow, `POTTI1703`, 12-category shopping, gift packing and order-tracking logic remain intact.
8. Existing chapter navigation and animations retained with internal scrolling before boundaries; desktop designs and photographs preserved.
9. `.env` and `.env.example` are included with **blank, safe editable placeholders** for Resend, admin security, site origin, cron credentials and birthdays. No real private keys included.

## Start locally

Requirements: Node.js **20.19 or newer**, npm and an active connection for the initial npm dependency install.

```
npm install
npm run dev
```

React site `http://127.0.0.1:5173` | backend `http://127.0.0.1:4173` | Studio `http://127.0.0.1:5173/admin`

Run `npm run check` for syntax/layout validation, and `python tools/test-api.py` for dependency-free local API security regressions.

### `.env` keys

```
PUBLIC_URL=https://example.com
ADMIN_PASSWORD=replace-with-a-unique-strong-password
SESSION_SECRET=replace-with-64-random-hex-characters
CRON_SECRET=replace-with-an-independent-secret
ASHU_EMAIL=your-real-email
AMMU_EMAIL=consenting-recipient-email
EMAIL_FROM=Birthday <birthday@your-verified-domain.example>
RESEND_API_KEY=re_xxx
REMINDERS_ENABLED=0
REMINDER_CONSENT=0
DEMO_MODE=0
COOKIE_SECURE=1
HOST=127.0.0.1
PORT=4173
```

Always keep `REMINDERS_ENABLED=0` and `REMINDER_CONSENT=0` until Ammu has explicitly agreed to email notifications. Set the originating domain in Resend. **Never commit your filled `.env` file.** `COOKIE_SECURE=1` requires HTTPS.

## Production hosting restrictions

**This source is not automatically production-ready on a static Vite host or serverless-only Vercel deployment.** The Node.js API expects persistent writable `data/site.json` and `data/db.json` files, which serverless functions normally do not provide. For initial testing, run on a server with persistent filesystem access; for reliable deployment migrate check-ins, wishes, memberships, notifications and orders to an authenticated database such as managed PostgreSQL. Schedule the authenticated `/api/cron/daily` route externally: a sleeping server does not send reminders.

The visitor cookie identifies one browser, **not necessarily Ammu**. One-user/one-day validation across all devices requires verified invite/login. No email will actually be sent without valid Resend credentials and recipient opt-in. Complete surprise text in the compiled client bundle is not fully server-hidden before midnight; if secrecy is required, use server-delivered, authenticated birthday chapters.

## Assets still requiring replacement or user inputs

- **Licensed, real movie poster files:** editable `poster` keys in `data/site.json`; avoid misrepresenting generic placeholders as authentic posters.
- **Authentic product photos with verified licences** and optional shopping URLs; the existing product JPGs are retained from the user's earlier source rather than falsely claimed to be verified real retailer photographs.
- **Song audio and artwork** under `public/assets/music`, editable through Ashu's Studio.
- **Full 3D cake and cut geometry** need visual verification on the actual target laptop with WebGL. The source does not prove the mesh perfectly matches the reference video.

## Tests actually performed here

- `node --check` on the backend and existing JavaScript controller files: passed.
- `node tools/verify-layout.mjs`: passed (21 chapters, 37 host components, 28 required interaction IDs).
- Local Node backend API tests passed: first check-in, duplicate rejected, persistent status, public surprise locked, public preview blocked, admin authentication, guests blocked from admin OTP, gallery photos protected before unlock.
- Archive integrity and source paths verified.

**Could not run `npm install`, the Vite production build, or live Chrome visual tests in this environment:** npm registry access fails with DNS `EAI_AGAIN`. Therefore the compiled build, 3D animations, printing and mobile responsiveness must be tested after dependencies install. Do not claim production readiness from these checks alone.
