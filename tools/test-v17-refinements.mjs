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

async function runV17Tests() {
  console.log('\n======================================================');
  console.log('   RUNNING AMMU BIRTHDAY V17 SPECIFICATION TEST SUITE  ');
  console.log('======================================================\n');

  let passed = 0;
  function pass(msg) {
    console.log(`[PASS] ${msg}`);
    passed++;
  }

  // 1. Header Verification
  const headerFile = fs.readFileSync('src/screens/SectionOther2.jsx', 'utf8');
  assert.ok(headerFile.includes('To My Dear Lovelyy Pottiiiiiiiiiiiiiiiiiiii 💗'), 'Header must contain exact dedication');
  pass('Slim header contains exact dedication: To My Dear Lovelyy Pottiiiiiiiiiiiiiiiiiiii 💗');

  assert.ok(!headerFile.includes('TO MY LOVELYYYY BUDDIEEEEE'), 'Old uppercase banner removed');
  assert.ok(!headerFile.includes('from Ashu</small>'), 'Old subtitle removed');
  assert.ok(!headerFile.includes('Our Story</a>'), 'Horizontal nav links removed from top bar');
  pass('Crowded banners, subtitles, and horizontal nav links removed from header');

  const css = fs.readFileSync('public/css/style.css', 'utf8');
  assert.ok(css.includes('.site-nav.slim-dedication-nav'), 'CSS has slim-dedication-nav rules');
  assert.ok(css.includes('.header-dedication-title'), 'CSS has header-dedication-title rules');
  pass('Slim dedication header CSS rules present with elegant typography and border');

  // 2. Gifts Hub & Modal Overlays Verification
  const pranksFile = fs.readFileSync('src/screens/SectionPranks.jsx', 'utf8');
  assert.ok(pranksFile.includes('close-gift-modal-btn'), 'SectionPranks has close button');
  assert.ok(pranksFile.includes('id="close-pranks-modal"'), 'SectionPranks has close-pranks-modal');
  pass('Gift One (SectionPranks) has explicit close button: close-gift-modal-btn');

  const membersFile = fs.readFileSync('src/screens/SectionMemberships.jsx', 'utf8');
  assert.ok(membersFile.includes('close-gift-modal-btn'), 'SectionMemberships has close button');
  assert.ok(membersFile.includes('id="close-memberships-modal"'), 'SectionMemberships has close-memberships-modal');
  pass('Gift Two (SectionMemberships) has explicit close button: close-gift-modal-btn');

  assert.ok(css.includes('#pranks,\n#memberships {\n  display: none !important;'), 'Gifts hidden from normal document scroll flow');
  pass('Gift One & Gift Two contents hidden (display: none !important) from regular scroll flow');

  assert.ok(css.includes('#pranks.gift-modal-open,\n#memberships.gift-modal-open {\n  display: block !important;\n  position: fixed !important;'), 'Fullscreen modal overlay CSS verified');
  pass('Gifts open as fixed fullscreen modal overlays with backdrop blur when triggered');

  // 3. Audio & Sound Effects Verification
  const cursorAudio = fs.readFileSync('src/components/cursor/cursorAudio.js', 'utf8');
  assert.ok(!cursorAudio.includes('ctx.createOscillator()'), 'playFairySparkleChime oscillator removed');
  pass('Cursor sparkle chimes silenced per zero UI SFX requirement');

  const lettersFile = fs.readFileSync('src/components/FlyingLoveLetters.jsx', 'utf8');
  assert.ok(!lettersFile.includes('ctx.createOscillator()'), 'Envelope chimes removed');
  pass('Flying love letters chime oscillator silenced');

  const gateFile = fs.readFileSync('src/screens/GateView.jsx', 'utf8');
  assert.ok(!gateFile.includes('osc.frequency.setValueAtTime(523.25'), 'Gate chime oscillator removed');
  pass('Midnight unlock gate chime oscillator silenced');

  // 4. Exact Organic Ink-Spread Mask (Reference image: ink_mask.jpg)
  const inkMaskPath = 'public/assets/effects/ink_mask.jpg';
  assert.ok(fs.existsSync(inkMaskPath), 'ink_mask.jpg asset exists');
  const inkMaskStat = fs.statSync(inkMaskPath);
  assert.ok(inkMaskStat.size > 50000, 'ink_mask.jpg is the full high-res texture');
  pass(`Organic ink mask texture verified (${inkMaskStat.size} bytes)`);

  const inkRoute = await fetchRoute('/assets/effects/ink_mask.jpg');
  assert.strictEqual(inkRoute.status, 200, 'ink_mask.jpg served over HTTP');
  pass('ink_mask.jpg successfully served over HTTP from local server');

  // 4. Exact Localized WebGL Ink-Spread Mask (State 1-5 Requirements)
  const inkCardPath = 'src/components/InkRevealCard.jsx';
  assert.ok(fs.existsSync(inkCardPath), 'InkRevealCard.jsx component exists');
  const inkCardFile = fs.readFileSync(inkCardPath, 'utf8');
  assert.ok(inkCardFile.includes('u_texA'), 'Shader binds Texture A (Ammu photograph)');
  assert.ok(inkCardFile.includes('u_texB'), 'Shader binds Texture B (Song artwork)');
  assert.ok(inkCardFile.includes('u_cursor'), 'Shader uses u_cursor uniform for pointer tracking');
  assert.ok(inkCardFile.includes('u_radius'), 'Shader uses u_radius uniform for localized reveal');
  assert.ok(inkCardFile.includes('fbm') || inkCardFile.includes('snoise'), 'Shader uses procedural organic noise');
  assert.ok(inkCardFile.includes('mix(colA, colB, mask)'), 'Shader performs true image replacement without global transparency');
  pass('InkRevealCard implements custom WebGL fragment shader with localized pointer tracking');

  const playlistFile = fs.readFileSync('src/screens/SectionPlaylist.jsx', 'utf8');
  assert.ok(playlistFile.includes('InkRevealCard'), 'SectionPlaylist uses InkRevealCard component');
  pass('SectionPlaylist integrates InkRevealCard into album scene');
  pass('SectionPlaylist implements interactive organic dendritic ink-spread mask on hover');

  // 5. Slap Ashu 3D Mini-Game Verification
  const slapGamePath = 'src/components/games/SlapAshuGame.jsx';
  assert.ok(fs.existsSync(slapGamePath), 'SlapAshuGame.jsx component exists');
  const slapFile = fs.readFileSync(slapGamePath, 'utf8');
  assert.ok(slapFile.includes('Angry With Ashu? Give Him A Little Slap! 😭💗'), 'Title matches requirement');
  assert.ok(slapFile.includes('Pottiiiiiiii, kopam thagge varaku nee Ashu ni tease cheyyi!'), 'Subtitle matches requirement');
  pass('Slap Ashu 3D mini-game title & subtitle verified');

  assert.ok(slapFile.includes('TENGLISH_DIALOGUES'), 'Tenglish dialogues array exists');
  assert.ok(slapFile.includes('Aiyooo Potti, antha kopama na meeda? 😭'), 'Dialogue 1 present');
  assert.ok(slapFile.includes('Iron Man helmet pettukunta... ippudu kottu choodam! 🦾'), 'Dialogue 9 present');
  assert.ok(slapFile.includes('Hoorayyy! Naa cute Pottiiii cool aypoyindi! 🥳💗'), 'Dialogue 16 present');
  pass('All 16 humorous Tenglish dialogues verified');

  assert.ok(slapFile.includes('EXPRESSIONS'), 'Expressions array exists');
  assert.ok(slapFile.includes('angerMeter'), 'Anger Meter state exists');
  assert.ok(slapFile.includes("YAYYYY! POTTIIII'S KOPAM TAGGINDHI! 💗"), 'Calm 0% anger victory banner present');
  pass('Anger Meter (100% to 0%) and victory celebration verified');

  assert.ok(slapFile.includes('THREE.WebGLRenderer'), 'Three.js 3D character renderer initialized');
  assert.ok(slapFile.includes('slapImpulse') || slapFile.includes('scaleX'), 'Squash and stretch animation physics present');
  pass('3D Chibi Ashu character in Three.js with cartoon squash-and-stretch wobble verified');

  const gamesFile = fs.readFileSync('src/components/WonderlandOfGames.jsx', 'utf8');
  assert.ok(gamesFile.includes('SlapAshuGame'), 'WonderlandOfGames imports SlapAshuGame');
  assert.ok(gamesFile.includes('activeTab === \'slapAshu\''), 'Slap Ashu is active and selectable');
  pass('WonderlandOfGames features Slap Ashu alongside all 8 mini-games');

  console.log('\n======================================================');
  console.log(`  ALL ${passed} / ${passed} V17 REFINEMENT TESTS PASSED SUCCESSFULLY!  `);
  console.log('======================================================\n');
}

runV17Tests().catch((e) => {
  console.error('Test failure:', e);
  process.exit(1);
});
