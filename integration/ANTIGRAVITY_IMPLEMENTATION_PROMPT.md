# AMMU WEBSITE — FINAL MEDIA + SCROLL + PREVIEW REPAIR PROMPT FOR ANTIGRAVITY

Repository: https://github.com/ashuchinthapalli390-max/AMMUUUUUUUUUUUUUUUUU.git
Branch to audit: current `main` (do not assume prior ZIP version matches repository)

You are a senior React 19/Vite, imperative JS migration, GSAP animation, Node.js, performance, and QA specialist.

## 0. Non-negotiables
- Update the CURRENT repo, on a feature branch. Never overwrite source with older v12-v15 ZIP.
- Preserve exact existing brand, pastel pink/burgundy theme, letters, photos, magazine, correct birthday lock, gifts 1 & 2, cursor, and games.
- Shopping, cart, coupon, tracking and product ordering must stay removed. Never reintroduce them through an old media patch.
- Uploaded ZIP is an asset source; it has not changed the live website. Integrate it into current code and actually run browser tests.
- Do not auto-send emails or bypass the public time lock. Private admin preview only after server-side authorization.

## 1. AUDIT current project, not the screenshot alone
Inspect `src/BirthdayApp.jsx`, `src/BirthdayFrontdoor.jsx`, `src/screens/SectionPlaylist.jsx`, `src/screens/SectionMovies.jsx`, `src/screens/SectionChapterUi.jsx`, `src/screens/SectionOther2.jsx`, `public/js/app.js`, `public/js/experience.js`, `public/css/style.css`, `server.mjs`, `data/site.json`, `src/screens/AdminDashboard.jsx`, `public/js/admin.js`, `tools/verify-layout.mjs`.
Search for `addEventListener('wheel'`, `preventDefault`, `chapter-mode`, `page-mode`, `scrollTo`, `overflow:hidden`, `position:fixed`, timers and `scroll-snap`; also for `new Audio`, `music-toggle`, `playlist`, `src`, `cover`, `movies`, `poster`, `countdown`, `assets` and media APIs.
Before editing, record failures observed in Chrome at 1440×900 and mobile.

## 2. FIX SCROLL FIRST — NORMAL NATIVE SCROLLING
The user explicitly rejects forced chapter-by-chapter scrolling. Turn off page-mode wheel hijacking and preventDefault scroll locks. Page should scroll top to bottom naturally with normal mouse wheel and trackpad including momentum; no full-screen scene replacing the next chapter after a single wheel gesture.
Use body/document native scroll (`overflow-y:auto`, content height natural). Keep cinematic section-level reveal animations with GSAP ScrollTrigger or IntersectionObserver, triggered once on viewport visibility, without locking scroll or jumping the document. Support reverse scroll normally; no phantom 'turn page', fixed white frames, snap points or duplicated scroll controllers.
Preserve exception cases: magazine page turn only when inside its explicit reader; fullscreen cake experience; modal/lightbox scroll lock only while open. Nested dialogs and scrollable playlist work normally. Use hash links with scrollIntoView({behavior:'smooth'}) and `scroll-margin-top` for sticky nav. Hash/refresh/back navigation shouldn't jump or blank.
Ensure current code doesn't initialize BOTH old chapter controls AND new natural scroll handlers; clean up listeners. If legacy `experience.js` remains loaded, disable/replace its `prepareChapters` wheel controller and adjust any app.js `window.ammuGo()` calls to graceful normal anchor navigation.
Test slow wheel, fast wheel, trackpad momentum, backwards, touch, active modal, section longer than viewport and 2x reload. No unwanted scroll freeze and no content clipping.

## 3. RESTORE SIX SONGS — ACTUAL AUDIO AND CORRECT COVER
Install files from `public/assets/music/`, exactly:
01-samjhawan.mp3 / 02-baarish.mp3 / 03-tum-hi-ho.mp3 / 04-gehra-hua.mp3 / 05-channa-mereya.mp3 / 06-ye-tune-kya-kiya.mp3
Read `integration/site_json_media_patch.json` and map the site's playlist IDs/titles/artist/src/cover, preserving all unrelated site data. Correct play/pause, next, previous, seek, repeat, volume, auto-next, track title and cover changes; use one shared audio element/controller so the header button and playlist do not conflict. Chrome autoplay rules: audio starts only after user action. Do not create infinite background audio.
Fix clear Ammu polaroid as foreground; only pointer-over artwork region gets soft feathered liquid reveal of selected track cover beneath it, not giant blurred circle. On song change, change original cover immediately and rotate CD while actual audio plays; stop on pause. Use proper object-fit and intrinsic dimensions. Never silently substitute incorrect Baarish artwork: the supplied alternative Baarish photo is unrelated to this recording; use current design cover until correct rights-cleared art is provided.
Check actual HTTP GET and Range (`206`) response of audio. Determine whether `server.mjs` birthday asset guard is incorrectly returning 403 during private preview. Admin preview must authorize media server-side; public still locked.

## 4. MOVIE POSTERS
Install six `public/assets/cinema/*.jpg` assets. Update `data/site.json` movies to use these exact poster paths, not gradient placeholders. Ensure movie archive renders large portrait artwork with lazy-loading, responsive aspect ratios, tasteful hover and working memory modal. Mark Irumudi, Paradise, Doraemon and 418 'Watched Together' and Ranabali, Spider-Man 'Planned' as supplied in existing content; do not claim planned movies happened. No unrelated images.

## 5. COUNTDOWN POSTERS
Install `public/assets/countdown/*` with 21 files + manifest. Use the correct poster by server-authoritative birthday timezone (Asia/Kolkata) and daysRemaining. 1 DAY LEFT and 24 HOURS LEFT represent one event. Make daily poster popup show genuine file and offer full-resolution save without mangling image. Do not dynamically invent generic gradient poster if asset exists. Never show 21 days left on Nov 15, 2026. Fallback should be explicit if countdown asset doesn't exist. Update admin poster preview accordingly. Do NOT send historical countdown mail retroactively.

## 6. ASSETS AND ROUTES
Ensure files copied under `public/assets/` are served via `/assets/...` in dev and production. Do not use arbitrary absolute local paths or URLs from another Vite port. For server-controlled images and MP3s, keep authorisation consistent across admin preview, unlocked site and gate. Avoid accidental exposing secret media if site intended to remain private. Keep file sizes reasonable; don't clone huge mp3 files in JS bundles. Validate browser network panel: no 404, 403, HTML-as-audio, incorrect MIME, or blocked range/seek.

## 7. PRIVATE PREVIEW
The owner should see all sections with correct music, images and posters from authenticated Ashu Studio prior to 17 Nov 2026, even when public is locked. Secure server-side admin session; no query-string bypass. Test admin login, preview and logout and incognito denied. Preview should not send emails or submit permanent claims. Remove public debug banners.

## 8. CHECK EVERY PAGE AND STATE
Check the 18-chapter no-shopping intended flow. Correct missing-content regressions in sections, music toggle, midnight phone, animated letters, flying-note butterflies, membership button persistence and embedded celebration return. Do not undertake major feature redesign or reintroduce the shop. Don't remove old assets used by other features.

## 9. QA AND DELIVERY
Run `python integration/verify_assets.py` from extracted media pack; `npm ci`, `npm run check`, `npm run build`, existing API tests, Chrome screenshots and short recordings for scroll forward/back and cursor. Test Vercel production asset paths separately. Compare current branch screenshot to pre-change visual identity. Report exact changed files, failures repaired, image/audio status and blockers. Provide working PR and source ZIP only if build/tests actually pass. Don't claim production success if browser tests not run.
