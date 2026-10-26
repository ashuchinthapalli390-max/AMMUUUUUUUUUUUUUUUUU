# Ammuuuu Birthday React v5 — Read This First 💗

This source package preserves the earlier React project and adds the requested scroll-to-page animation, dedication header, liquid paper-photo reveal, ID-card QR, improved Three.js cake cutting, interactive gifts, packing and guided shopping, editable playlist, and more memories.

## Start on Windows

1. Extract the ZIP into an ordinary local folder.
2. Install Node.js 20.19+ or 22+.
3. Run `start-windows.bat` with an active internet connection on first setup. It installs React, Vite, Three.js, GSAP, Framer Motion and QRCode; don't skip dependencies.
4. Open `http://127.0.0.1:5173` in Chrome.
5. In the terminal's **first-run setup output**, find the admin password and preview code. **Do not share these publicly.**
6. Ashu's Studio: `http://127.0.0.1:5173/admin`.

## Try the site

- Use wheel up/down to turn a page (one transition at a time), or use the floating side arrows / PageUp / PageDown.
- Move the pointer over the scrapbook white paper. It temporarily reveals Ammu's photo without an on-screen instruction.
- Flip the ID card: the QR should link to `http://127.0.0.1:5173/my-lovely-ammu` on local desktop. A *phone cannot access that localhost address*. Deploy to HTTPS first to use phone scanning.
- The cake has separate states: choose decoration, wish, light/blow candles, drag twice to cut, then select who gets the first slice.
- Gift One reveals one dream gift at a time; Claim flips to the joke.
- Gift Two has vouchers and a hidden code behind the final coupon card. Claim, then **Copy Code** to enable **Start Shopping**.
- Guided shopping progresses earrings, necklaces, bracelets, bangles, optional rings/vaddanam, dresses, pants, slippers, shoes, toys and keychains. Picking a product animates it into a Three.js gift box and proceeds to the next category. Optional stages may be skipped.
- Use `POTTI1703` at cart checkout. Orders are gift requests, not purchases.

## Add Ammu's songs later

- Place your MP3 files at `public/assets/music/song-01.mp3` through `song-06.mp3` or add new tracks with their paths.
- Edit song title, artist, MP3 source path and cover photo through **Ashu's Studio → Birthday Playlist**.
- MP3 uploading via the browser is not yet built; copy files into the project folder. The initial tracks have *no sound until you supply MP3s*.
- No music autoplays without a user gesture.

## Before deploying

- Run `npm run check` and `npm run build` on a machine that can install npm dependencies.
- For production: `npm run build`, then `npm run start`, reverse proxy on HTTPS, set `DEMO_MODE=0` and `COOKIE_SECURE=1` and fill secret keys in `config.local.json`.
- To send real emails and delivery OTP, configure `RESEND_API_KEY`, `EMAIL_FROM`, `ASHU_EMAIL`, and `AMMU_EMAIL`. These are deliberately unset in the ZIP.
- Private guest messages, images, gift requests, and QR page should not be publicly indexed/shared without Ammu's permission.

## Source locations

- React scenes: `src/screens/`
- QR reveal page: `src/LoveReveal.jsx`
- React music player: `src/screens/SectionPlaylist.jsx`
- Three.js gift boxes: `src/ThreeGiftBox.jsx`
- Cursor effects: `src/CursorGarden.jsx`
- Cake slice geometry: `public/js/cake3d.js`
- Story/page controller: `public/js/experience.js`
- Gift/shop/cart/coupon logic: `public/js/app.js`
- ID card and magazine: `public/js/keepsakes.js`
- Content + editable song titles/paths: `data/site.json`
- Backend, wish submissions, delivery OTP and admin: `server.mjs`

## Test honesty

- **Passed:** local Node API request, project HTML/JS checks, 21 React scene host IDs, compiled asset file existence, ZIP integrity.
- **Not run here:** `npm install`, `npm run build` and cross-browser visual/3D animation tests. Registry DNS resolution failed during installation.
- If you see a visual or runtime bug, copy Chrome DevTools Console errors to the conversation; don't assume every flow was manually verified.
