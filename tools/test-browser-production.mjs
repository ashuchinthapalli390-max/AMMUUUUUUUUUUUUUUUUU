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

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
  }

  close() {
    this.ws.close();
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runBrowserQASuite() {
  console.log('\n================================================================');
  console.log('   STARTING CHROME HEADLESS VISUAL & INTERACTIVE QA AUDIT       ');
  console.log('================================================================\n');

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-qa-prod-'));
  const DEBUG_PORT = 9333;

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
    console.log('Connected to Chrome DevTools Protocol successfully.');

    const cdp = new CDPClient(wsUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    const consoleErrors = [];
    cdp.ws.addEventListener('message', (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.method === 'Runtime.consoleAPICalled' && data.params?.type === 'error') {
          consoleErrors.push(data.params.args?.map(a => a.value || a.description).join(' '));
        }
      } catch {}
    });

    // -------------------------------------------------------------
    // TEST 1: DESKTOP 1440x900 FRONTDOOR CURTAIN
    // -------------------------------------------------------------
    console.log('\n[1/6] Testing Desktop 1440x900 - Frontdoor Curtain...');
    await cdp.setViewport(1440, 900);
    await cdp.send('Page.navigate', { url: BASE_URL });
    await sleep(2500);

    // Verify NO preview buttons on screen
    const previewBtnCount1 = await cdp.eval(`
      document.querySelectorAll('button').length;
    `);
    const previewTexts1 = await cdp.eval(`
      Array.from(document.querySelectorAll('button, a')).map(el => el.textContent.trim()).filter(t => /preview/i.test(t));
    `);
    console.log('  -> Elements matching "preview":', JSON.stringify(previewTexts1));
    if (previewTexts1.length > 0) {
      throw new Error(`Unexpected preview controls found: ${JSON.stringify(previewTexts1)}`);
    }

    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, 'prod_01_frontdoor_curtain_1440.png'));

    // -------------------------------------------------------------
    // TEST 2: GODDESS CALENDAR (1440x900)
    // -------------------------------------------------------------
    console.log('\n[2/6] Testing Goddess Calendar...');
    await cdp.eval(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Open Our Little Calendar'));
      if (btn) btn.click();
    })()`);
    await sleep(1500);

    const previewTexts2 = await cdp.eval(`(() => {
      return Array.from(document.querySelectorAll('button, a')).map(el => el.textContent.trim()).filter(t => /preview/i.test(t));
    })()`);
    console.log('  -> Elements matching "preview" in Calendar:', JSON.stringify(previewTexts2));
    if (previewTexts2.length > 0) {
      throw new Error(`Unexpected preview controls found in Calendar: ${JSON.stringify(previewTexts2)}`);
    }

    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, 'prod_02_frontdoor_calendar_1440.png'));

    // -------------------------------------------------------------
    // TEST 3: VELVET COUNTDOWN GATE (1440x900)
    // -------------------------------------------------------------
    console.log('\n[3/6] Testing Velvet Countdown...');
    await cdp.eval(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Visit The Velvet Countdown'));
      if (btn) btn.click();
    })()`);
    await sleep(1500);

    const countdownText = await cdp.eval(`(() => {
      return document.querySelector('.ad-lock-caption')?.textContent || '';
    })()`);
    console.log('  -> Lock caption:', countdownText);
    const previewTexts3 = await cdp.eval(`(() => {
      return Array.from(document.querySelectorAll('button, a')).map(el => el.textContent.trim()).filter(t => /preview/i.test(t));
    })()`);
    console.log('  -> Elements matching "preview" in Countdown:', JSON.stringify(previewTexts3));
    if (previewTexts3.length > 0) {
      throw new Error(`Unexpected preview controls found in Countdown: ${JSON.stringify(previewTexts3)}`);
    }

    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, 'prod_03_frontdoor_countdown_1440.png'));

    // -------------------------------------------------------------
    // TEST 4: ASHU'S ADMIN LOGIN (/admin)
    // -------------------------------------------------------------
    console.log('\n[4/6] Testing Ashu\'s Studio Admin Login (/admin)...');
    await cdp.send('Page.navigate', { url: `${BASE_URL}/admin` });
    await sleep(1800);

    const pageTitle = await cdp.eval(`document.title`);
    console.log('  -> Admin page title:', pageTitle);
    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, 'prod_04_admin_login_1440.png'));

    // -------------------------------------------------------------
    // TEST 5: MOBILE VIEWPORT (390x844 iPhone)
    // -------------------------------------------------------------
    console.log('\n[5/6] Testing Mobile Responsiveness (390x844)...');
    await cdp.setViewport(390, 844);
    await cdp.send('Page.navigate', { url: BASE_URL });
    await sleep(2000);

    const hasHorizontalOverflow = await cdp.eval(`(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    })()`);
    console.log('  -> Mobile horizontal overflow:', hasHorizontalOverflow);

    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, 'prod_05_mobile_frontdoor_390.png'));

    // -------------------------------------------------------------
    // TEST 6: TABLET VIEWPORT (768x1024 iPad)
    // -------------------------------------------------------------
    console.log('\n[6/6] Testing Tablet Viewport (768x1024)...');
    await cdp.setViewport(768, 1024);
    await cdp.send('Page.navigate', { url: BASE_URL });
    await sleep(1500);

    await cdp.eval(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Open Our Little Calendar'));
      if (btn) btn.click();
    })()`);
    await sleep(1500);

    await cdp.captureScreenshot(path.join(ARTIFACT_DIR, 'prod_06_tablet_calendar_768.png'));

    console.log('\nConsole Error Summary:');
    if (consoleErrors.length === 0) {
      console.log('  -> 0 console errors detected across all tested viewports!');
    } else {
      console.log(`  -> Detected ${consoleErrors.length} console errors:`, consoleErrors);
    }

    cdp.close();
    console.log('\n================================================================');
    console.log('   ALL CHROME VISUAL & INTERACTION AUDITS COMPLETED!            ');
    console.log('================================================================\n');
  } finally {
    chromeProc.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

runBrowserQASuite().catch((err) => {
  console.error('\n[FATAL BROWSER QA ERROR]:', err);
  process.exit(1);
});
