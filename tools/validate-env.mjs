/**
 * Environment Configuration Validator for Ammu Birthday Universe (v16)
 * Usage: node tools/validate-env.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const envFile = path.join(ROOT, '.env');

// Read .env if present
if (fs.existsSync(envFile)) {
  const content = fs.readFileSync(envFile, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && !Object.hasOwn(process.env, m[1])) {
      process.env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, '$2');
    }
  }
}

const warnings = [];
const errors = [];
const info = [];

// 1. Timezone Check
const tz = process.env.APP_TIMEZONE || process.env.EMAIL_DEFAULT_TIMEZONE || 'Asia/Kolkata';
try {
  Intl.DateTimeFormat(undefined, { timeZone: tz });
  info.push(`Timezone: ${tz} (Valid)`);
} catch (e) {
  errors.push(`Invalid APP_TIMEZONE: "${tz}". Must be valid IANA timezone like "Asia/Kolkata".`);
}

// 2. Birthday Unlock Timestamp
const unlockAt = process.env.BIRTHDAY_UNLOCK_AT || '2026-11-17T00:00:00+05:30';
const parsedDate = Date.parse(unlockAt);
if (Number.isNaN(parsedDate)) {
  errors.push(`Invalid BIRTHDAY_UNLOCK_AT: "${unlockAt}". Must be valid ISO-8601 string.`);
} else {
  info.push(`Birthday Unlock At: ${new Date(parsedDate).toISOString()} (Target: 2026-11-17 00:00:00 IST)`);
}

// 3. Celebration URL check
const celebrationUrl = process.env.CELEBRATION_URL || 'https://ammu-birthday-celebration-three.vercel.app';
try {
  new URL(celebrationUrl);
  info.push(`Celebration URL: ${celebrationUrl}`);
} catch {
  errors.push(`Invalid CELEBRATION_URL: "${celebrationUrl}".`);
}

// 4. Leak check: Secrets must NOT have VITE_ prefix
const secretKeys = ['SUPABASE_SERVICE_ROLE_KEY', 'ADMIN_PASSWORD', 'ADMIN_PASSWORD_HASH', 'ADMIN_SESSION_SECRET', 'SESSION_SECRET', 'RESEND_API_KEY', 'EMAIL_SCHEDULER_SECRET'];
for (const key of secretKeys) {
  if (process.env[`VITE_${key}`]) {
    errors.push(`SECURITY VIOLATION: "VITE_${key}" detected! Never expose server secrets to client Vite bundle.`);
  }
}

// 5. Database check
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  info.push(`Database: Supabase configured (${process.env.SUPABASE_URL})`);
} else if (process.env.DATABASE_URL) {
  info.push('Database: Postgres DATABASE_URL configured');
} else {
  warnings.push('Database: Neither Supabase nor DATABASE_URL configured. Using labeled local JSON persistence (data/db.json). NOT intended for serverless production without persistent disk.');
}

// 6. Resend Email check
const resendKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM;
const ammuEmail = process.env.AMMU_RECIPIENT_EMAIL || process.env.AMMU_EMAIL;
if (resendKey && fromEmail) {
  info.push(`Resend Email: Configured (From: ${fromEmail}, Recipient: ${ammuEmail || 'not set'})`);
} else {
  warnings.push('Resend Email: API key or Sender email missing. Emails will be logged to database in "not_configured" state. Website will function normally.');
}

// 7. Admin Session Secret
const secret = process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET;
if (!secret) {
  warnings.push('Admin Session: ADMIN_SESSION_SECRET not configured. A random ephemeral secret will be generated on startup.');
}

console.log('\n=========================================');
console.log('  AMMU BIRTHDAY V16 ENVIRONMENT REPORT   ');
console.log('=========================================\n');

info.forEach(i => console.log('✓ ' + i));

if (warnings.length) {
  console.log('\n[WARNINGS / LOCAL FALLBACKS]');
  warnings.forEach(w => console.log('! ' + w));
}

if (errors.length) {
  console.log('\n[CRITICAL ERRORS]');
  errors.forEach(e => console.error('✗ ' + e));
  console.log('\nValidation FAILED with errors.');
  process.exit(1);
} else {
  console.log('\nConfiguration validation PASSED.\n');
  process.exit(0);
}
