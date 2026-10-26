/** Ammu Birthday World. Standalone Node API + compiled React asset hosting. Node >=20.19. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const ROOT=path.dirname(fileURLToPath(import.meta.url));
// Optional, dependency-free .env support: no secrets are checked into the archive.
const envfile=path.join(ROOT,'.env');
if(fs.existsSync(envfile))for(const line of fs.readFileSync(envfile,'utf8').split(/\r?\n/)){
  const m=line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
  if(m&&!Object.hasOwn(process.env,m[1])&&m[2])process.env[m[1]]=m[2].replace(/^(["'])(.*)\1$/,'$2');
}

const PUB=path.join(ROOT,'public'), DBPATH=path.join(ROOT,'data/db.json'), SITEPATH=path.join(ROOT,'data/site.json');
const PORT=Number(process.env.PORT||4173);const HOST=process.env.HOST||'127.0.0.1';
const ENVFILE=path.join(ROOT,'config.local.json');let fileConfig={};try{fileConfig=JSON.parse(fs.readFileSync(ENVFILE,'utf8'))}catch{
  fileConfig={ADMIN_PASSWORD:crypto.randomBytes(18).toString('base64url'),PREVIEW_CODE:crypto.randomBytes(9).toString('base64url'),SESSION_SECRET:crypto.randomBytes(32).toString('hex'),ASHU_EMAIL:'',AMMU_EMAIL:'',EMAIL_FROM:'',RESEND_API_KEY:'',DEMO_MODE:'1',COOKIE_SECURE:'0'};
  fs.writeFileSync(ENVFILE,JSON.stringify(fileConfig,null,2),{mode:0o600});
  console.log('\nFIRST-RUN SETUP (KEEP PRIVATE)\nAdmin password:',fileConfig.ADMIN_PASSWORD,'\nPreview code:',fileConfig.PREVIEW_CODE,'\nSaved in config.local.json. Change before going live.\n');
}
const env=(k,def='')=>process.env[k]||fileConfig[k]||def;
const ADMIN_PASSWORD=env('ADMIN_PASSWORD'), PREVIEW_CODE=env('PREVIEW_CODE'), SECRET=env('SESSION_SECRET',crypto.randomBytes(32).toString('hex'));
const ASHU_EMAIL=env('ASHU_EMAIL'),AMMU_EMAIL=env('AMMU_EMAIL'), EMAIL_FROM=env('EMAIL_FROM'),RESEND_API_KEY=env('RESEND_API_KEY');
const LOCAL_DEMO=env('DEMO_MODE','1')==='1'&&HOST==='127.0.0.1';
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8')); let site=readJson(SITEPATH),db=readJson(DBPATH);
if(!Array.isArray(db.checkins))db.checkins=[];
if(!Array.isArray(db.reminderLogs))db.reminderLogs=[];
const birthdayStart='2026-10-26',birthdayEnd='2026-11-17';
function istDay(t=Date.now()){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(t));const v=Object.fromEntries(parts.map(x=>[x.type,x.value]));return `${v.year}-${v.month}-${v.day}`}
function ensureVisitor(req,res){const token=cookies(req).ammu_visitor;const valid=token?verify(token):null;if(valid?.role==='visitor'&&valid.id)return valid.id;const id=crypto.randomUUID();const signed=sign({role:'visitor',id,exp:Date.now()+365*86400000});res.setHeader('Set-Cookie',`ammu_visitor=${signed}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000; ${env('COOKIE_SECURE')==='1'?'Secure; ':''}`);return id}

const writeAtomic=(p,v)=>{let temp=p+'.'+crypto.randomUUID()+'.tmp';fs.writeFileSync(temp,JSON.stringify(v,null,2),'utf8');fs.renameSync(temp,p)};
const saveDB=()=>writeAtomic(DBPATH,db),saveSite=()=>writeAtomic(SITEPATH,site);
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.mp3':'audio/mpeg'};
function send(res,status,data){const body=JSON.stringify(data);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(body)}
function getBody(req){return new Promise((resolve,reject)=>{let chunks=[],size=0;req.on('data',c=>{size+=c.length;if(size>7e6){reject(Object.assign(new Error('Payload too large'),{status:413}));req.destroy()}else chunks.push(c)});req.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}'))}catch{reject(Object.assign(new Error('Invalid JSON'),{status:400}))}});req.on('error',reject)})}
function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').filter(Boolean).map(x=>{let i=x.indexOf('=');return[x.slice(0,i).trim(),decodeURIComponent(x.slice(i+1))]}))}
function sign(payload){let value=Buffer.from(JSON.stringify(payload)).toString('base64url');return value+'.'+crypto.createHmac('sha256',SECRET).update(value).digest('base64url')}
function verify(value){try{let [p,s]=value.split('.');let expected=crypto.createHmac('sha256',SECRET).update(p).digest('base64url');if(!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(expected)))return null;let obj=JSON.parse(Buffer.from(p,'base64url').toString());return obj.exp>Date.now()?obj:null}catch{return null}}
function session(req){return verify(cookies(req).ammu_session||'')}
function attachSession(res,role){const token=sign({role,exp:Date.now()+1000*60*60*(role==='admin'?10:72)});res.setHeader('Set-Cookie',`ammu_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${role==='admin'?36000:259200}; ${env('COOKIE_SECURE')==='1'?'Secure; ':''}`)}
function isOpen(req){return LOCAL_DEMO||Date.now()>=Date.parse(site.birthdayDate)||['admin','preview'].includes(session(req)?.role)}
function admin(req){return session(req)?.role==='admin'}
const error=(status,message)=>Object.assign(new Error(message),{status});
const attempts=new Map();function throttle(req,key,limit=25,interval=60000){const ip=req.socket.remoteAddress||'anon',id=ip+'|'+key,t=Date.now();let a=attempts.get(id)||[];a=a.filter(x=>x>t-interval);if(a.length>=limit)throw error(429,'Too many attempts. Please try again later.');a.push(t);attempts.set(id,a)}
function cleanStr(v,max=1500){return String(v??'').trim().slice(0,max)}
function sameOrigin(req){let origin=req.headers.origin;if(!origin)return;let host=req.headers.host;if(new URL(origin).host!==host)throw error(403,'Cross-origin request blocked')}
function limitedData(){return{birthdayDate:site.birthdayDate,serverTime:new Date().toISOString(),open:false,localDemo:LOCAL_DEMO,heroImage:null}}
function logEvent(type,detail={}){db.events.unshift({id:crypto.randomUUID(),type,detail,createdAt:new Date().toISOString()});db.events=db.events.slice(0,500)}
async function mail(to,subject,html){const entry={id:crypto.randomUUID(),to:to||'(unconfigured)',subject,status:'pending',at:new Date().toISOString()};db.notifications.unshift(entry);db.notifications=db.notifications.slice(0,500);if(!to||!RESEND_API_KEY||!EMAIL_FROM){entry.status='not_configured';return false}try{const resp=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:EMAIL_FROM,to:[to],subject,html})});if(!resp.ok)throw new Error('Email provider status '+resp.status);entry.status='sent';return true}catch(e){entry.status='failed';entry.error=String(e.message).slice(0,200);return false}}
const escapeHtml=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const emailHtml=(title,body)=>`<div style="font-family:Georgia,serif;background:#fff4f7;padding:30px;color:#673148"><h1>${escapeHtml(title)}</h1>${body}</div>`;
function customerOrder(o){let {otpHash,otpExpires,otpTries,verificationCode,...safe}=o;return safe}
function findOrder(req,id,token){let o=db.orders.find(o=>o.id===id);if(!o||(!admin(req)&&o.trackToken!==token))throw error(404,'Order not found');return o}
const shortId=()=>Math.random().toString(36).slice(2,5).toUpperCase()+Date.now().toString(36).toUpperCase().slice(-7);
async function api(req,res,pathname,url){sameOrigin(req);let method=req.method;const body=['POST','PUT','PATCH','DELETE'].includes(method)?await getBody(req):{};
 if(pathname==='/api/checkin/status'&&method==='GET'){
  const visitor=ensureVisitor(req,res),today=istDay(),checkedDates=db.checkins.filter(c=>c.visitor===visitor).map(c=>c.day);
  return send(res,200,{today,serverTime:new Date().toISOString(),checkedToday:checkedDates.includes(today),checkedDates});
 }
 if(pathname==='/api/checkin'&&method==='POST'){
  throttle(req,'checkin',8,3600000);const visitor=ensureVisitor(req,res),day=istDay();
  if(day<birthdayStart||day>birthdayEnd)throw error(400,'Daily check-in is outside the birthday calendar dates');
  if(db.checkins.some(c=>c.visitor===visitor&&c.day===day))return send(res,200,{ok:true,alreadyCollected:true,day});
  db.checkins.push({visitor,day,createdAt:new Date().toISOString()});logEvent('checkin.completed',{day});saveDB();
  return send(res,201,{ok:true,day,alreadyCollected:false});
 }
 if(pathname==='/api/cron/daily'&&method==='POST'){
  const expected=env('CRON_SECRET');if(!expected||req.headers.authorization!==`Bearer ${expected}`)throw error(401,'Cron authentication required');
  if(env('REMINDERS_ENABLED')!=='1'||env('REMINDER_CONSENT')!=='1')return send(res,200,{ok:true,skipped:'notifications_disabled'});
  const day=istDay();if(day<birthdayStart||day>=birthdayEnd)return send(res,200,{ok:true,skipped:'outside_schedule'});
  const dedupe=`daily:${day}:${AMMU_EMAIL}`;if(db.reminderLogs.some(x=>x.key===dedupe))return send(res,200,{ok:true,skipped:'already_sent'});
  if(!AMMU_EMAIL||!RESEND_API_KEY||!EMAIL_FROM)throw error(503,'Resend recipient or credentials not configured');
  // Reminders are opt-in. The scheduler must run the route at the chosen IST time.
  const remaining=Math.ceil((Date.parse(site.birthdayDate)-Date.now())/86400000);
  const msg=emailHtml(`Ammuuu, ${remaining} days to your birthday 💗`,`<p>Good morning, Pottiiiiiiii! A little flower is waiting in your birthday calendar.</p><p>${remaining} days until your special day.</p><p><a href="${escapeHtml(env('PUBLIC_URL',''))}">Collect today's flower 🌸</a></p><p>To stop reminders, ask Ashu to disable reminders in the configuration.</p>`);
  const delivered=await mail(AMMU_EMAIL,`🌸 Ammuuuu, ${remaining} days to go!`,msg);if(!delivered)throw error(503,'Email provider could not send');
  db.reminderLogs.push({key:dedupe,createdAt:new Date().toISOString()});saveDB();return send(res,200,{ok:true,sent:1});
 }
 if(pathname==='/api/bootstrap'&&method==='GET'){return send(res,200,isOpen(req)?{...site,open:true,serverTime:new Date().toISOString(),localDemo:LOCAL_DEMO,adminConfigured:!!ADMIN_PASSWORD,recipientConfigured:!!AMMU_EMAIL,emailConfigured:!!RESEND_API_KEY}:{...limitedData(),adminConfigured:!!ADMIN_PASSWORD})}
 if(pathname==='/api/preview')throw error(404,'Public preview is not available');
 if(pathname==='/api/admin/login'&&method==='POST'){throttle(req,'admin_login',6,15*60000);if(!ADMIN_PASSWORD)throw error(503,'Admin password is not configured. Set it in config.local.json.');let test=Buffer.from(cleanStr(body.password,200)),expected=Buffer.from(ADMIN_PASSWORD);if(test.length!==expected.length||!crypto.timingSafeEqual(test,expected))throw error(401,'Incorrect password');attachSession(res,'admin');logEvent('admin.login');saveDB();return send(res,200,{ok:true})}
 if(pathname==='/api/admin/logout'&&method==='POST'){res.setHeader('Set-Cookie','ammu_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');return send(res,200,{ok:true})}
 if(pathname==='/api/admin/session'&&method==='GET')return send(res,200,{authenticated:admin(req),adminConfigured:!!ADMIN_PASSWORD});
 if(pathname.startsWith('/api/admin/')){if(!admin(req))throw error(401,'Admin login required');
  const adminOTP=pathname.match(/^\/api\/admin\/orders\/([^/]+)\/otp\/(request|verify)$/);
  if(adminOTP&&method==='POST'){
    const order=db.orders.find(x=>x.id===adminOTP[1]);
    if(!order)throw error(404,'Order not found');
    if(adminOTP[2]==='request'){
      throttle(req,'admin-otp-request-'+order.id,3,30*60000);
      if(!AMMU_EMAIL||!RESEND_API_KEY||!EMAIL_FROM)throw error(503,'Configure a verified Ammu email and Resend sender first');
      if(!['out_for_delivery','awaiting_verification'].includes(order.status))throw error(400,'Order must be out for delivery first');
      const code=String(crypto.randomInt(100000,1000000));
      order.otpHash=crypto.createHmac('sha256',SECRET).update(order.id+'|'+code).digest('hex');
      order.otpExpires=Date.now()+10*60*1000;order.otpTries=0;
      const sent=await mail(AMMU_EMAIL,'Your birthday gift delivery code 💗',emailHtml('A little delivery confirmation',`<p>Ammuuu, your six-digit code is <strong>${code}</strong>. It expires in 10 minutes.</p><p>Only share it with Ashu if your present really arrived.</p>`));
      if(!sent){order.otpHash=null;saveDB();throw error(503,'Delivery email could not be sent')}
      order.status='awaiting_verification';order.updatedAt=new Date().toISOString();saveDB();
      return send(res,200,{ok:true,message:'Verification email sent to Ammu'});
    }
    throttle(req,'admin-otp-verify-'+order.id,5,15*60000);
    if(!/^\d{6}$/.test(cleanStr(body.code,20)))throw error(400,'Enter exactly six digits');
    if(!order.otpHash||Date.now()>order.otpExpires)throw error(400,'Code expired or not requested');
    if(order.otpTries>=5)throw error(429,'Too many attempts');
    order.otpTries++;
    const check=crypto.createHmac('sha256',SECRET).update(order.id+'|'+body.code).digest('hex');
    if(!crypto.timingSafeEqual(Buffer.from(check),Buffer.from(order.otpHash))){saveDB();throw error(400,'Incorrect verification code')}
    order.status='delivered';order.otpHash=null;order.otpExpires=0;order.updatedAt=new Date().toISOString();
    logEvent('order.delivered',{id:order.id});saveDB();
    return send(res,200,{ok:true,order:customerOrder(order)});
  }

  if(pathname==='/api/admin/data'&&method==='GET')return send(res,200,{site,db:{...db,orders:db.orders.map(customerOrder)}});
  if(pathname==='/api/admin/site'&&method==='PUT'){
    const allowed=['title','heroTitle','sender','nickname','heroImage','birthdayDate','coupon','chapters','products','shopStages','gallery','letters','wishesFromAshu','pranks','vouchers','movies','stars','reasons','magazinePages','bestieCard','playlist'];
    for(let k of allowed)if(body[k]!==undefined){if(['chapters','products','shopStages','gallery','letters','wishesFromAshu','pranks','vouchers','movies','stars','reasons','magazinePages','playlist'].includes(k)){if(!Array.isArray(body[k])||body[k].length>300)throw error(400,k+' must be an array');site[k]=body[k]}else if(k==='bestieCard'){let c=body[k];if(!c||typeof c!=='object'||Array.isArray(c))throw error(400,'Invalid ID card settings');site[k]={name:cleanStr(c.name,100),nickname:cleanStr(c.nickname,100),number:cleanStr(c.number,40),photo:cleanStr(c.photo,300),issuedBy:cleanStr(c.issuedBy,100),perks:(Array.isArray(c.perks)?c.perks.slice(0,10):[]).map(x=>cleanStr(x,160))}}else site[k]=cleanStr(body[k],2000)}
    saveSite();logEvent('site.updated');saveDB();return send(res,200,{ok:true})}
  if(pathname==='/api/admin/upload'&&method==='POST'){
    let bin=Buffer.from(cleanStr(body.base64,6e6).replace(/^data:[^,]+,/,'') ,'base64');if(!bin.length||bin.length>4e6)throw error(400,'Image must be 4MB or less');let png=bin.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));let jpg=bin[0]===255&&bin[1]===216&&bin[2]===255;if(!png&&!jpg)throw error(400,'Only JPG and PNG supported');const filename=crypto.randomUUID()+(png?'.png':'.jpg');fs.mkdirSync(path.join(PUB,'assets/uploads'),{recursive:true});fs.writeFileSync(path.join(PUB,'assets/uploads',filename),bin);return send(res,200,{url:'/assets/uploads/'+filename})}
  let match=pathname.match(/^\/api\/admin\/orders\/([^/]+)$/);
  if(match&&method==='PUT'){let o=db.orders.find(x=>x.id===match[1]);if(!o)throw error(404,'Order not found');let stages=['placed','processing','shipped','out_for_delivery','awaiting_verification'];if(!stages.includes(body.status))throw error(400,'Delivered requires recipient OTP verification');o.status=body.status;o.note=cleanStr(body.note,450);o.updatedAt=new Date().toISOString();logEvent('order.status',{id:o.id,status:o.status});await mail(AMMU_EMAIL,`Your gift request is ${o.status.replaceAll('_',' ')}`,emailHtml('A little gift update 💗',`<p>Gift request ${escapeHtml(o.id)}: ${escapeHtml(o.status)}</p><p>${escapeHtml(o.note)}</p>`));saveDB();return send(res,200,{order:customerOrder(o)})}
 }
 if(!isOpen(req))throw error(403,'Birthday surprise is still locked');
 if(pathname==='/api/wishes'&&method==='POST'){throttle(req,'wishes',6,60*60000);const values=[body.wish1,body.wish2,body.wish3,body.change,body.improve].map(v=>cleanStr(v,1200));if(!values.some(Boolean))throw error(400,'Write at least one answer');const w={id:shortId(),answers:values,createdAt:new Date().toISOString()};db.wishes.unshift(w);logEvent('wishes.submitted',{id:w.id});const html=emailHtml('A little note from Ammu',values.map((t,i)=>`<p><b>${['Wish 1','Wish 2','Wish 3','What to change','How to improve'][i]}:</b> ${escapeHtml(t)||'(skipped)'}</p>`).join(''));const emailed=await mail(ASHU_EMAIL,'💌 Three Little Wishes From Ammu',html);saveDB();return send(res,201,{ok:true,id:w.id,saved:true,emailStatus:emailed?'sent':'pending_configuration'})}
 if(pathname==='/api/membership'&&method==='POST'){throttle(req,'membership',30);let id=cleanStr(body.id,80);if(!site.vouchers.some(v=>v.id===id))throw error(400,'Unknown voucher');db.memberships.push({id:shortId(),voucher:id,claimedAt:new Date().toISOString()});await mail(ASHU_EMAIL,'💗 Pottiiiiiiii claimed a voucher',emailHtml('Voucher claimed!',`<p>${escapeHtml(id)}</p>`));saveDB();return send(res,201,{ok:true})}
 if(pathname==='/api/orders'&&method==='POST'){
   throttle(req,'orders',5,60*60000);
   let reqItems=Array.isArray(body.items)?body.items:[];if(!reqItems.length||reqItems.length>45)throw error(400,'Select at least one gift');
   let items=reqItems.map(x=>{let p=site.products.find(p=>p.id===x.id&&p.active);if(!p)throw error(400,'Unknown or unavailable product');let qty=Math.min(4,Math.max(1,Number(x.qty)||1));return{id:p.id,name:p.name,qty,tokens:p.tokens,unit:p.unit,image:p.image}});
   let discount=cleanStr(body.coupon,80).toUpperCase()===site.coupon.toUpperCase();if(!discount)throw error(400,'Apply your POTTI1703 gift coupon before completing checkout');
   let recipient=cleanStr(body.name,100)||'Ammu';let email=cleanStr(body.email,200);if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw error(400,'Invalid email');
   const order={id:'POTTI-'+shortId(),trackToken:crypto.randomBytes(24).toString('hex'),recipient,email,items,coupon:site.coupon,total:'0.00',status:'placed',note:'Your gift wishes are with Ashu',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),otpHash:null,otpExpires:0,otpTries:0};db.orders.unshift(order);logEvent('order.placed',{id:order.id});
   let content=emailHtml('Ammu placed a gift request',`<p>Request: ${escapeHtml(order.id)}</p><ul>${items.map(i=>`<li>${escapeHtml(i.name)} (${i.qty})</li>`).join('')}</ul><p>Symbolic price after coupon: 0.00</p>`);
   const a=await mail(ASHU_EMAIL,'🎁 New gift request from Ammu',content);
   const b=await mail(AMMU_EMAIL,'🎀 Your gift request is confirmed',content);
   saveDB();return send(res,201,{order:customerOrder(order),emailStatus:{ashu:a?'sent':'pending',ammu:b?'sent':'pending'}})}
 const tracking=pathname.match(/^\/api\/orders\/([^/]+)(?:\/(otp\/request|otp\/verify))?$/);
 if(tracking){let o=findOrder(req,tracking[1],url.searchParams.get('token')||cleanStr(body.token,100));
  if(!tracking[2]&&method==='GET')return send(res,200,{order:customerOrder(o)});
  if(tracking[2]&&method==='POST')throw error(403,'Only Ashu can request or verify delivery in the private Studio');
  if(tracking[2]==='otp/request'&&method==='POST'){throttle(req,'otp'+o.id,3,30*60000);if(!AMMU_EMAIL||!RESEND_API_KEY||!EMAIL_FROM)throw error(503,'Ammu email verification is not configured yet');if(!['out_for_delivery','awaiting_verification'].includes(o.status))throw error(400,'Gift not ready for delivery verification');const code=String(crypto.randomInt(100000,1000000));o.otpHash=crypto.createHmac('sha256',SECRET).update(o.id+'|'+code).digest('hex');o.otpExpires=Date.now()+10*60*1000;o.otpTries=0;const sent=await mail(AMMU_EMAIL,'🔐 Your secret gift delivery code',emailHtml('Ammuu, delivery verification 💗',`<p>Your code is <b>${code}</b>. Valid for 10 minutes. Do not share it in chat.</p>`));if(!sent){o.otpHash=null;saveDB();throw error(503,'Could not send the delivery code. Try later.')}o.status='awaiting_verification';saveDB();return send(res,200,{ok:true,message:'Code sent to Ammu’s configured email'})}
  if(tracking[2]==='otp/verify'&&method==='POST'){throttle(req,'verify'+o.id,5,15*60000);if(!o.otpHash||Date.now()>o.otpExpires)throw error(400,'Code expired or not requested');if(o.otpTries>=5)throw error(429,'Too many incorrect codes');o.otpTries++;const got=crypto.createHmac('sha256',SECRET).update(o.id+'|'+cleanStr(body.code,10)).digest('hex');if(!crypto.timingSafeEqual(Buffer.from(got),Buffer.from(o.otpHash))){saveDB();throw error(400,'Incorrect verification code')}o.status='delivered';o.otpHash=null;o.otpExpires=0;o.updatedAt=new Date().toISOString();logEvent('order.delivered',{id:o.id});await mail(ASHU_EMAIL,'🎉 Gift delivery verified',emailHtml('Delivery completed',`<p>Ammu verified gift request ${escapeHtml(o.id)}.</p>`));saveDB();return send(res,200,{ok:true,order:customerOrder(o)})}
 }
 throw error(404,'API route not found');}
function file(req,res,pathname){
 let p=decodeURIComponent(pathname);
 if(p==='/'||p==='/index.html'||p==='/admin'||p==='/admin/'||p==='/my-lovely-ammu'||p==='/my-lovely-ammu/'||p==='/for-ammu'||p==='/for-ammu/')p='/index.html';
 if(p.includes('..')||p.startsWith('/data/')||p.startsWith('/src/')||p.includes('config.local'))return send(res,403,{error:'Forbidden'});
 if((p.startsWith('/assets/photos/')||p.startsWith('/assets/dream-gifts/')||p.startsWith('/assets/products/')||p.startsWith('/assets/music/')||p.startsWith('/assets/uploads/'))&&!isOpen(req))return send(res,403,{error:'Locked until birthday'});
 const built=path.join(ROOT,'dist');
 // In production serve bundled React; user-uploaded images still resolve from public.
 const candidates=[...(fs.existsSync(path.join(built,'index.html'))?[built]:[]),PUB];
 const filePath=candidates.map(dir=>path.resolve(dir,'.'+p)).find(full=>candidates.some(dir=>full.startsWith(dir+path.sep))&&fs.existsSync(full)&&fs.statSync(full).isFile());
 if(!filePath)return send(res,404,{error:'Not found. Run npm install and npm run build for the React website.'});
 res.writeHead(200,{'Content-Type':MIME[path.extname(filePath)]||'application/octet-stream','Cache-Control':p.startsWith('/assets/')?'public,max-age=3600':'no-cache','X-Content-Type-Options':'nosniff'});
 fs.createReadStream(filePath).pipe(res);
}

const server=http.createServer(async(req,res)=>{try{let u=new URL(req.url,'http://local');if(u.pathname.startsWith('/api/'))return await api(req,res,u.pathname,u);if(req.method!=='GET'&&req.method!=='HEAD')throw error(405,'Method not allowed');file(req,res,u.pathname)}catch(e){if(!res.headersSent)send(res,e.status||500,{error:e.status?e.message:'Server error',detail:env('DEBUG')==='1'?String(e.stack):undefined});if(!e.status)console.error(e)}});
server.listen(PORT,HOST,()=>console.log(`Ammu's Birthday World running at http://${HOST}:${PORT}\nLocal demo: ${LOCAL_DEMO?'enabled':'disabled'} | Admin: ${ADMIN_PASSWORD?'configured':'not configured'} | Email: ${RESEND_API_KEY?'configured':'not configured'}`));
