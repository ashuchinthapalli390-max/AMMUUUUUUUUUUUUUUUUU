/**
 * Comprehensive V16 Feature Verification Suite
 * Tests all 18 Phases of the Ammu Birthday Website V16 specification.
 */
import fs from 'node:fs';
import path from 'node:path';
import { COUNTDOWN_MILESTONES, renderEmailHtml, getJobIdempotencyKey } from '../server/countdownEmailEngine.mjs';

const ROOT = process.cwd();
console.log('\n======================================================');
console.log('   RUNNING AMMU BIRTHDAY V16 SPECIFICATION TEST SUITE  ');
console.log('======================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  } else {
    passedTests++;
    console.log(`[PASS] ${message}`);
  }
}

// -------------------------------------------------------------
// TEST 1: ENVIRONMENT CONFIGURATION & VALIDATION
// -------------------------------------------------------------
assert(fs.existsSync(path.join(ROOT, '.env.example')), '.env.example file exists');
assert(fs.existsSync(path.join(ROOT, '.env')), '.env local development file exists');
const envExampleContent = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf8');
assert(envExampleContent.includes('BIRTHDAY_UNLOCK_AT='), '.env.example contains BIRTHDAY_UNLOCK_AT');
assert(envExampleContent.includes('CELEBRATION_URL='), '.env.example contains CELEBRATION_URL');
assert(envExampleContent.includes('COUNTDOWN_EMAILS_ENABLED='), '.env.example contains COUNTDOWN_EMAILS_ENABLED');
assert(envExampleContent.includes('EMAIL_DRY_RUN='), '.env.example contains EMAIL_DRY_RUN');

// -------------------------------------------------------------
// TEST 2: SHOPPING REMOVAL INTEGRITY
// -------------------------------------------------------------
const screensDir = path.join(ROOT, 'src/screens');
const deletedShoppingFiles = ['SectionShop.jsx', 'SectionCart.jsx', 'SectionTracking.jsx', 'GiftPackingOverlay.jsx'];
for (const file of deletedShoppingFiles) {
  assert(!fs.existsSync(path.join(screensDir, file)), `Shopping component ${file} was deleted`);
}

const siteJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/site.json'), 'utf8'));
assert(siteJson.coupon === undefined, 'No shopping coupon in site.json');
assert(siteJson.products === undefined, 'No shopping products in site.json');
assert(!JSON.stringify(siteJson).includes('POTTI1703'), 'No POTTI1703 coupon code in site.json');

