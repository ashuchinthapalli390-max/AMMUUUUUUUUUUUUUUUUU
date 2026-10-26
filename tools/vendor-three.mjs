/** Optional: run after npm install three@0.170.0 --no-save to remove Three.js CDN dependency. */
import fs from 'node:fs';import path from 'node:path';import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const src=path.join(root,'node_modules/three/build'),out=path.join(root,'public/vendor');fs.mkdirSync(out,{recursive:true});
for(let f of ['three.module.js']){if(fs.existsSync(path.join(src,f))){fs.copyFileSync(path.join(src,f),path.join(out,f));console.log('Vendored',f)}}
console.log('Three.js is now local, and the cake works without an external CDN.');

