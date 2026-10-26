import fs from 'node:fs';
import path from 'node:path';
const base=process.cwd();
const screens=path.join(base,'src/screens');
const files=fs.readdirSync(screens).filter(x=>x.endsWith('.jsx'));
const source=files.map(x=>fs.readFileSync(path.join(screens,x),'utf8')).join('\n')+fs.readFileSync(path.join(base,'src/BirthdayApp.jsx'),'utf8');
const required=['home','journey','memories','playlist','magazine','bestie-id','letters','cake','wishes','gifts','pranks','memberships','shop','cart','tracking','games','certificates','midnight','finale','gate','intro-stage','magazine-book','bestie-card','cake-canvas','guide-products','admin-login','dashboard','chapter-ui'];
const missing=required.filter(x=>!source.includes(`id={"${x}"}`)&&!source.includes(`id="${x}"`));
const sections=files.filter(x=>x.startsWith('Section')&&/section/.test(fs.readFileSync(path.join(screens,x),'utf8').split('\n').slice(0,4).join('')));
if(missing.length){console.error('Migration lost original layout targets:',missing.join(', '));process.exit(1)}
const controller=fs.readFileSync(path.join(base,'public/js/experience.js'),'utf8');const sceneMatch=controller.match(/const scenes=\[([^\]]+)\]/);const sceneNames=sceneMatch?.[1]?.match(/'[^']+'/g)?.map(x=>x.slice(1,-1))||[];if(sceneNames.length<20 || !sceneNames.includes('playlist')){console.error('Missing or incomplete page controller; found',sceneNames.length,'scenes');process.exit(1)}
console.log('React layout check passed:',sceneNames.length,'chapters,',files.length,'JSX host components,',required.length,'critical interaction IDs');