// -------------------------------------------------------------
// TEST 3: GIFTS INTEGRITY (2 GIFTS ONLY)
// -------------------------------------------------------------
// The scroll story (src/story) replaced the legacy section screens; gifts + cake live in ChaptersTwo.jsx.
const storyChapters = fs.readFileSync(path.join(ROOT, 'src/story/ChaptersTwo.jsx'), 'utf8');
const giftsJsx = storyChapters.slice(storyChapters.indexOf('export function Gifts'));
const giftCards = giftsJsx.match(/\{box\('([^']+)'/g) || [];
assert(giftCards.length === 2, `Gifts chapter has exactly 2 gift boxes (found: ${giftCards.length})`);
assert(giftsJsx.includes('Two Little Surprises') && giftsJsx.includes('Just For You 💗'), 'Gifts heading verified');

// -------------------------------------------------------------
// TEST 4: CELEBRATION EMBEDDING INTEGRITY
// -------------------------------------------------------------
const cakeJsx = storyChapters.slice(storyChapters.indexOf('export function Cake'), storyChapters.indexOf('export function Gifts'));
assert(cakeJsx.includes('A Grand Little Celebration For Our Birthday Girl'), 'Celebration heading in Cake chapter');
assert(cakeJsx.includes('Visit Your Birthday Celebration 💗'), 'Primary Visit Celebration button verified');
assert(fs.existsSync(path.join(ROOT, 'src/components/CelebrationOverlay.jsx')), 'CelebrationOverlay component exists');
const overlayContent = fs.readFileSync(path.join(ROOT, 'src/components/CelebrationOverlay.jsx'), 'utf8');
assert(overlayContent.includes('Exit Celebration ✕'), 'Exit Celebration ✕ button verified in overlay');
assert(overlayContent.includes('CELEBRATION_COMPLETED'), 'postMessage CELEBRATION_COMPLETED bridge verified');

// -------------------------------------------------------------
// TEST 5: FLYING LOVE LETTERS INTEGRITY
// -------------------------------------------------------------
assert(fs.existsSync(path.join(ROOT, 'src/components/FlyingLoveLetters.jsx')), 'FlyingLoveLetters component exists');
assert(Array.isArray(siteJson.flyingNotes) && siteJson.flyingNotes.length >= 15, `At least 15 sample flying love notes seeded (found: ${siteJson.flyingNotes?.length})`);
const butterflyColors = ['blush-pink', 'lavender', 'pearl-white', 'rose-gold', 'soft-blue'];
for (const color of butterflyColors) {
  assert(siteJson.flyingNotes.some(n => n.butterflyColor === color), `Butterfly color ${color} is represented in notes`);
}

// -------------------------------------------------------------
// TEST 6: HIDDEN COMPLIMENTS INTEGRITY
// -------------------------------------------------------------
assert(fs.existsSync(path.join(ROOT, 'src/components/HiddenCompliments.jsx')), 'HiddenCompliments component exists');
assert(Array.isArray(siteJson.hiddenCompliments) && siteJson.hiddenCompliments.length >= 10, 'Hidden compliments seeded');
const compCategories = ['cursor', 'scrapbook', 'stars', 'flowers', 'magazine', 'gift'];
for (const cat of compCategories) {
  assert(siteJson.hiddenCompliments.some(c => c.category === cat), `Compliment category ${cat} is represented`);
}

// -------------------------------------------------------------
// TEST 7: WONDERLAND OF 8 MINI-GAMES INTEGRITY
// -------------------------------------------------------------
assert(fs.existsSync(path.join(ROOT, 'src/components/WonderlandOfGames.jsx')), 'WonderlandOfGames component exists');
const gamesContent = fs.readFileSync(path.join(ROOT, 'src/components/WonderlandOfGames.jsx'), 'utf8');
const expectedGames = [
  'GameButterflies',
  'GameMemoryMatch',
  'GameMidnightStars',
  'GamePhotoPuzzle',
  'GameMarvelQuiz',
  'GameFlowerGarden',
  'GameEnvelopeHunt',
  'GameCakeDecorator'
];
for (const g of expectedGames) {
  assert(gamesContent.includes(g), `Mini-game ${g} implemented`);
}

// -------------------------------------------------------------
// TEST 8: COUNTDOWN EMAIL SYSTEM (26 MILESTONES)
// -------------------------------------------------------------
assert(COUNTDOWN_MILESTONES.length === 26, `Exactly 26 milestones defined in countdown engine (found: ${COUNTDOWN_MILESTONES.length})`);

// Verify 24 hours / 1 day deduplication rule
const oneDayMilestones = COUNTDOWN_MILESTONES.filter(m => m.id === '24-hours' || m.id === '1-day');
assert(oneDayMilestones.length === 1, '24-hours and 1-day are deduplicated into a single milestone');

// Verify all minute milestones
for (let min = 9; min >= 1; min--) {
  const milestoneId = `${min}-minutes` === '1-minutes' ? '1-minute' : `${min}-minutes`;
  assert(COUNTDOWN_MILESTONES.some(m => m.id === milestoneId), `Minute milestone ${milestoneId} exists`);
}

// Verify unlock milestone
const unlockMilestone = COUNTDOWN_MILESTONES.find(m => m.id === '0-midnight');
assert(unlockMilestone && unlockMilestone.isCritical, '0-midnight unlock milestone exists and is critical');

// Test email HTML rendering
const sampleHtml = renderEmailHtml({
  milestone: COUNTDOWN_MILESTONES[0],
  recipientEmail: 'ammu@example.com',
  baseUrl: 'https://ammu-birthday.vercel.app',
  unsubscribeToken: 'test-token-123'
});
assert(sampleHtml.includes('ammu@example.com') === false, 'Recipient email not leaked in cleartext body');
assert(sampleHtml.includes('unsubscribe?token=test-token-123'), 'Unsubscribe token link included in email');
assert(sampleHtml.includes('Ashuuuuuuuuuuu 💗'), 'Ashu signature included in email');

// Test idempotency key generator
const key1 = getJobIdempotencyKey('24-hours', 'ammu@example.com');
const key2 = getJobIdempotencyKey('24-hours', 'AMMU@EXAMPLE.COM');
assert(key1 === key2, 'Idempotency key is case-insensitive for recipient email');

// -------------------------------------------------------------
// TEST 9: ADMIN STUDIO CAPABILITIES & STRICT PREVIEW REMOVAL
// -------------------------------------------------------------
const adminJsx = fs.readFileSync(path.join(screensDir, 'AdminDashboard.jsx'), 'utf8');
assert(!adminJsx.includes('data-section={"previewuniverse"}'), 'Preview Birthday Universe removed from AdminDashboard navigation');
assert(!adminJsx.includes('/admin/preview'), '/admin/preview links removed from AdminDashboard');
assert(adminJsx.includes('data-section={"flyingnotes"}'), 'Admin navigation contains Flying Love Notes');
assert(adminJsx.includes('data-section={"mailstudio"}'), 'Admin navigation contains Countdown Mail Studio');

const adminJs = fs.readFileSync(path.join(ROOT, 'public/js/admin.js'), 'utf8');
assert(!adminJs.includes('renderPreviewUniverse'), 'renderPreviewUniverse handler completely removed from admin.js');
assert(adminJs.includes('renderFlyingNotesAdmin'), 'renderFlyingNotesAdmin handler in admin.js');
assert(adminJs.includes('renderMailStudioAdmin'), 'renderMailStudioAdmin handler in admin.js');

// -------------------------------------------------------------
// TEST 10: DATABASE MIGRATION & DEPLOYMENT SPECS
// -------------------------------------------------------------
assert(fs.existsSync(path.join(ROOT, 'supabase/migrations/20261115000000_v16_birthday_tables.sql')), 'Supabase SQL migration exists');
const sqlContent = fs.readFileSync(path.join(ROOT, 'supabase/migrations/20261115000000_v16_birthday_tables.sql'), 'utf8');
assert(sqlContent.includes('CREATE TABLE IF NOT EXISTS countdown_subscriptions'), 'SQL defines countdown_subscriptions table');
assert(sqlContent.includes('CREATE TABLE IF NOT EXISTS countdown_email_jobs'), 'SQL defines countdown_email_jobs table');
assert(fs.existsSync(path.join(ROOT, 'docs/DEPLOYMENT_GUIDE.md')), 'DEPLOYMENT_GUIDE.md exists');
assert(fs.existsSync(path.join(ROOT, 'vercel.json')), 'vercel.json exists');

console.log(`\n======================================================`);
console.log(`  ALL ${passedTests} / ${totalTests} V16 VERIFICATION TESTS PASSED SUCCESSFULLY!  `);
console.log(`======================================================\n`);
