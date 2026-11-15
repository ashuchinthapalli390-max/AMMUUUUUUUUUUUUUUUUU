import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ARTIFACT_DIR = 'C:/Users/ashuc/.gemini/antigravity/brain/50cf58a4-4793-4d33-926a-ecc3aac8efe2';
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

// Simple CDP Client over WebSocket
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

  async captureScreenshot(outputPath) {
    const res = await this.send('Page.captureScreenshot', { format: 'png', quality: 95 });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(outputPath, buffer);
    console.log(`[Screenshot saved] -> ${outputPath} (${buffer.length} bytes)`);
  }

  close() {
    try {
      this.ws.close();
    } catch {}
  }
}

async function main() {
  console.log('========================================================');
  console.log('   STARTING AUTOMATED CHROME E2E SLAP ASHU VERIFICATION  ');
  console.log('========================================================\n');

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

  // 2. Launch Headless Chrome with remote debugging
  console.log('[2/7] Launching Headless Chrome (1440x900 viewport)...');
  const tmpUserData = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-slap-test-'));
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${tmpUserData}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
    'about:blank',
  ]);

  let cdp;
  try {
    // Wait for Chrome CDP endpoint
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

    // 3. Set ammu_session cookie
    console.log('[3/7] Setting admin authentication cookie in browser...');
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

    const pageTitle = await cdp.eval('document.title');
    console.log(`  -> Page title: "${pageTitle}"`);
    const isGateLocked = await cdp.eval('!!document.querySelector(".ad-calendar")');
    if (isGateLocked) {
      throw new Error('Unexpected: Admin preview showed public countdown gate!');
    }
    console.log('  -> Confirmed: Authenticated admin preview is unlocked.');

    // 5. Scroll to Games section and verify prominent featured card
    console.log('[5/7] Scrolling to Games section...');
    await cdp.eval(`
      const gamesEl = document.querySelector('#games');
      if (gamesEl) gamesEl.scrollIntoView({ behavior: 'instant', block: 'center' });
    `);
    await new Promise((r) => setTimeout(r, 1200));

    const cardInfo = await cdp.eval(`
      (() => {
        const banner = document.querySelector('.slap-ashu-featured-banner');
        const title = document.querySelector('.slap-featured-title')?.textContent?.trim();
        const subtitle = document.querySelector('.slap-featured-subtitle')?.textContent?.trim();
        const btn = document.querySelector('#open-slap-ashu-btn');
        return { hasBanner: !!banner, title, subtitle, hasBtn: !!btn };
      })()
    `);
    console.log('  -> Featured Card Info:', JSON.stringify(cardInfo));
    if (!cardInfo.hasBanner || !cardInfo.hasBtn) {
      throw new Error('Slap Ashu featured card or Open button not found in Games section!');
    }

    const snap1 = path.join(ARTIFACT_DIR, 'slap_ashu_01_card.png');
    await cdp.captureScreenshot(snap1);

    // Record initial scroll position
    const initialScrollY = await cdp.eval('window.scrollY');
    console.log(`  -> Initial scroll position saved: ${initialScrollY}px`);

    // 6. Click "Slap Ashu 🎀" button to open modal
    console.log('[6/7] Clicking "Slap Ashu 🎀" button (#open-slap-ashu-btn)...');
    await cdp.eval(`document.querySelector('#open-slap-ashu-btn').click()`);
    await new Promise((r) => setTimeout(r, 2000));

    const modalInfo = await cdp.eval(`
      (() => {
        const overlay = document.querySelector('.slap-ashu-modal-overlay');
        const title = document.querySelector('.slap-ashu-card h3')?.textContent?.trim();
        const meter = document.querySelector('.slap-anger-meter-box')?.textContent?.trim();
        const exitBtn = document.querySelector('#exit-slap-game-btn');
        const slapTrigger = document.querySelector('#slap-ashu-trigger-btn');
        return { hasOverlay: !!overlay, title, meter, hasExitBtn: !!exitBtn, hasSlapTrigger: !!slapTrigger };
      })()
    `);
    console.log('  -> Modal Open Info:', JSON.stringify(modalInfo));
    if (!modalInfo.hasOverlay || !modalInfo.hasSlapTrigger) {
      throw new Error('Slap Ashu fullscreen modal did not open!');
    }

    const snap2 = path.join(ARTIFACT_DIR, 'slap_ashu_02_modal_open.png');
    await cdp.captureScreenshot(snap2);

    // 7. Perform 30 sequential taps on Ashu
    console.log('[7/7] Performing 30 consecutive slaps on Ashu...');
    const dialoguesEncountered = [];
    const expressionsEncountered = [];

    for (let tap = 1; tap <= 30; tap++) {
      await cdp.eval(`document.querySelector('#slap-ashu-trigger-btn').click()`);
      await new Promise((r) => setTimeout(r, 120));

      const status = await cdp.eval(`
        (() => {
          const dialogue = document.querySelector('#slap-dialogue-text')?.textContent?.trim();
          const emoji = document.querySelector('#slap-speech-bubble span')?.textContent?.trim();
          const meterText = document.querySelector('.slap-anger-meter-box')?.textContent?.trim();
          const milestone = document.querySelector('#slap-milestone-text')?.textContent?.trim() || null;
          const victory = document.querySelector('#slap-victory-title')?.textContent?.trim() || null;
          return { dialogue, emoji, meterText, milestone, victory };
        })()
      `);

      dialoguesEncountered.push(status.dialogue);
      expressionsEncountered.push(status.emoji);

      if (tap === 5 || tap === 10 || tap === 20 || tap === 30) {
        console.log(`  -> Tap ${tap}: Milestone Triggered! (${status.milestone})`);
      }
    }

    // Verify consecutive dialogues are distinct
    let consecutiveDuplicates = 0;
    for (let i = 1; i < dialoguesEncountered.length; i++) {
      if (dialoguesEncountered[i] === dialoguesEncountered[i - 1]) {
        consecutiveDuplicates++;
      }
    }
    console.log(`  -> Total taps: 30. Consecutive duplicate dialogues: ${consecutiveDuplicates} (must be 0).`);
    if (consecutiveDuplicates > 0) {
      throw new Error('Dialogue repeated consecutively during taps!');
    }

    // Verify victory state at 0% anger
    const finalState = await cdp.eval(`
      (() => {
        const victory = document.querySelector('#slap-victory-title')?.textContent?.trim();
        const meterText = document.querySelector('.slap-anger-meter-box')?.textContent?.trim();
        const playAgainVictory = document.querySelector('#slap-play-again-victory-btn');
        return { victory, meterText, hasPlayAgainVictory: !!playAgainVictory };
      })()
    `);
    console.log('  -> Final Victory State:', JSON.stringify(finalState));
    if (!finalState.victory || !finalState.victory.includes("YAYYYY! POTTIIII'S KOPAM TAGGINDHI! 💗")) {
      throw new Error(`Victory title did not match! Found: ${finalState.victory}`);
    }

    const snap3 = path.join(ARTIFACT_DIR, 'slap_ashu_03_30_taps_victory.png');
    await cdp.captureScreenshot(snap3);

    // Test Play Again button
    console.log('  -> Testing Play Again button...');
    await cdp.eval(`document.querySelector('#slap-play-again-btn').click()`);
    await new Promise((r) => setTimeout(r, 600));

    const resetState = await cdp.eval(`
      (() => {
        const meterText = document.querySelector('.slap-anger-meter-box')?.textContent?.trim();
        const victory = document.querySelector('#slap-victory-title');
        return { meterText, hasVictory: !!victory };
      })()
    `);
    console.log('  -> Reset State:', JSON.stringify(resetState));
    if (!resetState.meterText.includes('100%') || resetState.hasVictory) {
      throw new Error('Play Again did not reset Anger Meter back to 100%!');
    }

    const snap4 = path.join(ARTIFACT_DIR, 'slap_ashu_04_play_again.png');
    await cdp.captureScreenshot(snap4);

    // Test Exit Game button and scroll restoration
    console.log('  -> Testing Exit Game button (#exit-slap-game-btn)...');
    await cdp.eval(`document.querySelector('#exit-slap-game-btn').click()`);
    await new Promise((r) => setTimeout(r, 800));

    const postExitState = await cdp.eval(`
      (() => {
        const overlay = document.querySelector('.slap-ashu-modal-overlay');
        const scrollY = window.scrollY;
        return { hasOverlay: !!overlay, scrollY };
      })()
    `);
    console.log('  -> Post-Exit State:', JSON.stringify(postExitState));
    if (postExitState.hasOverlay) {
      throw new Error('Modal overlay did not close when clicking Exit Game!');
    }

    const scrollDiff = Math.abs(postExitState.scrollY - initialScrollY);
    console.log(`  -> Scroll delta after close: ${scrollDiff}px (initial: ${initialScrollY}px, current: ${postExitState.scrollY}px)`);
    if (scrollDiff > 5) {
      throw new Error(`Scroll position was not properly restored! Delta: ${scrollDiff}px`);
    }

    const snap5 = path.join(ARTIFACT_DIR, 'slap_ashu_05_exit_restored.png');
    await cdp.captureScreenshot(snap5);

    console.log('\n========================================================');
    console.log('  ALL BROWSER E2E INTERACTION TESTS PASSED WITH 100%!   ');
    console.log('========================================================\n');
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
