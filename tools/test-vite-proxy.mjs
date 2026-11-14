// Test Vite Dev Server (:5173) and Proxy to Backend (:4173)
import fs from 'node:fs';

const BASE_VITE = 'http://127.0.0.1:5173';
const config = JSON.parse(fs.readFileSync('config.local.json', 'utf8'));
const ADMIN_PASSWORD = config.ADMIN_PASSWORD;

console.log('====================================================');
console.log('  TESTING VITE DEV SERVER (:5173) PROXY & ROUTES    ');
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
  // Test 1: Vite serves root
  const rootRes = await fetch(`${BASE_VITE}/`);
  assert(rootRes.status === 200, 'Test 1: Vite serves root / (HTTP 200)');
  const rootHtml = await rootRes.text();
  assert(rootHtml.includes('src/main.jsx'), 'Test 1b: HTML mounts src/main.jsx');

  // Test 2: Vite serves /admin
  const adminRes = await fetch(`${BASE_VITE}/admin`);
  assert(adminRes.status === 200, 'Test 2: Vite serves /admin (HTTP 200)');

  // Test 3: Vite serves /admin/preview
  const previewRes = await fetch(`${BASE_VITE}/admin/preview`);
  assert(previewRes.status === 200, 'Test 3: Vite serves /admin/preview (HTTP 200)');

  // Test 4: Vite proxies /api/bootstrap to backend
  const bootRes = await fetch(`${BASE_VITE}/api/bootstrap`);
  assert(bootRes.status === 200, 'Test 4a: Vite proxies /api/bootstrap (HTTP 200)');
  const boot = await bootRes.json();
  assert(boot.open === false, 'Test 4b: Public visitor is locked through Vite proxy (open === false)');

  // Test 5: Vite proxies /api/admin/login
  const loginRes = await fetch(`${BASE_VITE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: ADMIN_PASSWORD })
  });
  assert(loginRes.status === 200, 'Test 5a: Admin login through Vite proxy succeeded');
  const setCookie = loginRes.headers.get('set-cookie') || '';
  assert(setCookie.includes('ammu_session='), 'Test 5b: Session cookie set through Vite proxy');

  const match = setCookie.match(/ammu_session=([^;]+)/);
  const sessionToken = match ? match[1] : '';
  const adminHeaders = {
    Cookie: `ammu_session=${sessionToken}`
  };

  // Test 6: Authenticated bootstrap through Vite proxy
  const authBootRes = await fetch(`${BASE_VITE}/api/bootstrap`, { headers: adminHeaders });
  const authBoot = await authBootRes.json();
  assert(authBoot.open === true, 'Test 6a: Authenticated bootstrap through Vite proxy returns open === true');
  assert(authBoot.isAdminPreview === true, 'Test 6b: Authenticated bootstrap through Vite proxy returns isAdminPreview === true');

  // Test 7: Vite serves photos directly from public dir
  const photoRes = await fetch(`${BASE_VITE}/assets/photos/ammu_01.jpg`);
  assert(photoRes.status === 200, 'Test 7: Vite serves photo asset /assets/photos/ammu_01.jpg (HTTP 200)');

  console.log('\n====================================================');
  console.log(`  VITE PROXY RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

run().catch((e) => {
  console.error('Vite test suite error:', e);
  process.exit(1);
});
