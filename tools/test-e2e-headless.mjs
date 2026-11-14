import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://127.0.0.1:4173';

async function fetchRoute(route, options = {}) {
  const res = await fetch(BASE + route, options);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, headers: res.headers, text, json };
}

async function runTests() {
  console.log('--- E2E VERIFICATION SUITE ---');

  // 1. Root page serves React app with HTML
  const root = await fetchRoute('/');
  assert.strictEqual(root.status, 200, 'Root must return 200');
  assert.ok(root.text.includes('<div id="root">'), 'Root HTML must contain #root container');
  console.log('✓ Root HTML loads correctly with #root');

  // 2. Built React JS contains NO shopping components
  const jsMatch = root.text.match(/src="(\/assets\/index-[^"]+\.js)"/);
  assert.ok(jsMatch, 'Main JS bundle script found in HTML');
  const bundleJs = await fetchRoute(jsMatch[1]);
  assert.strictEqual(bundleJs.status, 200, 'Bundle JS must return 200');

  const forbiddenTerms = [
    'SectionShop',
    'SectionCart',
    'SectionTracking',
    'GiftPackingOverlay',
    'POTTI1703',
    'ammu_cart',
    'ammu_decisions',
    'ammu_order'
  ];
  for (const term of forbiddenTerms) {
    assert.ok(!bundleJs.text.includes(term), `Bundle JS must not contain ${term}`);
  }
  console.log('✓ Production React bundle verified: zero shopping components or storage keys');

  // 3. Static CSS contains gift duo and membership complete styles
  const styleCss = await fetchRoute('/css/style.css');
  assert.strictEqual(styleCss.status, 200, '/css/style.css must return 200');
  assert.ok(styleCss.text.includes('gift-duo'), '/css/style.css includes gift-duo');
  assert.ok(styleCss.text.includes('membership-complete-card'), '/css/style.css includes membership-complete-card');
  assert.ok(!styleCss.text.includes('.shop-section'), '/css/style.css must not include .shop-section');
  assert.ok(!styleCss.text.includes('.cart-layout'), '/css/style.css must not include .cart-layout');
  assert.ok(!styleCss.text.includes('.track-layout'), '/css/style.css must not include .track-layout');
  assert.ok(!styleCss.text.includes('.coupon-hero'), '/css/style.css must not include .coupon-hero');
  console.log('✓ Style CSS verified: gift-duo and membership-complete-card styles present, shopping/cart/tracking absent');

  // 4. Public controllers verify clean scene sequence & shopping logic removal
  const expRes = await fetchRoute('/js/experience.js');
  assert.strictEqual(expRes.status, 200, 'experience.js must return 200');
  const scenesMatch = expRes.text.match(/const scenes=\[([^\]]+)\]/);
  assert.ok(scenesMatch, 'scenes array found in experience.js');
  const scenesList = scenesMatch[1].match(/'[^']+'/g).map(s => s.slice(1, -1));
  assert.strictEqual(scenesList.length, 18, 'scenes array must contain exactly 18 chapters');
  assert.ok(!scenesList.includes('shop'), "scenes must not include 'shop'");
  assert.ok(!scenesList.includes('cart'), "scenes must not include 'cart'");
  assert.ok(!scenesList.includes('tracking'), "scenes must not include 'tracking'");
  assert.ok(expRes.text.includes("['shop','cart','tracking']"), "experience.js hash redirect rule present");
  console.log('✓ experience.js verified: 18 chapters, scenes list clean, hash redirect to gifts configured');

  const appRes = await fetchRoute('/js/app.js');
  assert.strictEqual(appRes.status, 200, 'app.js must return 200');
  const forbiddenAppFns = ['renderShop', 'addCart', 'renderCart', 'placeOrder', 'renderTracking', 'refreshTracking'];
  for (const fn of forbiddenAppFns) {
    assert.ok(!appRes.text.includes(`function ${fn}`) && !appRes.text.includes(`${fn}=`), `app.js must not contain ${fn}`);
  }
  assert.ok(appRes.text.includes('keep-memories-btn'), 'app.js handles keep-memories-btn');
  console.log('✓ app.js verified: zero shopping functions, keep-memories-btn wired');

  // 5. Test API Shopping Route Disabling
  const ordersGet = await fetchRoute('/api/orders');
  assert.strictEqual(ordersGet.status, 404, '/api/orders must return 404');
  const ordersPost = await fetchRoute('/api/orders', { method: 'POST', body: JSON.stringify({}), headers: { 'Content-Type': 'application/json' } });
  assert.strictEqual(ordersPost.status, 404, 'POST /api/orders must return 404');
  const orderById = await fetchRoute('/api/orders/order-123');
  assert.strictEqual(orderById.status, 404, '/api/orders/:id must return 404');
  const adminOrders = await fetchRoute('/api/admin/orders');
  assert.ok([401, 404].includes(adminOrders.status), '/api/admin/orders returns 401 or 404');
  console.log('✓ API routes verified: all order and shopping endpoints return 404 (disabled)');

  // 6. Test Admin API without shopping data
  const adminLogin = await fetchRoute('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password: 'TEST-ONLY-admin-password' }),
    headers: { 'Content-Type': 'application/json' }
  });
  // Note: Local server uses config.local.json password, let's read config.local.json
  const config = JSON.parse(fs.readFileSync('config.local.json', 'utf8'));
  const realLogin = await fetchRoute('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password: config.ADMIN_PASSWORD }),
    headers: { 'Content-Type': 'application/json' }
  });
  assert.strictEqual(realLogin.status, 200, 'Admin login succeeds with config password');
  const cookie = realLogin.headers.get('set-cookie');

  const adminData = await fetchRoute('/api/admin/data', {
    headers: { Cookie: cookie.split(';')[0] }
  });
  assert.strictEqual(adminData.status, 200, 'Admin data returned 200');
  assert.strictEqual(adminData.json.site.products, undefined, 'Admin site data must not have products');
  assert.strictEqual(adminData.json.site.coupon, undefined, 'Admin site data must not have coupon');
  assert.strictEqual(adminData.json.site.shopStages, undefined, 'Admin site data must not have shopStages');
  assert.deepStrictEqual(adminData.json.db.orders, [], 'Admin db.orders is empty');
  console.log('✓ Admin API verified: products and coupon completely omitted from admin state');

  // 7. Verify Admin UI HTML
  const adminHtml = await fetchRoute('/admin');
  assert.strictEqual(adminHtml.status, 200, 'Admin page returns 200');
  assert.ok(!adminHtml.text.includes('data-tab="products"'), 'Admin HTML must not have products tab');
  assert.ok(!adminHtml.text.includes('data-tab="orders"'), 'Admin HTML must not have orders tab');
  console.log('✓ Admin dashboard HTML verified: products and orders tabs absent');

  console.log('\nALL 7 HEADLESS E2E VERIFICATIONS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test failure:', err);
  process.exit(1);
});
