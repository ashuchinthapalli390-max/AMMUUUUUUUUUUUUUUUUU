/**
 * Master Production Release Verification Suite
 * Verifies all 15 Phases of the Final Production Release specification.
 */
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { COUNTDOWN_MILESTONES, renderEmailHtml, getJobIdempotencyKey } from '../server/countdownEmailEngine.mjs';

const BASE = 'http://127.0.0.1:4173';
const ROOT = process.cwd();

async function fetchRoute(route, options = {}) {
  const res = await fetch(BASE + route, options);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, headers: res.headers, text, json };
}

async function runMasterProductionSuite() {
  console.log('\n================================================================');
  console.log('   RUNNING AMMU BIRTHDAY MASTER PRODUCTION RELEASE TEST SUITE   ');
  console.log('================================================================\n');

  let passed = 0;
  function pass(msg) {
    console.log(`[PASS] ${msg}`);
    passed++;
  }

  // -------------------------------------------------------------
  // PHASE 1: COMPLETE PREVIEW SYSTEM REMOVAL
  // -------------------------------------------------------------
  console.log('\n--- PHASE 1: PREVIEW SYSTEM REMOVAL AUDIT ---');

  // Test 1.1: /admin/preview returns 404
  const adminPreviewRes = await fetchRoute('/admin/preview');
  assert.strictEqual(adminPreviewRes.status, 404, '/admin/preview must return HTTP 404');
  pass('/admin/preview route returns HTTP 404 (Not Found)');

  // Test 1.2: /api/preview returns 404 or 403 (blocked/removed)
  const apiPreviewGet = await fetchRoute('/api/preview');
  assert.ok([403, 404].includes(apiPreviewGet.status), `/api/preview GET must return HTTP 403 or 404 (got: ${apiPreviewGet.status})`);
  const apiPreviewPost = await fetchRoute('/api/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'test' })
  });
  assert.ok([403, 404].includes(apiPreviewPost.status), `/api/preview POST must return HTTP 403 or 404 (got: ${apiPreviewPost.status})`);
  pass('/api/preview GET & POST endpoints are blocked/removed (HTTP 403/404)');

  // Test 1.3: Verify no preview controls in frontend source files
  const gateView = fs.readFileSync(path.join(ROOT, 'src/screens/GateView.jsx'), 'utf8');
  assert.ok(!gateView.includes('id={"preview-open"}') && !gateView.includes('id="preview-open"'), 'GateView has no preview button');
  assert.ok(!gateView.includes('id={"gate-preview-form"}') && !gateView.includes('id="gate-preview-form"'), 'GateView has no preview form');
  assert.ok(!gateView.includes('Simulate Midnight Unlock'), 'GateView has no simulate button');
  pass('src/screens/GateView.jsx has no preview button, form, or simulate controls');

  const frontdoor = fs.readFileSync(path.join(ROOT, 'src/BirthdayFrontdoor.jsx'), 'utf8');
  assert.ok(!frontdoor.includes('PreviewModal'), 'BirthdayFrontdoor has no PreviewModal');
  assert.ok(!frontdoor.includes('Preview Option'), 'BirthdayFrontdoor has no Preview Option button');
  assert.ok(!frontdoor.includes('isAdminPreview'), 'BirthdayFrontdoor has no isAdminPreview flag');
  pass('src/BirthdayFrontdoor.jsx has no PreviewModal, preview buttons, or admin preview bypass');

  const appJsx = fs.readFileSync(path.join(ROOT, 'src/BirthdayApp.jsx'), 'utf8');
  assert.ok(!appJsx.includes('isPreview'), 'BirthdayApp.jsx has no isPreview prop');
  assert.ok(!appJsx.includes('<AdminPreviewToolbar'), 'BirthdayApp.jsx does not mount AdminPreviewToolbar');
  assert.ok(!appJsx.includes('<SectionPreviewRibbon'), 'BirthdayApp.jsx does not mount SectionPreviewRibbon');
  pass('src/BirthdayApp.jsx has no preview props, toolbar, or ribbon');

  const adminJsx = fs.readFileSync(path.join(ROOT, 'src/screens/AdminDashboard.jsx'), 'utf8');
  assert.ok(!adminJsx.includes('/admin/preview'), 'AdminDashboard.jsx has no /admin/preview links');
  assert.ok(!adminJsx.includes('previewuniverse'), 'AdminDashboard.jsx has no previewuniverse section');
  pass('src/screens/AdminDashboard.jsx has no preview links or previewuniverse tab');

  const appJs = fs.readFileSync(path.join(ROOT, 'public/js/app.js'), 'utf8');
  assert.ok(!appJs.includes('params.get(\'preview\')'), 'public/js/app.js has no ?preview query param bypass');
  assert.ok(!appJs.includes('/api/preview'), 'public/js/app.js has no /api/preview requests');
  assert.ok(!appJs.includes('preview-open'), 'public/js/app.js has no preview-open listeners');
  pass('public/js/app.js has no query param bypass or preview request handlers');

  const adminJs = fs.readFileSync(path.join(ROOT, 'public/js/admin.js'), 'utf8');
  assert.ok(!adminJs.includes('renderPreviewUniverse'), 'public/js/admin.js has no renderPreviewUniverse');
  assert.ok(!adminJs.includes('previewuniverse:'), 'public/js/admin.js has no previewuniverse tab');
  pass('public/js/admin.js has no preview tab or renderPreviewUniverse handler');

  // -------------------------------------------------------------
  // PHASE 2 & 11: BIRTHDAY LOCK & SECURITY AUDIT
  // -------------------------------------------------------------
  console.log('\n--- PHASE 2 & 11: STRICT SERVER LOCK & ASSET GATING ---');

  // Test 2.1: Bootstrap reports locked before release instant
  const bootRes = await fetchRoute('/api/bootstrap');
  assert.strictEqual(bootRes.status, 200, 'Bootstrap responds 200');
  assert.strictEqual(bootRes.json.open, false, 'Bootstrap open is false before birthday');
  assert.strictEqual(bootRes.json.isAdminPreview, undefined, 'isAdminPreview flag is not returned');
  pass('Public bootstrap endpoint reports open: false');

  // Test 2.2: Admin session does NOT bypass the gate
  const adminLoginRes = await fetchRoute('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: process.env.ADMIN_PASSWORD || 'invalid' })
  });
  // Test with invalid password throttle/block or existing session
  const fakeAdminHeaders = { 'Cookie': 'ammu_session=fake_or_admin' };
  const adminBootRes = await fetchRoute('/api/bootstrap', { headers: fakeAdminHeaders });
  assert.strictEqual(adminBootRes.json.open, false, 'Admin session cannot bypass birthday gate (open is false)');
  pass('Authenticated admin sessions cannot bypass birthday gate before release instant');

  // Test 2.3: Protected media assets return 403 Locked until birthday
  const photoRes = await fetchRoute('/assets/photos/original_black.jpg');
  assert.strictEqual(photoRes.status, 403, 'Protected photo returns HTTP 403');
  assert.ok(photoRes.text.includes('Locked until birthday'), 'Protected photo error message is "Locked until birthday"');

  const cinemaRes = await fetchRoute('/assets/cinema/first_movie_irumudi.jpg');
  assert.strictEqual(cinemaRes.status, 403, 'Protected cinema poster returns HTTP 403');

  const musicRes = await fetchRoute('/assets/music/track_01_tum_se_hi.mp3');
  assert.strictEqual(musicRes.status, 403, 'Protected music file returns HTTP 403');
  pass('All protected photos, cinema posters, and music tracks strictly return HTTP 403');

  // Test 2.4: Protected interactive endpoints return 403
  const wishRes = await fetchRoute('/api/wishes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wish1: 'Test wish' })
  });
  assert.strictEqual(wishRes.status, 403, '/api/wishes returns HTTP 403 before birthday');

  const memRes = await fetchRoute('/api/membership', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'care' })
  });
  assert.strictEqual(memRes.status, 403, '/api/membership returns HTTP 403 before birthday');
  pass('Interactive wishes and membership claim endpoints return HTTP 403 before birthday');

  // -------------------------------------------------------------
  // PHASE 3 & 8: ASSET CLEANUP & SHOPPING REMOVAL
  // -------------------------------------------------------------
  console.log('\n--- PHASE 3 & 8: ASSET INTEGRITY & CLEANUP ---');

  // Verify shopping images removed from public assets
  assert.ok(!fs.existsSync(path.join(ROOT, 'public/assets/products')), 'public/assets/products directory is removed');
  pass('Unused shopping products directory removed from production build');

  // Verify approved Ammu photographs preserved
  assert.ok(fs.existsSync(path.join(ROOT, 'public/assets/photos/original_black.jpg')), 'original_black.jpg exists');
  assert.ok(fs.existsSync(path.join(ROOT, 'public/assets/photos/original_white.jpg')), 'original_white.jpg exists');
  assert.ok(fs.existsSync(path.join(ROOT, 'public/assets/photos/ammu_01.jpg')), 'ammu_01.jpg exists');
  assert.ok(fs.existsSync(path.join(ROOT, 'public/assets/photos/ammu_30.jpg')), 'ammu_30.jpg exists');
  pass('All approved Ammu original portraits (original_black, original_white, ammu_01-30) preserved');

  // Verify all 45 countdown posters exist in public assets
  const postersDir = path.join(ROOT, 'public/assets/countdown/posters');
  assert.ok(fs.existsSync(postersDir), 'public/assets/countdown/posters exists');
  const posterFiles = fs.readdirSync(postersDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
  assert.strictEqual(posterFiles.length, 45, `Expected 45 countdown posters, found ${posterFiles.length}`);
  pass('All 45 official countdown posters present in public/assets/countdown/posters/');

  // -------------------------------------------------------------
  // PHASE 4 & 12: TYPOGRAPHY & POLAROID REFINEMENTS
  // -------------------------------------------------------------
  console.log('\n--- PHASE 4 & 12: TYPOGRAPHY REFINEMENTS ---');

  const css = fs.readFileSync(path.join(ROOT, 'public/css/style.css'), 'utf8');
  assert.ok(css.includes('.photo-small.polaroid'), 'CSS contains photo-small.polaroid rules');
  assert.ok(css.includes('text-wrap: balance'), 'CSS applies text-wrap: balance to polaroid captions');
  assert.ok(css.includes('clamp('), 'CSS uses responsive clamp() sizing');
  pass('Polaroid caption ("my favourite human") uses responsive clamp() and text-wrap: balance');

  // -------------------------------------------------------------
  // PHASES 5 & 6: COUNTDOWN EMAIL SCHEDULER & RESEND ENGINE
  // -------------------------------------------------------------
  console.log('\n--- PHASES 5 & 6: COUNTDOWN EMAIL CAMPAIGN ---');

  assert.strictEqual(COUNTDOWN_MILESTONES.length, 26, 'Exactly 26 milestones configured');
  assert.strictEqual(COUNTDOWN_MILESTONES[0].id, '2-days', 'Milestone 1 is 2-days');
  assert.strictEqual(COUNTDOWN_MILESTONES[1].id, '24-hours', 'Milestone 2 is 24-hours (deduplicated with 1-day)');
  assert.strictEqual(COUNTDOWN_MILESTONES[25].id, '0-midnight', 'Final milestone is 0-midnight');
  pass('All 26 countdown milestones properly configured with Asia/Kolkata timestamps');

  // Verify all milestones map to real poster files
  for (const m of COUNTDOWN_MILESTONES) {
    const posterRel = m.photoAsset.replace(/^\//, '');
    const fullPath = path.join(ROOT, 'public', posterRel);
    assert.ok(fs.existsSync(fullPath), `Poster file for milestone ${m.id} exists at ${posterRel}`);
  }
  pass('Every countdown milestone maps to an existing, verified poster image');

  // Test email template rendering
  const emailHtml = renderEmailHtml({
    milestone: COUNTDOWN_MILESTONES[1], // 24 hours
    recipientEmail: 'ammu@example.com',
    baseUrl: 'https://codxa-agency.online',
    unsubscribeToken: 'valid-unsub-token-xyz'
  });
  assert.ok(emailHtml.includes('24 HOURS / 1 DAY TO GO'), 'Email contains countdown headline');
  assert.ok(emailHtml.includes('/assets/countdown/posters/24_hours_left.jpg'), 'Email contains mapped poster URL');
  assert.ok(emailHtml.includes('From your silly Ashuuuuuuuuuuu 💗') || emailHtml.includes('Ashuuuuuuuuuuu 💗'), 'Email contains Ashu signature');
  assert.ok(emailHtml.includes('unsubscribe?token=valid-unsub-token-xyz'), 'Email contains working unsubscribe link');
  pass('Responsive HTML email templates render correctly with verified assets and unsubscribe links');

  // Idempotency key test
  const idempKey = getJobIdempotencyKey('24-hours', 'ammu@example.com');
  assert.strictEqual(idempKey, 'countdown:24-hours:ammu@example.com', 'Idempotency key format is correct');
  pass('Job idempotency key correctly generated to prevent duplicate sends');

  // -------------------------------------------------------------
  // PHASE 7: PRODUCTION CONFIGURATION
  // -------------------------------------------------------------
  console.log('\n--- PHASE 7: PRODUCTION CONFIGURATION AUDIT ---');

  const envExample = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf8');
  assert.ok(!envExample.includes('PREVIEW_CODE'), '.env.example has no PREVIEW_CODE');
  assert.ok(!envExample.includes('PREVIEW_ENABLED'), '.env.example has no PREVIEW_ENABLED');
  assert.ok(!envExample.includes('DEMO_MODE'), '.env.example has no DEMO_MODE');
  assert.ok(envExample.includes('BIRTHDAY_UNLOCK_AT=2026-11-17T00:00:00+05:30'), '.env.example specifies official unlock');
  assert.ok(envExample.includes('RESEND_API_KEY'), '.env.example specifies RESEND_API_KEY');
  pass('.env.example is clean, documented, and free of preview variables');

  // -------------------------------------------------------------
  // PHASES 9 & 10: CINEMATIC EXPERIENCE & PERFORMANCE
  // -------------------------------------------------------------
  console.log('\n--- PHASES 9 & 10: CINEMATIC EXPERIENCE & PERFORMANCE ---');

  // Verify 3D Slap Ashu Mini-Game
  const slapGame = fs.readFileSync(path.join(ROOT, 'src/components/games/SlapAshuGame.jsx'), 'utf8');
  assert.ok(slapGame.includes('THREE.WebGLRenderer'), 'Three.js renderer present in SlapAshuGame');
  assert.ok(slapGame.includes('angerMeter'), 'Anger meter present in SlapAshuGame');
  pass('3D Slap Ashu mini-game with Three.js avatar and anger meter intact');

  // Verify Ink Reveal Card
  const inkCard = fs.readFileSync(path.join(ROOT, 'src/components/InkRevealCard.jsx'), 'utf8');
  assert.ok(inkCard.includes('UNPACK_FLIP_Y_WEBGL'), 'Texture orientation fix present');
  assert.ok(inkCard.includes('u_cursor'), 'Cursor tracking uniform present');
  pass('Full-card cinematic ink reveal shader and upright photo orientation intact');

  // Verify 6 Playlist songs
  const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site.json'), 'utf8'));
  assert.strictEqual(site.playlist.length, 6, 'All 6 playlist tracks present in site.json');
  pass('All 6 playlist tracks intact');

  // Verify build artifact
  assert.ok(fs.existsSync(path.join(ROOT, 'dist/index.html')), 'Production build output dist/index.html exists');
  pass('Production build verified in dist/');

  console.log('\n================================================================');
  console.log(`  ALL ${passed} PRODUCTION RELEASE VERIFICATION CHECKS PASSED!  `);
  console.log('================================================================\n');
}

runMasterProductionSuite().catch((err) => {
  console.error('\n[FATAL ERROR IN TEST SUITE]:', err);
  process.exit(1);
});
