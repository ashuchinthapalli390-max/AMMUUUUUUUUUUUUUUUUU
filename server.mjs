/** Ammu Birthday World. Standalone Node API + compiled React asset hosting. Node >=20.19. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  COUNTDOWN_MILESTONES,
  renderEmailHtml,
  getJobIdempotencyKey,
  escapeHtml
} from './server/countdownEmailEngine.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));

// Optional, dependency-free .env support: no secrets are checked into the archive.
const envfile = path.join(ROOT, '.env');
if (fs.existsSync(envfile)) {
  for (const line of fs.readFileSync(envfile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !Object.hasOwn(process.env, m[1]) && m[2]) {
      process.env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, '$2');
    }
  }
}

const PUB = path.join(ROOT, 'public');
const DBPATH = path.join(ROOT, 'data/db.json');
const SITEPATH = path.join(ROOT, 'data/site.json');

const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '127.0.0.1';

const ENVFILE = path.join(ROOT, 'config.local.json');
let fileConfig = {};
try {
  fileConfig = JSON.parse(fs.readFileSync(ENVFILE, 'utf8'));
} catch {
  fileConfig = {
    ADMIN_PASSWORD: crypto.randomBytes(18).toString('base64url'),
    PREVIEW_CODE: crypto.randomBytes(9).toString('base64url'),
    SESSION_SECRET: crypto.randomBytes(32).toString('hex'),
    ASHU_EMAIL: '',
    AMMU_EMAIL: '',
    EMAIL_FROM: '',
    RESEND_API_KEY: '',
    DEMO_MODE: '0',
    COOKIE_SECURE: '0'
  };
  fs.writeFileSync(ENVFILE, JSON.stringify(fileConfig, null, 2), { mode: 0o600 });
}

const env = (k, def = '') => process.env[k] || fileConfig[k] || def;

// Environment variables with fallback support
const ADMIN_PASSWORD = env('ADMIN_PASSWORD');
const PREVIEW_CODE = env('PREVIEW_CODE');
const SECRET = env('ADMIN_SESSION_SECRET') || env('SESSION_SECRET', crypto.randomBytes(32).toString('hex'));

const ASHU_EMAIL = env('ASHU_NOTIFICATION_EMAIL') || env('ASHU_EMAIL');
const AMMU_EMAIL = env('AMMU_RECIPIENT_EMAIL') || env('AMMU_EMAIL');
const EMAIL_FROM = env('RESEND_FROM_EMAIL') || env('EMAIL_FROM') || '';
const RESEND_API_KEY = env('RESEND_API_KEY');

const APP_BASE_URL = (env('APP_BASE_URL') || env('PUBLIC_URL') || 'http://localhost:5173').replace(/\/$/, '');
const APP_TIMEZONE = env('APP_TIMEZONE') || env('EMAIL_DEFAULT_TIMEZONE') || 'Asia/Kolkata';
const BIRTHDAY_UNLOCK_AT = env('BIRTHDAY_UNLOCK_AT') || '2026-11-17T00:00:00+05:30';

const CELEBRATION_URL = env('CELEBRATION_URL') || 'https://ammu-birthday-celebration-three.vercel.app';
const CELEBRATION_ALLOWED_ORIGIN = env('CELEBRATION_ALLOWED_ORIGIN') || 'https://ammu-birthday-celebration-three.vercel.app';

let COUNTDOWN_EMAILS_ENABLED = env('COUNTDOWN_EMAILS_ENABLED', 'false') === 'true' || env('COUNTDOWN_EMAILS_ENABLED') === '1';
const EMAIL_DRY_RUN = env('EMAIL_DRY_RUN', 'true') === 'true' || env('EMAIL_DRY_RUN') === '1';
const SCHEDULER_SECRET = env('EMAIL_SCHEDULER_SECRET') || env('CRON_SECRET');
const LIVE_SHARING_ENABLED = env('LIVE_SHARING_ENABLED', 'true') === 'true' || env('LIVE_SHARING_ENABLED') === '1';
const PREVIEW_ENABLED = env('PREVIEW_ENABLED', 'true') === 'true' || env('PREVIEW_ENABLED') === '1';

const LOCAL_DEMO = env('DEMO_MODE', '0') === '1' && HOST === '127.0.0.1';

const readJson = p => JSON.parse(fs.readFileSync(p, 'utf8'));
let site = readJson(SITEPATH);
if (!site.birthdayDate) site.birthdayDate = BIRTHDAY_UNLOCK_AT;

let db = {
  orders: [],
  wishes: [],
  memberships: [],
  events: [],
  notifications: [],
  checkins: [],
  reminderLogs: [],
  countdownSubscriptions: [],
  countdownEmailJobs: [],
  countdownDeliveryLogs: [],
  liveSharingSessions: []
};

try {
  if (fs.existsSync(DBPATH)) {
    const loaded = readJson(DBPATH);
    db = { ...db, ...loaded };
  }
} catch {}

if (!Array.isArray(db.wishes)) db.wishes = [];
if (!Array.isArray(db.memberships)) db.memberships = [];
if (!Array.isArray(db.events)) db.events = [];
if (!Array.isArray(db.notifications)) db.notifications = [];
if (!Array.isArray(db.checkins)) db.checkins = [];
if (!Array.isArray(db.reminderLogs)) db.reminderLogs = [];
if (!Array.isArray(db.countdownSubscriptions)) db.countdownSubscriptions = [];
if (!Array.isArray(db.countdownEmailJobs)) db.countdownEmailJobs = [];
if (!Array.isArray(db.countdownDeliveryLogs)) db.countdownDeliveryLogs = [];
if (!Array.isArray(db.liveSharingSessions)) db.liveSharingSessions = [];

// Seed default Ammu subscription if not present and email exists
if (AMMU_EMAIL && !db.countdownSubscriptions.some(s => s.email.toLowerCase() === AMMU_EMAIL.toLowerCase())) {
  db.countdownSubscriptions.push({
    id: crypto.randomUUID(),
    email: AMMU_EMAIL,
    recipientName: 'Ammu',
    tier: 'all_hourly_and_minute',
    isActive: true,
    optedInAt: new Date().toISOString(),
    unsubscribeToken: crypto.randomBytes(16).toString('hex'),
    createdAt: new Date().toISOString()
  });
}

const birthdayStart = '2026-10-26';
const birthdayEnd = '2026-11-17';

function istDay(t = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date(t));
  const v = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return `${v.year}-${v.month}-${v.day}`;
}

function ensureVisitor(req, res) {
  const token = cookies(req).ammu_visitor;
  const valid = token ? verify(token) : null;
  if (valid?.role === 'visitor' && valid.id) return valid.id;
  const id = crypto.randomUUID();
  const signed = sign({ role: 'visitor', id, exp: Date.now() + 365 * 86400000 });
  res.setHeader('Set-Cookie', `ammu_visitor=${signed}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000; ${env('COOKIE_SECURE') === '1' ? 'Secure; ' : ''}`);
  return id;
}

const writeAtomic = (p, v) => {
  const temp = p + '.' + crypto.randomUUID() + '.tmp';
  fs.writeFileSync(temp, JSON.stringify(v, null, 2), 'utf8');
  fs.renameSync(temp, p);
};

const saveDB = () => writeAtomic(DBPATH, db);
const saveSite = () => writeAtomic(SITEPATH, site);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg'
};

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(body);
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = [], size = 0;
    req.on('data', c => {
      size += c.length;
      if (size > 7e6) {
        reject(Object.assign(new Error('Payload too large'), { status: 413 }));
        req.destroy();
      } else {
        chunks.push(c);
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(Object.assign(new Error('Invalid JSON'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function cookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || '').split(';').filter(Boolean).map(x => {
      const i = x.indexOf('=');
      return [x.slice(0, i).trim(), decodeURIComponent(x.slice(i + 1))];
    })
  );
}

function sign(payload) {
  const value = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return value + '.' + crypto.createHmac('sha256', SECRET).update(value).digest('base64url');
}

function verify(value) {
  try {
    const [p, s] = value.split('.');
    const expected = crypto.createHmac('sha256', SECRET).update(p).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected))) return null;
    const obj = JSON.parse(Buffer.from(p, 'base64url').toString());
    return obj.exp > Date.now() ? obj : null;
  } catch {
    return null;
  }
}

function session(req) {
  return verify(cookies(req).ammu_session || '');
}

function attachSession(res, role) {
  const token = sign({ role, exp: Date.now() + 1000 * 60 * 60 * (role === 'admin' ? 12 : 72) });
  res.setHeader('Set-Cookie', `ammu_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${role === 'admin' ? 43200 : 259200}; ${env('COOKIE_SECURE') === '1' ? 'Secure; ' : ''}`);
}

function isOpen(req) {
  const unlockInstant = Date.parse(BIRTHDAY_UNLOCK_AT || site.birthdayDate);
  const now = Date.now();
  // Server-verified automatic unlock at midnight
  if (now >= unlockInstant) return true;
  if (LOCAL_DEMO) return true;
  // Authenticated admin or preview session can access preview
  if (['admin', 'preview'].includes(session(req)?.role)) return true;
  return false;
}

function admin(req) {
  return session(req)?.role === 'admin';
}

const error = (status, message) => Object.assign(new Error(message), { status });
const attempts = new Map();
function throttle(req, key, limit = 25, interval = 60000) {
  const ip = req.socket.remoteAddress || 'anon';
  const id = ip + '|' + key;
  const t = Date.now();
  let a = attempts.get(id) || [];
  a = a.filter(x => x > t - interval);
  if (a.length >= limit) throw error(429, 'Too many attempts. Please try again later.');
  a.push(t);
  attempts.set(id, a);
}

function cleanStr(v, max = 1500) {
  return String(v ?? '').trim().slice(0, max);
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return;
  const host = req.headers.host;
  if (new URL(origin).host !== host) throw error(403, 'Cross-origin request blocked');
}

function limitedData() {
  return {
    birthdayDate: BIRTHDAY_UNLOCK_AT || site.birthdayDate,
    serverTime: new Date().toISOString(),
    open: false,
    localDemo: LOCAL_DEMO,
    heroImage: null
  };
}

function logEvent(type, detail = {}) {
  db.events.unshift({ id: crypto.randomUUID(), type, detail, createdAt: new Date().toISOString() });
  db.events = db.events.slice(0, 500);
}

async function mail(to, subject, html) {
  const entry = {
    id: crypto.randomUUID(),
    to: to || '(unconfigured)',
    subject,
    status: 'pending',
    at: new Date().toISOString()
  };
  db.notifications.unshift(entry);
  db.notifications = db.notifications.slice(0, 500);

  if (!to || !RESEND_API_KEY || !EMAIL_FROM) {
    entry.status = 'not_configured';
    return false;
  }

  try {
    const body = { from: EMAIL_FROM, to: [to], subject, html };
    if (env('RESEND_REPLY_TO_EMAIL')) body.reply_to = [env('RESEND_REPLY_TO_EMAIL')];
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      throw new Error(`Email provider status ${resp.status}: ${errText.slice(0, 150)}`);
    }
    const data = await resp.json().catch(() => ({}));
    entry.status = 'sent';
    entry.resendId = data.id;
    return true;
  } catch (e) {
    entry.status = 'failed';
    entry.error = String(e.message).slice(0, 200);
    return false;
  }
}

const emailHtml = (title, body) =>
  `<div style="font-family:Georgia,serif;background:#fff4f7;padding:30px;color:#673148"><h1>${escapeHtml(title)}</h1>${body}</div>`;

const shortId = () => Math.random().toString(36).slice(2, 5).toUpperCase() + Date.now().toString(36).toUpperCase().slice(-7);

// Process countdown jobs (called by cron or internal scheduler)
export async function runCountdownEmailJobs(isManual = false) {
  if (!COUNTDOWN_EMAILS_ENABLED && !isManual) {
    return { ok: true, skipped: 'campaign_disabled' };
  }

  const now = Date.now();
  const results = [];

  for (const milestone of COUNTDOWN_MILESTONES) {
    const targetMs = Date.parse(milestone.targetIST);
    // Tolerance: within 15 minutes before or up to 60 minutes after target (or critical unlock)
    const isDue = (now >= targetMs && (now - targetMs) < 60 * 60 * 1000) ||
                  (milestone.isCritical && now >= targetMs);

    if (!isDue) continue;

    for (const sub of db.countdownSubscriptions) {
      if (!sub.isActive) continue;

      // Filter by subscription tier
      if (sub.tier === 'daily' && milestone.tierRequired !== 'daily') continue;
      if (sub.tier === 'major' && milestone.tierRequired === 'all_hourly_and_minute') continue;

      const idempotencyKey = getJobIdempotencyKey(milestone.id, sub.email);

      // Check if already sent or processing
      let job = db.countdownEmailJobs.find(j => j.idempotencyKey === idempotencyKey);
      if (job && (job.status === 'sent' || job.status === 'processing')) {
        continue;
      }

      if (!job) {
        job = {
          id: crypto.randomUUID(),
          idempotencyKey,
          milestoneId: milestone.id,
          recipientEmail: sub.email,
          scheduledFor: milestone.targetIST,
          status: 'pending',
          attemptCount: 0,
          createdAt: new Date().toISOString()
        };
        db.countdownEmailJobs.push(job);
      }

      job.status = 'processing';
      job.attemptCount++;
      job.lockedAt = new Date().toISOString();

      const html = renderEmailHtml({
        milestone,
        recipientEmail: sub.email,
        baseUrl: APP_BASE_URL,
        unsubscribeToken: sub.unsubscribeToken
      });

      if (EMAIL_DRY_RUN) {
        job.status = 'sent';
        job.sentAt = new Date().toISOString();
        job.dryRun = true;
        db.countdownDeliveryLogs.unshift({
          id: crypto.randomUUID(),
          recipientEmail: sub.email,
          milestoneId: milestone.id,
          status: 'dry_run_success',
          loggedAt: new Date().toISOString()
        });
        results.push({ email: sub.email, milestone: milestone.id, status: 'dry_run_simulated' });
        continue;
      }

      try {
        const sent = await mail(sub.email, milestone.subject, html);
        if (sent) {
          job.status = 'sent';
          job.sentAt = new Date().toISOString();
          results.push({ email: sub.email, milestone: milestone.id, status: 'sent' });
        } else {
          job.status = 'failed';
          job.lastError = 'Provider failed or unconfigured';
          results.push({ email: sub.email, milestone: milestone.id, status: 'failed' });
        }
      } catch (err) {
        job.status = 'failed';
        job.lastError = String(err.message).slice(0, 200);
        results.push({ email: sub.email, milestone: milestone.id, status: 'failed', error: err.message });
      }
    }
  }

  saveDB();
  return { ok: true, processed: results.length, details: results };
}

async function api(req, res, pathname, url) {
  sameOrigin(req);
  const method = req.method;
  const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ? await getBody(req) : {};

  // 1. PUBLIC CHECK-IN
  if (pathname === '/api/checkin/status' && method === 'GET') {
    const visitor = ensureVisitor(req, res);
    const today = istDay();
    const checkedDates = db.checkins.filter(c => c.visitor === visitor).map(c => c.day);
    return send(res, 200, {
      today,
      serverTime: new Date().toISOString(),
      checkedToday: checkedDates.includes(today),
      checkedDates
    });
  }

  if (pathname === '/api/checkin' && method === 'POST') {
    throttle(req, 'checkin', 8, 3600000);
    const visitor = ensureVisitor(req, res);
    const day = istDay();
    if (day < birthdayStart || day > birthdayEnd) throw error(400, 'Daily check-in is outside the birthday calendar dates');
    if (db.checkins.some(c => c.visitor === visitor && c.day === day)) {
      return send(res, 200, { ok: true, alreadyCollected: true, day });
    }
    db.checkins.push({ visitor, day, createdAt: new Date().toISOString() });
    logEvent('checkin.completed', { day });
    saveDB();
    return send(res, 201, { ok: true, day, alreadyCollected: false });
  }

  // 2. CRON JOBS
  if (pathname === '/api/cron/countdown' && (method === 'POST' || method === 'GET')) {
    const authHeader = req.headers.authorization;
    if (SCHEDULER_SECRET && authHeader !== `Bearer ${SCHEDULER_SECRET}`) {
      throw error(401, 'Scheduler authentication token required');
    }
    const result = await runCountdownEmailJobs();
    return send(res, 200, result);
  }

  if (pathname === '/api/cron/daily' && method === 'POST') {
    const expected = SCHEDULER_SECRET;
    if (expected && req.headers.authorization !== `Bearer ${expected}`) {
      throw error(401, 'Cron authentication required');
    }
    return send(res, 200, { ok: true, processed: true });
  }

  // 3. PUBLIC BOOTSTRAP (Server-verified unlock + admin preview status)
  if (pathname === '/api/bootstrap' && method === 'GET') {
    const open = isOpen(req);
    const isAdmin = admin(req);
    return send(res, 200, open ? {
      ...site,
      open: true,
      serverTime: new Date().toISOString(),
      birthdayUnlockAt: BIRTHDAY_UNLOCK_AT,
      localDemo: LOCAL_DEMO,
      isAdmin,
      isAdminPreview: isAdmin,
      adminConfigured: !!ADMIN_PASSWORD,
      recipientConfigured: !!AMMU_EMAIL,
      emailConfigured: !!RESEND_API_KEY,
      celebrationUrl: CELEBRATION_URL,
      celebrationOrigin: CELEBRATION_ALLOWED_ORIGIN,
      liveSharingEnabled: LIVE_SHARING_ENABLED,
      countdownEnabled: COUNTDOWN_EMAILS_ENABLED
    } : {
      ...limitedData(),
      adminConfigured: !!ADMIN_PASSWORD,
      isAdmin,
      isAdminPreview: isAdmin
    });
  }

  // 4. FLYING LOVE NOTES (PUBLIC READ)
  if (pathname === '/api/flying-notes' && method === 'GET') {
    const notes = (site.flyingNotes || []).filter(n => n.isEnabled !== false);
    return send(res, 200, { notes });
  }

  // 5. HIDDEN COMPLIMENTS (PUBLIC READ)
  if (pathname === '/api/compliments' && method === 'GET') {
    const compliments = (site.hiddenCompliments || []).filter(c => c.isEnabled !== false);
    return send(res, 200, { compliments });
  }

  // 6. LIVE GIFT SHARING WITH ASHU
  if (pathname === '/api/live-sharing/status' && method === 'GET') {
    const giftId = cleanStr(url.searchParams.get('giftId') || 'gift-1', 40);
    const sessionItem = db.liveSharingSessions.find(s => s.giftId === giftId) || {
      giftId,
      ammuActive: false,
      ashuActive: false,
      stage: 0,
      claimed: false
    };
    return send(res, 200, {
      enabled: LIVE_SHARING_ENABLED,
      session: sessionItem,
      isAdmin: admin(req)
    });
  }

  if (pathname === '/api/live-sharing/action' && method === 'POST') {
    throttle(req, 'live_sharing', 60);
    const giftId = cleanStr(body.giftId || 'gift-1', 40);
    let s = db.liveSharingSessions.find(x => x.giftId === giftId);
    if (!s) {
      s = {
        id: crypto.randomUUID(),
        giftId,
        ammuActive: true,
        ashuActive: admin(req),
        stage: 0,
        claimed: false,
        createdAt: new Date().toISOString()
      };
      db.liveSharingSessions.push(s);
    }
    if (body.action === 'join') {
      if (admin(req)) s.ashuActive = true;
      else s.ammuActive = true;
    } else if (body.action === 'advance') {
      s.stage = Number(body.stage || s.stage + 1);
    } else if (body.action === 'claim') {
      s.claimed = true;
    } else if (body.action === 'leave') {
      if (admin(req)) s.ashuActive = false;
      else s.ammuActive = false;
    }
    s.lastHeartbeat = new Date().toISOString();
    saveDB();
    return send(res, 200, { ok: true, session: s });
  }

  // 7. COUNTDOWN OPT-IN & UNSUBSCRIBE
  if (pathname === '/api/preview' && method === 'POST') {
    throttle(req, 'preview', 20, 60000);
    const codeVal = cleanStr(body.code, 100);
    if (!PREVIEW_CODE || !codeVal || codeVal !== PREVIEW_CODE) {
      throw error(404, 'Public preview is not available');
    }
    attachSession(res, 'preview');
    logEvent('preview.unlocked');
    return send(res, 200, { ok: true, open: true });
  }

  if (pathname === '/api/preview' && method === 'GET') {
    const codeVal = cleanStr(url.searchParams.get('code') || url.searchParams.get('preview'), 100);
    if (!PREVIEW_CODE || !codeVal || codeVal !== PREVIEW_CODE) {
      throw error(404, 'Public preview is not available');
    }
    attachSession(res, 'preview');
    logEvent('preview.unlocked');
    res.writeHead(302, { Location: '/' });
    return res.end();
  }

  if (pathname === '/api/countdown/status' && method === 'GET') {
    const visitorEmail = AMMU_EMAIL || '';
    const sub = db.countdownSubscriptions.find(s => s.email.toLowerCase() === visitorEmail.toLowerCase());
    return send(res, 200, {
      enabled: COUNTDOWN_EMAILS_ENABLED,
      birthdayUnlockAt: BIRTHDAY_UNLOCK_AT,
      serverTime: new Date().toISOString(),
      isSubscribed: sub ? sub.isActive : false,
      tier: sub ? sub.tier : 'none',
      milestones: COUNTDOWN_MILESTONES.map(m => ({
        id: m.id,
        name: m.name,
        targetIST: m.targetIST,
        relativeLabel: m.relativeLabel,
        tierRequired: m.tierRequired,
        posterTheme: m.posterTheme
      }))
    });
  }

  if (pathname === '/api/countdown/subscribe' && method === 'POST') {
    throttle(req, 'countdown_sub', 10);
    const email = cleanStr(body.email || AMMU_EMAIL, 200).toLowerCase();
    const tier = ['daily', 'major', 'all_hourly_and_minute'].includes(body.tier) ? body.tier : 'major';
    if (!email || !email.includes('@')) throw error(400, 'Valid recipient email required');

    let sub = db.countdownSubscriptions.find(s => s.email.toLowerCase() === email);
    if (!sub) {
      sub = {
        id: crypto.randomUUID(),
        email,
        recipientName: cleanStr(body.name || 'Ammu', 60),
        tier,
        isActive: true,
        optedInAt: new Date().toISOString(),
        unsubscribeToken: crypto.randomBytes(16).toString('hex'),
        createdAt: new Date().toISOString()
      };
      db.countdownSubscriptions.push(sub);
    } else {
      sub.tier = tier;
      sub.isActive = true;
      sub.optedInAt = new Date().toISOString();
    }
    saveDB();
    return send(res, 200, { ok: true, tier: sub.tier, email: sub.email });
  }

  if (pathname === '/api/countdown/unsubscribe' && (method === 'GET' || method === 'POST')) {
    const token = cleanStr(url.searchParams.get('token') || body.token, 100);
    const sub = db.countdownSubscriptions.find(s => s.unsubscribeToken === token);
    if (sub) {
      sub.isActive = false;
      sub.unsubscribedAt = new Date().toISOString();
      saveDB();
      if (method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(`<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#fff5f8;padding:40px;color:#782649;text-align:center;"><h2>Preferences Updated</h2><p>You have been unsubscribed from countdown email letters. You can always re-enable them in the birthday universe.</p><p><a href="/" style="color:#a12d5d;font-weight:bold;">Return to Ammu's Birthday Universe</a></p></body></html>`);
      }
      return send(res, 200, { ok: true, unsubscribed: true });
    }
    if (method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(`<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#fff5f8;padding:40px;color:#782649;text-align:center;"><h2>Preferences Link Expired</h2><p><a href="/">Return to Ammu's Birthday Universe</a></p></body></html>`);
    }
    throw error(404, 'Invalid unsubscribe token');
  }

  // 8. ADMIN AUTHENTICATION
  if (pathname === '/api/admin/login' && method === 'POST') {
    throttle(req, 'admin_login', 6, 15 * 60000);
    if (!ADMIN_PASSWORD) throw error(503, 'Admin password is not configured.');
    const test = Buffer.from(cleanStr(body.password, 200));
    const expected = Buffer.from(ADMIN_PASSWORD);
    if (test.length !== expected.length || !crypto.timingSafeEqual(test, expected)) {
      throw error(401, 'Incorrect password');
    }
    attachSession(res, 'admin');
    logEvent('admin.login');
    saveDB();
    return send(res, 200, { ok: true });
  }

  if (pathname === '/api/admin/logout' && method === 'POST') {
    res.setHeader('Set-Cookie', 'ammu_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
    return send(res, 200, { ok: true });
  }

  if (pathname === '/api/admin/session' && method === 'GET') {
    return send(res, 200, {
      authenticated: admin(req),
      adminConfigured: !!ADMIN_PASSWORD,
      previewEnabled: PREVIEW_ENABLED
    });
  }

  // 9. PROTECTED ADMIN ROUTES
  if (pathname.startsWith('/api/admin/')) {
    if (!admin(req)) throw error(401, 'Admin login required');

    // Admin dashboard data
    if (pathname === '/api/admin/data' && method === 'GET') {
      return send(res, 200, {
        site,
        db: {
          ...db,
          orders: []
        },
        envSummary: {
          appBaseUrl: APP_BASE_URL,
          timezone: APP_TIMEZONE,
          countdownEmailsEnabled: COUNTDOWN_EMAILS_ENABLED,
          emailDryRun: EMAIL_DRY_RUN,
          celebrationUrl: CELEBRATION_URL,
          liveSharingEnabled: LIVE_SHARING_ENABLED,
          ashuEmail: ASHU_EMAIL,
          ammuEmail: AMMU_EMAIL,
          senderEmail: EMAIL_FROM
        }
      });
    }

    // Site configuration updates
    if (pathname === '/api/admin/site' && method === 'PUT') {
      const allowed = [
        'title', 'heroTitle', 'sender', 'nickname', 'heroImage', 'birthdayDate',
        'chapters', 'gallery', 'letters', 'wishesFromAshu', 'pranks', 'vouchers',
        'movies', 'stars', 'reasons', 'magazinePages', 'bestieCard', 'playlist',
        'flyingNotes', 'hiddenCompliments'
      ];
      for (const k of allowed) {
        if (body[k] !== undefined) {
          if ([
            'chapters', 'gallery', 'letters', 'wishesFromAshu', 'pranks', 'vouchers',
            'movies', 'stars', 'reasons', 'magazinePages', 'playlist', 'flyingNotes', 'hiddenCompliments'
          ].includes(k)) {
            if (!Array.isArray(body[k]) || body[k].length > 300) throw error(400, k + ' must be an array');
            site[k] = body[k];
          } else if (k === 'bestieCard') {
            const c = body[k];
            if (!c || typeof c !== 'object' || Array.isArray(c)) throw error(400, 'Invalid ID card settings');
            site[k] = {
              name: cleanStr(c.name, 100),
              nickname: cleanStr(c.nickname, 100),
              number: cleanStr(c.number, 40),
              photo: cleanStr(c.photo, 300),
              issuedBy: cleanStr(c.issuedBy, 100),
              perks: (Array.isArray(c.perks) ? c.perks.slice(0, 10) : []).map(x => cleanStr(x, 160))
            };
          } else {
            site[k] = cleanStr(body[k], 2000);
          }
        }
      }
      saveSite();
      logEvent('site.updated');
      saveDB();
      return send(res, 200, { ok: true });
    }

    // Countdown Studio Preview & Test
    if (pathname === '/api/admin/countdown/preview' && method === 'POST') {
      const milestoneId = cleanStr(body.milestoneId || '12-hours', 40);
      const milestone = COUNTDOWN_MILESTONES.find(m => m.id === milestoneId) || COUNTDOWN_MILESTONES[0];
      const html = renderEmailHtml({
        milestone,
        recipientEmail: AMMU_EMAIL || 'ammu@example.com',
        baseUrl: APP_BASE_URL,
        unsubscribeToken: 'preview-token',
        customMessage: body.message,
        customCompliment: body.compliment
      });
      return send(res, 200, { html, milestone });
    }

    if (pathname === '/api/admin/countdown/test' && method === 'POST') {
      if (!ASHU_EMAIL) throw error(400, 'Ashu notification email not configured (ASHU_NOTIFICATION_EMAIL)');
      const milestoneId = cleanStr(body.milestoneId || '24-hours', 40);
      const milestone = COUNTDOWN_MILESTONES.find(m => m.id === milestoneId) || COUNTDOWN_MILESTONES[0];
      const html = renderEmailHtml({
        milestone,
        recipientEmail: ASHU_EMAIL,
        baseUrl: APP_BASE_URL,
        unsubscribeToken: 'test-token',
        customMessage: body.message,
        customCompliment: body.compliment
      });
      const sent = await mail(ASHU_EMAIL, `[TEST PREVIEW] ${milestone.subject}`, html);
      return send(res, 200, { ok: sent, recipient: ASHU_EMAIL });
    }

    if (pathname === '/api/admin/countdown/toggle' && method === 'POST') {
      COUNTDOWN_EMAILS_ENABLED = !COUNTDOWN_EMAILS_ENABLED;
      logEvent('countdown.toggle', { enabled: COUNTDOWN_EMAILS_ENABLED });
      saveDB();
      return send(res, 200, { ok: true, enabled: COUNTDOWN_EMAILS_ENABLED });
    }

    // Upload asset
    if (pathname === '/api/admin/upload' && method === 'POST') {
      const bin = Buffer.from(cleanStr(body.base64, 6e6).replace(/^data:[^,]+,/, ''), 'base64');
      if (!bin.length || bin.length > 4e6) throw error(400, 'Image must be 4MB or less');
      const png = bin.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      const jpg = bin[0] === 255 && bin[1] === 216 && bin[2] === 255;
      if (!png && !jpg) throw error(400, 'Only JPG and PNG supported');
      const filename = crypto.randomUUID() + (png ? '.png' : '.jpg');
      fs.mkdirSync(path.join(PUB, 'assets/uploads'), { recursive: true });
      fs.writeFileSync(path.join(PUB, 'assets/uploads', filename), bin);
      return send(res, 200, { url: '/assets/uploads/' + filename });
    }
  }

  // 10. SHOPPING ROUTES PERMANENTLY REMOVED
  if (pathname.startsWith('/api/orders') || pathname.startsWith('/api/admin/orders')) {
    throw error(404, 'Shopping and order routes have been permanently removed.');
  }

  // 11. LOCKED BIRTHDAY CHECK
  if (!isOpen(req)) throw error(403, 'Birthday surprise is still locked until November 17, 00:00 IST');

  // 12. SURVIVING INTERACTIVE FEATURES
  if (pathname === '/api/wishes' && method === 'POST') {
    throttle(req, 'wishes', 6, 60 * 60000);
    const values = [body.wish1, body.wish2, body.wish3, body.change, body.improve].map(v => cleanStr(v, 1200));
    if (!values.some(Boolean)) throw error(400, 'Write at least one answer');
    const w = { id: shortId(), answers: values, createdAt: new Date().toISOString() };
    db.wishes.unshift(w);
    logEvent('wishes.submitted', { id: w.id });
    const html = emailHtml(
      'A little note from Ammu',
      values.map((t, i) => `<p><b>${['Wish 1', 'Wish 2', 'Wish 3', 'What to change', 'How to improve'][i]}:</b> ${escapeHtml(t) || '(skipped)'}</p>`).join('')
    );
    const emailed = await mail(ASHU_EMAIL, '💌 Three Little Wishes From Ammu', html);
    saveDB();
    return send(res, 201, { ok: true, id: w.id, saved: true, emailStatus: emailed ? 'sent' : 'pending_configuration' });
  }

  if (pathname === '/api/membership' && method === 'POST') {
    throttle(req, 'membership', 30);
    const id = cleanStr(body.id, 80);
    if (!site.vouchers.some(v => v.id === id)) throw error(400, 'Unknown voucher');
    db.memberships.push({ id: shortId(), voucher: id, claimedAt: new Date().toISOString() });
    await mail(ASHU_EMAIL, '💗 Pottiiiiiiii claimed a voucher', emailHtml('Voucher claimed!', `<p>${escapeHtml(id)}</p>`));
    saveDB();
    return send(res, 201, { ok: true });
  }

  throw error(404, 'API route not found');
}

function file(req, res, pathname) {
  let p = decodeURIComponent(pathname);
  if (p === '/' || p === '/index.html' || p === '/admin' || p === '/admin/' || p === '/my-lovely-ammu' || p === '/my-lovely-ammu/' || p === '/for-ammu' || p === '/for-ammu/') {
    p = '/index.html';
  }
  if (p.includes('..') || p.startsWith('/data/') || p.startsWith('/src/') || p.includes('config.local')) {
    return send(res, 403, { error: 'Forbidden' });
  }
  if ((p.startsWith('/assets/photos/') || p.startsWith('/assets/dream-gifts/') || p.startsWith('/assets/products/') || p.startsWith('/assets/music/') || p.startsWith('/assets/uploads/')) && !isOpen(req)) {
    return send(res, 403, { error: 'Locked until birthday' });
  }

  const built = path.join(ROOT, 'dist');
  const candidates = [...(fs.existsSync(path.join(built, 'index.html')) ? [built] : []), PUB];
  const filePath = candidates
    .map(dir => path.resolve(dir, '.' + p))
    .find(full => candidates.some(dir => full.startsWith(dir + path.sep)) && fs.existsSync(full) && fs.statSync(full).isFile());

  if (!filePath) {
    return send(res, 404, { error: 'Not found. Run npm run build for the React website.' });
  }

  res.writeHead(200, {
    'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream',
    'Cache-Control': p.startsWith('/assets/') ? 'public,max-age=3600' : 'no-cache',
    'X-Content-Type-Options': 'nosniff'
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, 'http://local');
    if (u.pathname.startsWith('/api/')) return await api(req, res, u.pathname, u);
    if (req.method !== 'GET' && req.method !== 'HEAD') throw error(405, 'Method not allowed');
    file(req, res, u.pathname);
  } catch (e) {
    if (!res.headersSent) {
      send(res, e.status || 500, {
        error: e.status ? e.message : 'Server error',
        detail: env('DEBUG') === '1' ? String(e.stack) : undefined
      });
    }
    if (!e.status) console.error(e);
  }
});

// Periodic in-process countdown checker (fires every minute if active)
setInterval(() => {
  if (COUNTDOWN_EMAILS_ENABLED) {
    runCountdownEmailJobs().catch(e => console.error('Countdown check error:', e.message));
  }
}, 60000);

server.listen(PORT, HOST, () => {
  console.log(`Ammu's Birthday Universe running at http://${HOST}:${PORT}`);
  console.log(`Local demo: ${LOCAL_DEMO ? 'enabled' : 'disabled'} | Admin: ${ADMIN_PASSWORD ? 'configured' : 'not configured'} | Unlock: ${BIRTHDAY_UNLOCK_AT}`);
});

export { server, api };
