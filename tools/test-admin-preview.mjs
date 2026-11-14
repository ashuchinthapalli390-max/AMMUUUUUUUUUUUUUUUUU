// Comprehensive Admin Preview & Birthday Time-Lock Test Suite
import fs from 'node:fs';

const BASE_API = 'http://127.0.0.1:4173';
const BASE_VITE = 'http://127.0.0.1:5173';
const config = JSON.parse(fs.readFileSync('config.local.json', 'utf8'));
const ADMIN_PASSWORD = config.ADMIN_PASSWORD;

console.log('====================================================');
console.log('  TESTING ADMIN PREVIEW & TIME-LOCK ACCESS CONTROL  ');
console.log('====================================================\n');

let failed = 0;
let passed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

async function run() {
  // Test 1: Unauthenticated public visitor bootstrap is LOCKED
  const publicBootRes = await fetch(`${BASE_API}/api/bootstrap`);
  const publicBoot = await publicBootRes.json();
  assert(publicBoot.open === false, 'Test 1a: Public visitor bootstrap is locked (open === false)');
  assert(publicBoot.isAdmin === false, 'Test 1b: Public visitor is not admin (isAdmin === false)');
  assert(publicBoot.birthdayDate === '2026-11-17T00:00:00+05:30', 'Test 1c: Public unlock date is strictly 2026-11-17T00:00:00+05:30');

  // Test 2: Unauthenticated request to protected photo returns 403
  const publicPhotoRes = await fetch(`${BASE_API}/assets/photos/ammu_01.jpg`);
  assert(publicPhotoRes.status === 403, 'Test 2: Unauthenticated photo request is blocked (HTTP 403)');

  // Test 3: Unauthenticated request to /admin/preview is redirected to /admin
  const publicPreviewRes = await fetch(`${BASE_API}/admin/preview`, { redirect: 'manual' });
  assert(publicPreviewRes.status === 302, 'Test 3a: Unauthenticated /admin/preview returns redirect (HTTP 302)');
  const loc = publicPreviewRes.headers.get('location') || '';
  assert(loc.includes('/admin'), `Test 3b: Redirect target is /admin (got: ${loc})`);

  // Test 4: Ashu logs in with admin credentials
  const loginRes = await fetch(`${BASE_API}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE_VITE },
    body: JSON.stringify({ password: ADMIN_PASSWORD })
  });
  assert(loginRes.ok, `Test 4a: Admin login succeeded (HTTP ${loginRes.status})`);
  const setCookie = loginRes.headers.get('set-cookie') || '';
  assert(setCookie.includes('ammu_session='), 'Test 4b: ammu_session cookie was issued');

  // Extract session token
  const match = setCookie.match(/ammu_session=([^;]+)/);
  const sessionToken = match ? match[1] : '';
  const adminHeaders = {
    Cookie: `ammu_session=${sessionToken}`,
    Origin: BASE_VITE
  };

  // Test 5: Admin session verification endpoint
  const sessionRes = await fetch(`${BASE_API}/api/admin/session`, { headers: adminHeaders });
  const sessionData = await sessionRes.json();
  assert(sessionData.authenticated === true, 'Test 5: /api/admin/session recognizes authenticated Ashu');

  // Test 6: Authenticated Ashu receives open: true from /api/bootstrap
  const adminBootRes = await fetch(`${BASE_API}/api/bootstrap`, { headers: adminHeaders });
  const adminBoot = await adminBootRes.json();
  assert(adminBoot.open === true, 'Test 6a: Admin bootstrap returns open === true');
  assert(adminBoot.isAdminPreview === true, 'Test 6b: Admin bootstrap returns isAdminPreview === true');
  assert(Array.isArray(adminBoot.chapters) && adminBoot.chapters.length >= 14, `Test 6c: Admin bootstrap returns all journey timeline chapters (found: ${adminBoot.chapters?.length})`);

  // Test 7: Authenticated Ashu can access protected photos
  const adminPhotoRes = await fetch(`${BASE_API}/assets/photos/ammu_01.jpg`, { headers: adminHeaders });
  assert(adminPhotoRes.status === 200, `Test 7: Authenticated Ashu loads protected photos (HTTP ${adminPhotoRes.status})`);

  // Test 8: Authenticated Ashu accesses /admin/preview successfully
  const adminPreviewRes = await fetch(`${BASE_API}/admin/preview`, { headers: adminHeaders, redirect: 'manual' });
  assert(adminPreviewRes.status === 200, `Test 8a: Authenticated Ashu accesses /admin/preview (HTTP ${adminPreviewRes.status})`);
  const previewHtml = await adminPreviewRes.text();
  assert(previewHtml.includes('<!DOCTYPE html>') || previewHtml.includes('<div id="root">'), 'Test 8b: /admin/preview serves React app index.html');

  // Test 9: Preview side-effect isolation (wishes submission does not corrupt production db)
  const previewWishRes = await fetch(`${BASE_API}/api/wishes`, {
    method: 'POST',
    headers: { ...adminHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ wish1: 'Preview Wish Test', preview: true })
  });
  const wishJson = await previewWishRes.json();
  assert(wishJson.ok === true && wishJson.previewMode === true, 'Test 9a: Wish submission recognized as preview mode without side effects');
  assert(wishJson.emailStatus === 'preview_simulated', 'Test 9b: Email is simulated in preview mode');

  // Test 10: Preview side-effect isolation for memberships
  const previewMemRes = await fetch(`${BASE_API}/api/membership`, {
    method: 'POST',
    headers: { ...adminHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'care', preview: true })
  });
  const memJson = await previewMemRes.json();
  assert(memJson.ok === true && memJson.previewMode === true, 'Test 10: Voucher claim recognized as preview mode without side effects');

  // Test 11: Admin logout revokes session
  const logoutRes = await fetch(`${BASE_API}/api/admin/logout`, {
    method: 'POST',
    headers: { ...adminHeaders, 'Content-Type': 'application/json' }
  });
  assert(logoutRes.ok, 'Test 11a: Admin logout succeeds');
  const logoutCookie = logoutRes.headers.get('set-cookie') || '';
  assert(logoutCookie.includes('ammu_session=;') || logoutCookie.includes('Max-Age=0'), 'Test 11b: Session cookie expired on logout');

  // Test 12: Post-logout request to /admin/preview is blocked
  const postLogoutPreviewRes = await fetch(`${BASE_API}/admin/preview`, {
    headers: { Cookie: 'ammu_session=' },
    redirect: 'manual'
  });
  assert(postLogoutPreviewRes.status === 302, 'Test 12: Post-logout access to /admin/preview is blocked (HTTP 302)');

  console.log('\n====================================================');
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

run().catch((e) => {
  console.error('Test suite error:', e);
  process.exit(1);
});
