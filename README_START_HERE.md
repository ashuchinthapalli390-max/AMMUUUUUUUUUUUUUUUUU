# AMMU MEDIA ASSET PACK — USER-FURNISHED / PRIOR WEBSITE MEDIA

This is an **asset pack and integration guide**, NOT a newly compiled website and NOT a live deployment.

## Included, ready to copy to your React repository

- `public/assets/music/` — six supplied MP3 tracks; ten current album-cover WEBP variants; README files.
- `public/assets/cinema/` — six movie posters mapped to the movie archive (Irumudi, Paradise, Doraemon, 418, Ranabali, Spider-Man plans).
- `public/assets/countdown/` — 21 complete 1080×1350 posters (21 DAYS LEFT through 2 DAYS LEFT, plus 24 HOURS LEFT) and a manifest.
- `public/assets/photos/` — 30 existing site gallery photos plus existing original_black / original_white photographs. These are from the previous site assets, not newly generated.
- `previews/` — countdown preview/contact sheets.
- `reference_only/original_uploads/` — additional exact prior uploads for manual reference; they are NOT wired to the public website automatically.
- `reference_only/*.mp4` — original visual reference, scroll reference, and magical-cursor reference; use only for inspecting behaviour, not for publishing.
- `integration/site_json_media_patch.json` — the verified playlist/movie/countdown entries from the prior no-shopping website source.
- `integration/asset_checksums.json` — SHA-256 hashes of every production media file.
- `integration/verify_assets.py` — check that all production media files are present and unmodified.
- `integration/ANTIGRAVITY_IMPLEMENTATION_PROMPT.md` — full repository-specific integration prompt.

## Installation (on an editable clone of the CURRENT GitHub main)

1. Unzip this archive.
2. COPY (merge, do not delete existing files) the `public/assets/` directory into the repository's `public/assets/` folder.
3. Use `integration/site_json_media_patch.json` to update ONLY playlist, movies and countdown media references in the current `data/site.json`; preserve unrelated configuration and edits.
4. Fix the frontend renderers to actually read playlist `src` + `cover`, movies `poster`, countdown manifest `image`. Do not assume copying files is sufficient.
5. Verify that preview/admin sessions can fetch protected music/images while public birthday content remains locked before Nov 17.
6. Run Python `python integration/verify_assets.py` from the extracted pack; then run the repo's `npm ci`, `npm run check`, `npm run build` and Chrome functional testing.

## Notes and limitations

- Current date is 2026-11-15; the 21-to-24-hour series is a **historical countdown set**. Do not resend expired milestones. The next relevant asset is 2 DAYS LEFT on Nov 15 and 24 HOURS LEFT on Nov 16 (same event as 1 DAY LEFT).
- The pack does NOT contain original artwork for 12h, 10h through 1h, or minute-by-minute countdown. Do not claim otherwise.
- Some album-cover variants are personalised; the correct Baarish (Half Girlfriend) photo has not been confirmed. `02-baarish.webp` is a prior design, not official cover art.
- Two movie entries are **planned**, not watched together (Ranabali and Spider-Man plans).
- Media folder contains commercially copyrighted music and promotional movie artwork. Packing supplied copies for local integration does not grant permission to publish or redistribute; secure rights before public hosting.
- Public repo should not contain secret `.env` values. The `.env.example` should use empty placeholders.
- Uploading music/posters to a public GitHub repo or hosting these assets on Vercel may violate rights or platform size limits. Prefer rights-cleared files/private access.
- Keep historical order records private, but do not reintroduce the removed shopping UI.
