import http from 'node:http';
import fs from 'node:fs';

const config = JSON.parse(fs.readFileSync('config.local.json', 'utf8'));
const ADMIN_PASSWORD = config.ADMIN_PASSWORD;

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks)
        });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  console.log('====================================================');
  console.log('   TESTING MEDIA STREAMING, RANGE 206 & ACCESS     ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;
  function assert(cond, msg) {
    if (cond) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  }

  // 1. Unauthenticated countdown manifest and poster should be PUBLIC
  const manifestRes = await request({
    host: '127.0.0.1',
    port: 4173,
    path: '/assets/countdown/manifest.json',
    method: 'GET'
  });
  assert(manifestRes.statusCode === 200, 'Public can access /assets/countdown/manifest.json (HTTP 200)');
  const manifest = JSON.parse(manifestRes.body.toString());
  assert(manifest.posters.length === 21, `Manifest contains 21 posters (found: ${manifest.posters.length})`);

  const posterRes = await request({
    host: '127.0.0.1',
    port: 4173,
    path: '/assets/countdown/ammu_countdown_02_days_left.png',
    method: 'GET'
  });
  assert(posterRes.statusCode === 200, 'Public can view today\'s countdown poster (HTTP 200)');
  assert(posterRes.headers['content-type'] === 'image/png', 'Poster Content-Type is image/png');

  // 2. Unauthenticated audio, cinema, and photos must be LOCKED (HTTP 403)
  const lockedAudio = await request({
    host: '127.0.0.1',
    port: 4173,
    path: '/assets/music/01-samjhawan.mp3',
    method: 'GET'
  });
  assert(lockedAudio.statusCode === 403, 'Public visitor blocked from /assets/music/ (HTTP 403)');

  const lockedCinema = await request({
    host: '127.0.0.1',
    port: 4173,
    path: '/assets/cinema/irumudi.jpg',
    method: 'GET'
  });
  assert(lockedCinema.statusCode === 403, 'Public visitor blocked from /assets/cinema/ (HTTP 403)');

  // 3. Authenticate as Admin
  const loginRes = await request({
    host: '127.0.0.1',
    port: 4173,
    path: '/api/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ password: ADMIN_PASSWORD }));
  assert(loginRes.statusCode === 200, 'Admin login succeeded');

  const cookie = loginRes.headers['set-cookie']?.[0]?.split(';')[0] || '';
  assert(cookie.startsWith('ammu_session='), 'Received admin session cookie');

  // 4. Test HTTP 206 Partial Content Range Streaming for all 6 songs
  const songs = [
    '01-samjhawan.mp3',
    '02-baarish.mp3',
    '03-tum-hi-ho.mp3',
    '04-gehra-hua.mp3',
    '05-channa-mereya.mp3',
    '06-ye-tune-kya-kiya.mp3'
  ];

  for (const song of songs) {
    const rangeRes = await request({
      host: '127.0.0.1',
      port: 4173,
      path: `/assets/music/${song}`,
      method: 'GET',
      headers: {
        'Cookie': cookie,
        'Range': 'bytes=0-1023'
      }
    });

    assert(rangeRes.statusCode === 206, `${song}: Responds with HTTP 206 Partial Content`);
    assert(rangeRes.headers['content-range']?.startsWith('bytes 0-1023/'), `${song}: Valid Content-Range header`);
    assert(rangeRes.headers['accept-ranges'] === 'bytes', `${song}: Accept-Ranges: bytes header present`);
    assert(rangeRes.headers['content-type'] === 'audio/mpeg', `${song}: Content-Type is audio/mpeg`);
    assert(rangeRes.body.length === 1024, `${song}: Streamed exact requested 1024 bytes (chunk size: ${rangeRes.body.length})`);
  }

  // 5. Test all 6 movie posters accessible in preview session
  const posters = [
    'irumudi.jpg',
    'paradise.jpg',
    'doraemon.jpg',
    '418.jpg',
    'ranabali.jpg',
    'spider-man-plans.jpg'
  ];

  for (const p of posters) {
    const pRes = await request({
      host: '127.0.0.1',
      port: 4173,
      path: `/assets/cinema/${p}`,
      method: 'GET',
      headers: { 'Cookie': cookie }
    });
    assert(pRes.statusCode === 200, `Cinema poster ${p} loads in preview session (HTTP 200, ${pRes.body.length} bytes)`);
    assert(pRes.headers['content-type'] === 'image/jpeg', `${p} Content-Type is image/jpeg`);
  }

  console.log(`\n====================================================`);
  console.log(`  MEDIA & RANGE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`====================================================\n`);

  if (failed > 0) process.exit(1);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
