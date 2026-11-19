// Verifies the scroll-story layout: every chapter and key interaction target exists,
// the legacy layer is gone, and no shopping remnants came back.
import fs from 'node:fs';
import path from 'node:path';

const base = process.cwd();
const storyDir = path.join(base, 'src/story');
const storyFiles = fs.readdirSync(storyDir).filter(x => x.endsWith('.jsx'));
const source = storyFiles.map(x => fs.readFileSync(path.join(storyDir, x), 'utf8')).join('\n');
const fail = msg => { console.error(msg); process.exit(1); };

// 16 chapters, in order, registered with the chapter dock
const app = fs.readFileSync(path.join(storyDir, 'StoryApp.jsx'), 'utf8');
const chapterIds = [...app.matchAll(/\{id: '([a-z-]+)', icon:/g)].map(m => m[1]);
const expected = ['home', 'journey', 'memories', 'magazine', 'bestie-id', 'letters', 'playlist', 'wishes', 'cake', 'gifts', 'movies', 'midnight', 'games', 'little-things', 'certificates', 'finale'];
if (chapterIds.join() !== expected.join()) fail(`Chapter list mismatch: ${chapterIds.join(', ')}`);
const missingSections = expected.filter(id => !source.includes(`id="${id}"`));
if (missingSections.length) fail(`Chapters missing their section ids: ${missingSections.join(', ')}`);

// interaction targets
const targets = ['magazine-book', 'bestie-card', 'cake-canvas', 'pranks', 'memberships', 'membership-complete-card', 'keep-memories-btn', 'open-slap-ashu-btn'];
const missingTargets = targets.filter(t => !source.includes(`id="${t}"`) && !source.includes(`'${t}'`));
if (missingTargets.length) fail(`Missing interaction targets: ${missingTargets.join(', ')}`);

// admin screens still present
const screens = path.join(base, 'src/screens');
for (const f of ['AdminLogin.jsx', 'AdminDashboard.jsx', 'AdminEditor.jsx']) if (!fs.existsSync(path.join(screens, f))) fail(`Admin screen missing: ${f}`);
const adminSource = ['AdminLogin.jsx', 'AdminDashboard.jsx'].map(f => fs.readFileSync(path.join(screens, f), 'utf8')).join('\n');
for (const t of ['admin-login', 'dashboard']) if (!adminSource.includes(`id={"${t}"}`) && !adminSource.includes(`id="${t}"`)) fail(`Admin target missing: ${t}`);
if (adminSource.includes('data-tab="products"') || adminSource.includes('data-tab="orders"')) fail('AdminDashboard still contains products or orders tabs');

// legacy layer removed
const legacy = ['public/js/app.js', 'public/js/experience.js', 'public/js/keepsakes.js', 'public/js/cake3d.js', 'public/css/style.css', 'src/screens/SectionHome.jsx'];
const stillThere = legacy.filter(f => fs.existsSync(path.join(base, f)));
if (stillThere.length) fail(`Legacy files should be removed: ${stillThere.join(', ')}`);

// no shopping remnants
const site = JSON.parse(fs.readFileSync(path.join(base, 'data/site.json'), 'utf8'));
if (site.coupon !== undefined || site.products !== undefined || site.shopStages !== undefined) fail('site.json still contains shopping keys');
if (JSON.stringify(site).includes('POTTI1703')) fail('site.json still contains coupon code POTTI1703');
if (/#shop|nav-cart/.test(source)) fail('Story still links to the removed shop');

console.log(`Scroll-story layout check passed: ${chapterIds.length} chapters, ${storyFiles.length} story components, ${targets.length} interaction targets verified.`);
