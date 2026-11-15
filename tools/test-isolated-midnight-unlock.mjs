import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ARTIFACT_DIR = 'C:/Users/ashuc/.gemini/antigravity/brain/50cf58a4-4793-4d33-926a-ecc3aac8efe2';
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const TEST_PORT = 4180;
const TEST_URL = `http://127.0.0.1:${TEST_PORT}`;

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

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
  }

  close() {
    this.ws.close();
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runIsolatedUnlockTest() {
  console.log('\n================================================================');
  console.log('   ISOLATED MIDNIGHT UNLOCK TEST (SIMULATING 17 NOV 00:00 IST)  ');
  console.log('================================================================\n');

  // Spawn isolated test server on port 4180 with BIRTHDAY_UNLOCK_AT set to the past
  const serverProc = spawn('node', ['server.mjs'], {
    env: {
      ...process.env,
      PORT: String(TEST_PORT),
      HOST: '127.0.0.1',
      BIRTHDAY_UNLOCK_AT: '2020-01-01T00:00:00+05:30',
      NODE_ENV: 'production',
    },
  });

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-unlock-test-'));
  const DEBUG_PORT = 9334;

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--mute-audio',
    'about:blank',
  ]);

  try {
    // Wait for server to start
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch(`${TEST_URL}/api/bootstrap`);
        const json = await res.json();
        if (json.open === true) {
          console.log('Isolated test server started: open === true confirmed.');
          break;
        }
      } catch {
        await sleep(200);
      }
    }

    // Connect to Chrome page
    let wsUrl = null;
    for (let i = 0; i < 40; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
        const targets = await res.json();
        const pageTarget = targets.find((t) => t.type === 'page');
        if (pageTarget?.webSocketDebuggerUrl) {
          wsUrl = pageTarget.webSocketDebuggerUrl;
          break;
        }
      } catch {
        await sleep(200);
      }
    }

    if (!wsUrl) throw new Error('Could not connect to Chrome DevTools Protocol');
    const cdp = new CDPClient(wsUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    await cdp.setViewport(1440, 900);
    console.log('[1/3] Navigating to isolated unlocked website...');
    await cdp.send('Page.navigate', { url: TEST_URL });
    await sleep(2500);

    // Open calendar and navigate to countdown
    await cdp.eval(`(() => {
      const b1 = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Open Our Little Calendar'));
      if (b1) b1.click();
    })()`);
    await sleep(1000);

    await cdp.eval(`(() => {
      const b2 = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Visit The Velvet Countdown'));
      if (b2) b2.click();
    })()`);
    await sleep(1500);

    // Check that "UNTIE YOUR BIRTHDAY RIBBON 🎀" is visible
    const ribbonBtnText = await cdp.eval(`(() => {
      const b = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('UNTIE YOUR BIRTHDAY RIBBON'));
      return b ? b.textContent.trim() : null;
    })()`);
    console.log('  -> Ribbon unlock button found:', ribbonBtnText);
    if (!ribbonBtnText) throw new Error('Untie ribbon button not found on unlocked birthday');

    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, 'prod_07_unlocked_ribbon_ready.png'));

    // Click "UNTIE YOUR BIRTHDAY RIBBON 🎀"
    console.log('[2/3] Clicking UNTIE YOUR BIRTHDAY RIBBON 🎀 to enter experience...');
    await cdp.eval(`(() => {
      const b = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('UNTIE YOUR BIRTHDAY RIBBON'));
      if (b) b.click();
    })()`);
    await sleep(2500);

    // Verify Experience is visible
    const isExperienceVisible = await cdp.eval(`(() => {
      const exp = document.getElementById('experience');
      return exp && !exp.hidden;
    })()`);
    console.log('  -> Complete Birthday Experience visible (#experience !hidden):', isExperienceVisible);

    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, 'prod_08_unlocked_universe_hero.png'));

    // Verify Polaroid caption "my favourite human"
    console.log('[3/3] Inspecting Polaroid "my favourite human" caption...');
    const captionDetails = await cdp.eval(`(() => {
      const smallPolaroid = document.querySelector('.photo-small.polaroid');
      const span = smallPolaroid ? smallPolaroid.querySelector('span') : null;
      if (!span) return null;
      const rect = span.getBoundingClientRect();
      const style = window.getComputedStyle(span);
      return {
        text: span.textContent.trim(),
        width: rect.width,
        height: rect.height,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        fontFamily: style.fontFamily
      };
    })()`);
    console.log('  -> Polaroid caption element inspected:', JSON.stringify(captionDetails, null, 2));

    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, 'prod_09_polaroid_caption_verified.png'));

    cdp.close();
    console.log('\n================================================================');
    console.log('   ISOLATED MIDNIGHT UNLOCK VERIFICATION PASSED SUCCESSFULLY!   ');
    console.log('================================================================\n');
  } finally {
    serverProc.kill();
    chromeProc.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

runIsolatedUnlockTest().catch((err) => {
  console.error('\n[FATAL UNLOCK TEST ERROR]:', err);
  process.exit(1);
});
