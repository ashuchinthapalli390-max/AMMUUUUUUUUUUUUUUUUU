// Two local servers: trusted API on :4173 and React Vite dev server on :5173.
import {spawn} from 'node:child_process';
const npm=process.platform==='win32'?'npm.cmd':'npm';
let closing=false;
function launch(cmd,args,prefix,useShell=false){
  const p=spawn(cmd,args,{stdio:'inherit',env:{...process.env},shell:useShell});
  p.on('error',e=>console.error(prefix,e.message));
  return p;
}
const api=launch(process.execPath,['server.mjs'],'backend',false);
const vite=launch(npm,['run','client'],'vite',process.platform==='win32');
function shutdown(){if(closing)return;closing=true;try{api.kill()}catch{};try{vite.kill()}catch{};}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
console.log('\nReact website: http://127.0.0.1:5173');
console.log('Private admin: http://127.0.0.1:5173/admin');
console.log('API server: http://127.0.0.1:4173\n');
