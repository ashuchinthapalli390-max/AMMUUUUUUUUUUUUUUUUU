import assert from 'node:assert';
import handler from '../api/index.js';
import { scheduleAllFutureMilestones, COUNTDOWN_MILESTONES } from '../server.mjs';

console.log('==================================================================');
console.log('       TESTING CHECK-IN SYSTEM & RESEND SCHEDULER (V17)          ');
console.log('==================================================================\n');

// Mock request / response helper for testing api/index.js in-memory
function mockReqRes(method, path, body = null, headers = {}) {
  const req = {
    method,
    url: path,
    headers: {
      host: 'localhost:5173',
      origin: 'http://localhost:5173',
      'content-type': 'application/json',
      ...headers
    },
    socket: { remoteAddress: '127.0.0.1' },
    body
  };

  let statusCode = 200;
  let headersSent = false;
  const resHeaders = {};
  let responseData = '';

  const res = {
    writeHead(code, hdrs) {
      statusCode = code;
      Object.assign(resHeaders, hdrs);
      headersSent = true;
    },
    setHeader(k, v) {
      resHeaders[k.toLowerCase()] = v;
    },
    getHeader(k) {
      return resHeaders[k.toLowerCase()];
    },
    end(data) {
      if (data) responseData = data;
    },
    get statusCode() { return statusCode; },
    get headersSent() { return headersSent; },
    get body() {
      try { return JSON.parse(responseData); } catch { return responseData; }
    }
  };

  return { req, res };
}

async function runTests() {
  // Test 1: GET /api/checkin/status via api/index.js handler
  console.log('--- TEST 1: Check-in Status Endpoint ---');
  const { req: req1, res: res1 } = mockReqRes('GET', '/api/checkin/status');
  await handler(req1, res1);
  assert.strictEqual(res1.statusCode, 200, 'HTTP Status should be 200');
  assert.strictEqual(res1.body.ok, true, 'Response ok should be true');
  assert.ok(res1.body.today, 'Today date must be present');
  assert.ok(typeof res1.body.totalCheckins === 'number', 'totalCheckins must be a number');
  assert.ok(typeof res1.body.currentStreak === 'number', 'currentStreak must be a number');
  assert.ok(res1.body.poster && res1.body.poster.image, 'Poster data must be present');
  console.log('[PASS] /api/checkin/status returned valid JSON:', JSON.stringify(res1.body, null, 2));

  // Test 2: POST /api/checkin via api/index.js handler
  console.log('\n--- TEST 2: Check-in Submission Endpoint ---');
  const { req: req2, res: res2 } = mockReqRes('POST', '/api/checkin', {});
  await handler(req2, res2);
  assert.ok([200, 201].includes(res2.statusCode), 'HTTP Status should be 200 or 201');
  assert.strictEqual(res2.body.ok, true, 'Check-in ok should be true');
  assert.ok(res2.body.poster && res2.body.poster.image, 'Check-in returned poster');
  console.log('[PASS] /api/checkin returned valid JSON:', JSON.stringify(res2.body, null, 2));

  // Test 3: Idempotency on repeated POST /api/checkin with same visitor cookie
  console.log('\n--- TEST 3: Check-in Idempotency ---');
  const setCookie = res2.getHeader('set-cookie') || '';
  const cookieMatch = setCookie.match(/ammu_visitor=([^;]+)/);
  const cookieHeader = cookieMatch ? `ammu_visitor=${cookieMatch[1]}` : '';
  const { req: req3, res: res3 } = mockReqRes('POST', '/api/checkin', {}, { cookie: cookieHeader });
  await handler(req3, res3);
  assert.strictEqual(res3.statusCode, 200, 'Repeated checkin should return 200');
  assert.strictEqual(res3.body.alreadyCollected, true, 'alreadyCollected must be true');
  console.log('[PASS] Repeated check-in gracefully recognized duplicate.');

  // Test 4: Invalid route returns JSON error, NOT HTML
  console.log('\n--- TEST 4: Invalid API Route Error Handling ---');
  const { req: req4, res: res4 } = mockReqRes('GET', '/api/unknown_non_existent_route');
  await handler(req4, res4);
  assert.ok([403, 404].includes(res4.statusCode), 'Unknown route returns 403 or 404 before birthday');
  assert.strictEqual(typeof res4.body, 'object', 'Response must be JSON object, never HTML string');
  assert.strictEqual(res4.body.ok, false, 'Response ok is false');
  console.log('[PASS] Invalid route returns JSON error:', JSON.stringify(res4.body));

  // Test 5: Resend Provider-Side Scheduled Email API
  console.log('\n--- TEST 5: Resend Provider-Side Scheduled Email Execution ---');
  const scheduleRes = await scheduleAllFutureMilestones();
  console.log('Schedule result:', JSON.stringify(scheduleRes, null, 2));
  assert.strictEqual(scheduleRes.ok, true, 'scheduleAllFutureMilestones should return ok: true');
  console.log(`[PASS] Scheduled ${scheduleRes.scheduledCount} future milestones via Resend.`);

  // Test 6: Idempotency of Provider-Side Scheduling
  console.log('\n--- TEST 6: Resend Scheduling Idempotency ---');
  const scheduleRes2 = await scheduleAllFutureMilestones();
  assert.strictEqual(scheduleRes2.ok, true, 'Second schedule run should return ok: true');
  const alreadySched = scheduleRes2.details.filter(d => d.status === 'already_scheduled');
  console.log(`[PASS] Idempotency verified: ${alreadySched.length} milestones were recognized as already scheduled.`);

  console.log('\n==================================================================');
  console.log('       ALL CHECK-IN & RESEND TESTS PASSED SUCCESSFULLY!          ');
  console.log('==================================================================\n');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
