# Ammu Birthday Countdown — 45 Email-Ready Posters

This package contains **45 separate JPG files** in `email_ready_posters/`, each **1080 × 1350 pixels**. They are ready to attach individually to appropriately configured birthday countdown emails.

- 21 daily posters: 21 days left down to 2 days left, plus a single 24 hours / 1 day left poster.
- 24 final countdown posters: 12 hours, 10 through 1 hours, 30 and 20 minutes, 10 through 1 minutes, and the birthday unlock poster.
- `poster_manifest.csv` and `poster_manifest.json` provide each poster's precise send time in Asia/Kolkata and UTC plus a SHA-256 checksum.
- `Ammu_45_Posters_Contact_Sheet.jpg` is a preview of the whole collection.
- `Slap_Ashu_Fix_Antigravity_Prompt.md` explains how to implement the missing game in the currently connected GitHub repository.

## Email usage
Select **one** file by its countdown milestone. For example `12_hours_left.jpg` at **2026-11-16 12:00 IST**. `24_hours_left.jpg` is **the same event** as `1 day left` and must not be sent twice. The birthday unlock is **2026-11-17 00:00 IST**.

Do not send expired milestones late, and do not claim a send succeeded without a provider response. Obtain the recipient's explicit opt-in and respect unsubscribe preferences, especially for hourly and minute notifications. Use a reliable server-side scheduler and verified Resend sender; no messages are automatically sent by this archive.

## Notes about visual assets
The new final-hour/minute posters were cropped from previously generated multi-poster artwork sheets, then placed on separate email-portrait canvases with milestone labels. Some generated images stylise Ammu's appearance; they are **not guaranteed to match her real face precisely**. Inspect each image before sending.

## Website integration
Copy these images into your website's `public/assets/countdown/` or a dedicated `public/assets/countdown/final/` subfolder. Map the file paths using `poster_manifest.json`; do not overwrite the original production posters without visual review.
