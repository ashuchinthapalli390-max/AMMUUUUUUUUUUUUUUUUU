import fs from 'node:fs';
import path from 'node:path';

const base = process.cwd();
const screens = path.join(base, 'src/screens');
const files = fs.readdirSync(screens).filter(x => x.endsWith('.jsx'));
const source = files.map(x => fs.readFileSync(path.join(screens, x), 'utf8')).join('\n') + fs.readFileSync(path.join(base, 'src/BirthdayApp.jsx'), 'utf8');

// Required layout targets without shopping components
const required = [
  'home', 'journey', 'memories', 'playlist', 'magazine', 'bestie-id', 'letters',
  'cake', 'wishes', 'gifts', 'pranks', 'memberships', 'games', 'certificates',
  'midnight', 'finale', 'gate', 'intro-stage', 'magazine-book', 'bestie-card',
  'cake-canvas', 'admin-login', 'dashboard', 'chapter-ui',
  'membership-complete-card', 'keep-memories-btn'
];

const missing = required.filter(x => !source.includes(`id={"${x}"}`) && !source.includes(`id="${x}"`));
if (missing.length) {
  console.error('Migration lost critical layout targets:', missing.join(', '));
  process.exit(1);
}

// Ensure deleted shopping components do not exist
const deletedComponents = ['SectionShop.jsx', 'SectionCart.jsx', 'SectionTracking.jsx', 'GiftPackingOverlay.jsx'];
const foundDeleted = deletedComponents.filter(f => fs.existsSync(path.join(screens, f)));
if (foundDeleted.length) {
  console.error('Shopping components should have been deleted:', foundDeleted.join(', '));
  process.exit(1);
}

// Verify experience.js chapters
const controller = fs.readFileSync(path.join(base, 'public/js/experience.js'), 'utf8');
const sceneMatch = controller.match(/const scenes=\[([^\]]+)\]/);
const sceneNames = sceneMatch?.[1]?.match(/'[^']+'/g)?.map(x => x.slice(1, -1)) || [];

if (sceneNames.length !== 18 || !sceneNames.includes('playlist')) {
  console.error('Expected exactly 18 chapters in page controller; found', sceneNames.length, 'scenes:', sceneNames);
  process.exit(1);
}

const forbiddenScenes = ['shop', 'cart', 'tracking'];
const presentForbidden = forbiddenScenes.filter(s => sceneNames.includes(s));
if (presentForbidden.length) {
  console.error('Shopping scenes still present in experience.js:', presentForbidden.join(', '));
  process.exit(1);
}

// Verify gifts section has exactly two cards
const giftsFile = fs.readFileSync(path.join(screens, 'SectionGifts.jsx'), 'utf8');
const giftCards = giftsFile.match(/data-gift=\{?"([^"}]+)"\}?/g) || [];
if (giftCards.length !== 2) {
  console.error('SectionGifts must have exactly 2 gift cards, found:', giftCards.length);
  process.exit(1);
}
if (!giftsFile.includes('Two Little Surprises') || !giftsFile.includes('Just For You 💗') || !giftsFile.includes('One to make you laugh, and one to remind you that Ashu is always on your side.')) {
  console.error('SectionGifts is missing required heading or subtitle');
  process.exit(1);
}

// Verify site.json has no shopping data or POTTI1703 coupon
const site = JSON.parse(fs.readFileSync(path.join(base, 'data/site.json'), 'utf8'));
if (site.coupon !== undefined || site.products !== undefined || site.shopStages !== undefined) {
  console.error('site.json still contains shopping keys (coupon, products, or shopStages)');
  process.exit(1);
}
const siteStr = JSON.stringify(site);
if (siteStr.includes('POTTI1703')) {
  console.error('site.json still contains coupon code POTTI1703');
  process.exit(1);
}

// Verify nav does not contain #shop link or #nav-cart button
const navFile = fs.readFileSync(path.join(screens, 'SectionOther2.jsx'), 'utf8');
if (navFile.includes('href="#shop"') || navFile.includes('id="nav-cart"') || navFile.includes('id={"nav-cart"}')) {
  console.error('Navigation still contains #shop link or #nav-cart button');
  process.exit(1);
}

// Verify admin dashboard does not have shopping tabs
const adminFile = fs.readFileSync(path.join(screens, 'AdminDashboard.jsx'), 'utf8');
if (adminFile.includes('data-tab="products"') || adminFile.includes('data-tab="orders"')) {
  console.error('AdminDashboard still contains products or orders tabs');
  process.exit(1);
}

console.log('React layout check passed: exactly', sceneNames.length, 'chapters,', files.length, 'JSX host components,', required.length, 'critical interaction targets verified.');
