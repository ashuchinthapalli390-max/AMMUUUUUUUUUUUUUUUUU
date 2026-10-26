# v4 — Liquid Paper / Page-Turn React Edition

## What changed

- Replaced free vertical chapter scrolling with a **true button-driven full-screen page-turn sequence**. Wheel gestures do not move the birthday page. `Turn Page →` and `← Previous Page` navigate pages inside an active chapter, with a separate cinematic GSAP transition between chapters. Progress dots indicate internal pages. Press PageDown/PageUp as alternatives.
- Added **Liquid Memory** to the beginning of the scrapbook: Ammu's original approved photo sits beneath a cream/white paper layer. Cursor brush makes organic, softly animated openings into the photo, which close when the pointer moves away. Choose the next photograph or proceed into the Polaroid gallery.
- Added a subtle **liquid photo mask behind the chapter artwork**, driven by cursor position. Flowers, stars, bows and butterflies still trail the cursor. The effects toggle controls both cursor particles and the global photo mask.
- Replaced the endless *Show More* gallery with **8 photos per gallery page**, Previous/Next storyboard buttons, and a 3D page-turn entrance.
- Added **Framer Motion chapter bloom announcements**, improved GSAP transitions and staggered entrance effects.
- Preserved all 20 guest chapters, interactive Three.js cake, gifts, optional wishes, guided shopping, coupon, vouchers, order tracker, magazine, ID card, games, certificates, admin dashboard, user-supplied photos and Node API.

## Key controls

- Chapter footer: `Turn Page →` / `← Previous Page`. At the end of a chapter, `Next Chapter →`.
- Each chapter's progress dots jump directly to one of its pages.
- The desktop mouse wheel no longer scrolls content. Small nested widgets and the 3D cake canvas retain their own wheel controls.
- Memories: reveal picture with mouse → `Another photograph ✿` or `Open the Memory Scrapbook →`; inside gallery, choose `Turn Scrapbook Page →`.
- `Flowers + Liquid on/off` toggle near the lower-right corner; honors reduced-motion preferences.

## Build/run

Node 20.19+; run `npm install`, `npm run dev` and visit `http://127.0.0.1:5173`. Admin at `/admin`.
For production, `npm run build && npm start`, after securing configuration and setting up email.

## Limits

No claim of a successful Vite production build in the authoring sandbox: npm registry access timed out. Local Node API and source layout checks passed. Test the page-turn transitions, canvas render, 3D cake, and shopping checkout in your actual Chrome environment before public deployment. Real email and OTP remain credential-dependent.
