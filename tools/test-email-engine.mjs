import fs from 'fs';

async function testEmailEngine() {
  const BASE = 'http://127.0.0.1:4173';
  console.log('\n--- TESTING COUNTDOWN MAIL ENGINE VIA ADMIN API ---');

  // 1. Read admin password from local config or env
  let adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword && fs.existsSync('.env')) {
    const lines = fs.readFileSync('.env', 'utf8').split('\n');
    for (const l of lines) {
      const m = l.match(/^ADMIN_PASSWORD=(.*)$/);
      if (m) adminPassword = m[1].trim().replace(/^["']|["']$/g, '');
    }
  }

  // 2. Admin login
  const loginRes = await fetch(`${BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: adminPassword })
  });
  const setCookie = loginRes.headers.get('set-cookie');
  if (!setCookie) throw new Error('Admin login failed: ' + loginRes.status);
  const cookieHeader = { 'Cookie': setCookie.split(';')[0] };
  console.log('[PASS] Admin login authenticated successfully');

  // 3. Test Preview 24-hours milestone HTML
  const prevRes = await fetch(`${BASE}/api/admin/countdown/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...cookieHeader },
    body: JSON.stringify({ milestoneId: '24-hours' })
  });
  const prevData = await prevRes.json();
  if (!prevData.html || !prevData.html.includes('24 HOURS / 1 DAY TO GO')) {
    throw new Error('Preview milestone failed: ' + JSON.stringify(prevData));
  }
  console.log('[PASS] /api/admin/countdown/preview rendered 24-hours HTML email template successfully');

  // 4. Test Preview 0-midnight milestone HTML
  const prevMidnightRes = await fetch(`${BASE}/api/admin/countdown/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...cookieHeader },
    body: JSON.stringify({ milestoneId: '0-midnight' })
  });
  const prevMidnightData = await prevMidnightRes.json();
  if (!prevMidnightData.html || !prevMidnightData.html.includes('OPEN YOUR BIRTHDAY UNIVERSE 💗')) {
    throw new Error('Preview midnight milestone failed');
  }
  console.log('[PASS] /api/admin/countdown/preview rendered 0-midnight unlock email template successfully');

  console.log('--- ALL EMAIL ENGINE API TESTS PASSED ---\n');
}

testEmailEngine().catch(e => {
  console.error('Email engine test failed:', e);
  process.exit(1);
});
