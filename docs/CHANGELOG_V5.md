# Birthday Website v5 — Ashu's Requested Improvements

This release updates the existing v4 React project. It is **not** a redesign from scratch and preserves the existing desktop look, approved portraits, content-management API, magazine, birthday ID, shop, games and birthday countdown.

## Experience & layout
- Removed the bottom chapter progress/"BIRTHDAY COVER" bar and hid the crowded top navigation. The top is now the animated dedication: **TO MY LOVELYYYY BUDDIEEEEE POTTIIIIIIIIIIIII • FROM ASHUUUUUUU ♡**.
- Removed the bottom-right `Flowers + Liquid` toggle. Cursor flowers, stars and hearts are permanently enabled for fine pointers (automatically reduced for accessibility where the OS prefers reduced motion).
- Mouse wheel input now turns a **single current page or scene** through GSAP, with a cooldown instead of scrolling freely into later sections; PageUp/PageDown and floating side navigation remain.
- The scrapbook's white-liquid surface is no longer labelled "Move your mouse". It shows **About Our Journey** and keeps a fully framed photo behind the liquid paper. Moving the pointer reveals it automatically. The Polaroid memory collection follows as the next part of the page.
- Additional staged flower, paper and photo reveal animations throughout.

## ID and secret page
- The back of the ID card has corrected readable 3D flip faces.
- It now includes a **generated QR** linking to `/my-lovely-ammu` **at the exact origin where the website is deployed**.
- The QR also appears in the downloaded card back PNG if the QR image has loaded.
- The secret page has a large portrait in her black embroidered outfit with glasses and your personal message; it cannot be opened from another device using a localhost QR. Deploy the website to HTTPS before scanning from a phone.

## Cake
- Kept the actual Three.js cake studio.
- Fixed the malformed wedge geometry: both radial cut faces are rendered, decorations are filtered around the opening, and the wedge moves out as a single 3D section with distinct sponge, jam, cream and frosting layers.
- The slice moves onto a porcelain-style plate according to the chosen recipient. Visual appearance depends on GPU/driver and still needs a Chrome/3D QA pass.

## Gifts
- The three gift experiences have staggered entrances instead of one abrupt reveal.
- Gift One now has large luxury-themed local SVG illustrations, **one flip-card gift at a time**. The funny message appears on the reverse after `Claim`, without "Reality Check" written on the front.
- Gift Two has a procedurally animated Three.js gift box, staggered voucher cards, and a final portrait-bearing secret coupon card.
- `POTTI1703` stays hidden until the secret card is flipped and claimed. `Copy Code` and `Start Shopping` are locked until their prerequisite step. Coupon progress persists on the browser.
- The lifetime-support invitation includes a friendly optional Tenglish decline message; declining never traps the visitor.

## Guided shopping
- Changed intro button to **Start Shopping**.
- Future categories are hidden until the current category is completed; only past/current categories appear.
- Picking a product automatically opens an illustrated packing scene with a **real procedural Three.js cardboard-style gift box**, whose lid closes. Product images fold or fall inside, followed by a fly-to-cart effect. Then the next category opens automatically.
- Optional rings and vaddanam can be skipped; required categories have no skip action.
- The existing gift-request/cart logic, symbolic hugs/smiles prices and birthday coupon have been retained. These are **requests**, not actual online retailer purchases.

## New story and music
- Added the first meeting at the 24-hour hackathon, including seeing her laptop, and the lost-phone/Gmail/contact-label memory before CodeXa Girls.
- Added `A Beautiful Playlist For You` as a 21st story chapter, with Ammu's original black-outfit portrait, 6 editable song placeholders, controls and an admin editor.
- No MP3s are included; you can add your legally available files under `public/assets/music` and manage titles/paths through Ashu's Studio.

## Still requires setup / verification
- First `npm install` needs internet. Vite production build couldn't run in the authoring environment because registry.npmjs.org was unreachable.
- Proper browser interaction tests are still needed: QR scanning after HTTPS deployment, Three.js slicing across various GPUs, gift-box and shopping animation sequence, mobile layout, and server email/OTP end-to-end delivery.
- Email notification and OTP require valid provider credentials and configured recipient email addresses in `config.local.json`. The project does not include these secrets or claim messages were sent.
