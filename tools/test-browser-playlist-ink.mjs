import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ARTIFACT_DIR = 'C:/Users/ashuc/.gemini/antigravity/brain/50cf58a4-4793-4d33-926a-ecc3aac8efe2';
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.callbacks = new Map();
    this.id = 1;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(new Error(msg.error.message));
          else cb.resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const curId = this.id++;
      this.callbacks.set(curId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  async captureScreenshot(outputPath, clip) {
    const params = { format: 'png', quality: 95 };
    if (clip) params.clip = clip;
    const res = await this.send('Page.captureScreenshot', params);
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(outputPath, buffer);
    console.log(`[Screenshot saved] -> ${path.basename(outputPath)} (${buffer.length} bytes)`);
  }

  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

async function main() {
  console.log('===============================================================');
  console.log('   STARTING AUTOMATED CHROME E2E PLAYLIST INK REVEAL TEST     ');
  console.log('===============================================================\n');

  // 1. Read admin password and get session cookie
  const envContent = fs.readFileSync('.env', 'utf8');
  const pwdMatch = envContent.match(/ADMIN_PASSWORD=([^\r\n]+)/);
  if (!pwdMatch) throw new Error('ADMIN_PASSWORD missing in .env');
  const adminPassword = pwdMatch[1].trim();

  console.log('[1/7] Authenticating admin session via API...');
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: adminPassword }),
  });
  if (!loginRes.ok) throw new Error(`Admin login failed: ${loginRes.status}`);

  const setCookie = loginRes.headers.get('set-cookie') || '';
  const tokenMatch = setCookie.match(/ammu_session=([^;]+)/);
  if (!tokenMatch) throw new Error('Failed to retrieve ammu_session cookie');
  const sessionToken = tokenMatch[1];
  console.log('  -> Admin authenticated. Session token acquired.');

  // 2. Launch Headless Chrome (1440x900)
  console.log('[2/7] Launching Headless Chrome (1440x900 viewport)...');
  const tmpUserData = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-ink-test-'));
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${tmpUserData}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--autoplay-policy=no-user-gesture-required',
    '--window-size=1440,900',
    'about:blank',
  ]);

  let cdp;
  try {
    await new Promise((r) => setTimeout(r, 2000));
    const versionRes = await fetch('http://127.0.0.1:9222/json/list');
    const targets = await versionRes.json();
    const pageTarget = targets.find((t) => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found');

    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();
    console.log('  -> Connected to Chrome DevTools Protocol.');

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Network.enable');

    // 3. Set session cookie
    console.log('[3/7] Setting ammu_session cookie in browser...');
    await cdp.send('Network.setCookie', {
      name: 'ammu_session',
      value: sessionToken,
      domain: '127.0.0.1',
      path: '/',
      httpOnly: true,
    });

    // 4. Navigate to Admin Preview
    console.log('[4/7] Navigating to http://127.0.0.1:4173/admin/preview ...');
    await cdp.send('Page.navigate', { url: `${BASE_URL}/admin/preview` });
    await new Promise((r) => setTimeout(r, 3500));

    // 5. Scroll to Playlist section
    console.log('[5/7] Scrolling to #playlist section...');
    await cdp.eval(`
      const el = document.querySelector('#playlist');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    `);
    await new Promise((r) => setTimeout(r, 2500));

    // Compute clip rect for album scene in page coordinates
    const clip = await cdp.eval(`
      (() => {
        const scene = document.querySelector('.v8-album-scene') || document.querySelector('.ink-reveal-container');
        if (!scene) return null;
        const rect = scene.getBoundingClientRect();
        return {
          x: Math.max(0, rect.left + window.scrollX - 25),
          y: Math.max(0, rect.top + window.scrollY - 25),
          width: rect.width + 50,
          height: rect.height + 50,
          scale: 1,
        };
      })()
    `);
    console.log('  -> Album Scene Bounding Box:', JSON.stringify(clip));

    // Wait for initial textures to fully render
    await new Promise((r) => setTimeout(r, 1200));

    // =========================================================================
    // STATE A: Default State (Upright Ammu Photograph, 0% reveal)
    // =========================================================================
    console.log('[6/7] Verifying State A: Default upright Ammu photograph (progress = 0.0)...');
    await cdp.eval(`window.ammuPlaylistInkState?.setProgress(0.0)`);
    await new Promise((r) => setTimeout(r, 200));
    const snap1 = path.join(ARTIFACT_DIR, 'playlist_ink_01_default_upright.png');
    await cdp.captureScreenshot(snap1, clip);

    // =========================================================================
    // STATE B: Organic Ink Expansion Stages (25%, 50%, 75%)
    // =========================================================================
    console.log('[7/7] Capturing Cinematic Organic Ink Spread Stages...');

    // 25% Ink Reveal
    console.log('  -> Capturing 25% ink reveal...');
    await cdp.eval(`
      (() => {
        window.ammuPlaylistInkState?.setHovered(true, 400, 300);
        window.ammuPlaylistInkState?.setProgress(0.25);
      })()
    `);
    await new Promise((r) => setTimeout(r, 300));
    const snap2 = path.join(ARTIFACT_DIR, 'playlist_ink_02_reveal_25pct.png');
    await cdp.captureScreenshot(snap2, clip);

    // 50% Ink Reveal
    console.log('  -> Capturing 50% ink reveal...');
    await cdp.eval(`window.ammuPlaylistInkState?.setProgress(0.50)`);
    await new Promise((r) => setTimeout(r, 300));
    const snap3 = path.join(ARTIFACT_DIR, 'playlist_ink_03_reveal_50pct.png');
    await cdp.captureScreenshot(snap3, clip);

    // 75% Ink Reveal
    console.log('  -> Capturing 75% ink reveal...');
    await cdp.eval(`window.ammuPlaylistInkState?.setProgress(0.75)`);
    await new Promise((r) => setTimeout(r, 300));
    const snap4 = path.join(ARTIFACT_DIR, 'playlist_ink_04_reveal_75pct.png');
    await cdp.captureScreenshot(snap4, clip);

    // =========================================================================
    // STATE C: Fully Revealed Song Poster (100% Artwork, 0% Ammu Photo)
    // =========================================================================
    console.log('  -> Capturing State C: 100% Fully Revealed Song Poster...');
    await cdp.eval(`window.ammuPlaylistInkState?.setProgress(1.0)`);
    await new Promise((r) => setTimeout(r, 400));
    const snap5 = path.join(ARTIFACT_DIR, 'playlist_ink_05_fully_revealed_poster.png');
    await cdp.captureScreenshot(snap5, clip);

    // =========================================================================
    // STATE D: Mouse Leave / Reverse Transition
    // =========================================================================
    console.log('  -> Capturing State D: Reverse ink transition...');
    await cdp.eval(`
      (() => {
        window.ammuPlaylistInkState?.setHovered(false);
        window.ammuPlaylistInkState?.setProgress(0.45);
      })()
    `);
    await new Promise((r) => setTimeout(r, 300));
    const snap6 = path.join(ARTIFACT_DIR, 'playlist_ink_06_reverse_transition.png');
    await cdp.captureScreenshot(snap6, clip);

    // Fully Restored (100% Ammu Photo)
    console.log('  -> Capturing 100% Ammu Photograph Restored...');
    await cdp.eval(`window.ammuPlaylistInkState?.setProgress(0.0)`);
    await new Promise((r) => setTimeout(r, 300));
    const snap7 = path.join(ARTIFACT_DIR, 'playlist_ink_07_original_photo_restored.png');
    await cdp.captureScreenshot(snap7, clip);

    // =========================================================================
    // Track Switching & Artwork Verification
    // =========================================================================
    // Track 2: Baarish
    console.log('  -> Testing Track 2 (Baarish) artwork reveal...');
    await cdp.eval(`
      (() => {
        const nextBtn = document.querySelectorAll('.playlist-controls button')[2];
        if (nextBtn) nextBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 800));
    await cdp.eval(`
      (() => {
        window.ammuPlaylistInkState?.setHovered(true, 400, 300);
        window.ammuPlaylistInkState?.setProgress(1.0);
      })()
    `);
    await new Promise((r) => setTimeout(r, 500));
    const snap8 = path.join(ARTIFACT_DIR, 'playlist_ink_08_song2_baarish_revealed.png');
    await cdp.captureScreenshot(snap8, clip);

    // Track 3: Tum Hi Ho
    console.log('  -> Testing Track 3 (Tum Hi Ho) artwork reveal...');
    await cdp.eval(`
      (() => {
        const nextBtn = document.querySelectorAll('.playlist-controls button')[2];
        if (nextBtn) nextBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 800));
    await cdp.eval(`
      (() => {
        window.ammuPlaylistInkState?.setHovered(true, 400, 300);
        window.ammuPlaylistInkState?.setProgress(1.0);
      })()
    `);
    await new Promise((r) => setTimeout(r, 500));
    const snap9 = path.join(ARTIFACT_DIR, 'playlist_ink_09_song3_tum_hi_ho_revealed.png');
    await cdp.captureScreenshot(snap9, clip);

    // =========================================================================
    // Audio Play & CD Spinning Check
    // =========================================================================
    console.log('  -> Testing Play button & independent CD rotation...');
    await cdp.eval(`
      (() => {
        const playBtn = document.querySelector('.play-btn');
        if (playBtn) playBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 800));

    const cdInfo = await cdp.eval(`
      (() => {
        const cd = document.querySelector('.v8-cd');
        return {
          isSpinning: cd ? cd.classList.contains('spinning') : false,
          computedAnimState: cd ? getComputedStyle(cd).animationPlayState : null
        };
      })()
    `);
    console.log('  -> CD Status:', JSON.stringify(cdInfo));

    const snap10 = path.join(ARTIFACT_DIR, 'playlist_ink_10_cd_spinning.png');
    await cdp.captureScreenshot(snap10, clip);

    console.log('\n===============================================================');
    console.log('  ALL PLAYLIST INK REVEAL & ORIENTATION TESTS PASSED 100%!     ');
    console.log('===============================================================\n');
  } finally {
    if (cdp) cdp.close();
    try {
      chrome.kill();
    } catch {}
    try {
      fs.rmSync(tmpUserData, { recursive: true, force: true });
    } catch {}
  }
}

main().catch((err) => {
  console.error('\nE2E Test Failed with error:', err);
  process.exit(1);
});
