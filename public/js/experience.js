// Ammu cinematic chapter experience v2. Vanilla JS + GSAP progressive enhancement.
const $=q=>document.querySelector(q),$$=q=>[...document.querySelectorAll(q)];
const scenes=['home','journey','memories','magazine','bestie-id','letters','playlist','movies','midnight','games','little-things','certificates','wishes','cake','gifts','pranks','memberships','shop','cart','tracking','finale'];
let current=0,moving=false,started=false,wishStep=0,formStep=0,nightIndex=0,certificateIndex=0;
const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const chapterTitle={home:'Our Little Universe',journey:'Our Journey',memories:'Photographs & Memories',magazine:'The Birthday Magazine','bestie-id':'Bestie ID Card',letters:'Letters From Ashu',playlist:'A Beautiful Playlist For You',movies:'Our Cinema Archive',midnight:'The Midnight Universe',games:'Cute Games','little-things':'Tiny Beautiful Things',certificates:'The Certificate Gallery',wishes:'Three Birthday Wishes',cake:'3D Birthday Cake',gifts:'Three Special Gifts',pranks:'The Dream Gift Showroom',memberships:'Lifetime Vouchers',shop:'Potti Shopping World',cart:'Gift Request Checkout',tracking:'Gift Delivery Tracking',finale:'After Everything, Still Us'};
function actualScene(){return scenes[current]}
// v4: physical wheel scrolling is blocked inside the birthday experience.
// Page-sized storyboards are advanced by buttons and GSAP transitions only.
const pageState=new Map();
const pageSize=section=>Math.max(360,Math.round(section.clientHeight*.80));
function pageStops(section){
  if(!section)return [0];
  const max=Math.max(0,section.scrollHeight-section.clientHeight);
  if(max<55)return [0];
  const count=Math.ceil(max/pageSize(section));
  return Array.from({length:count+1},(_,i)=>Math.round(max*i/count));
}
function activePages(){return pageStops(document.getElementById(actualScene()))}
function getPage(){return pageState.get(actualScene())||0}
function refreshPageUI(){
 const pages=activePages(),page=Math.min(getPage(),pages.length-1);
 pageState.set(actualScene(),page);
 const currentPage=page+1;
 const name=chapterTitle[actualScene()];
 $('#chapter-label').textContent='';
 $('#chapter-progress-fill').style.width=(100*(current+1)/scenes.length)+'%';
 $('#chapter-previous').disabled=current===0 && page===0;
 $('#chapter-next').disabled=current===scenes.length-1 && page===pages.length-1;
 $('#chapter-previous').textContent=page>0?'← Previous Page':'← Previous Chapter';
 $('#chapter-next').textContent=page<pages.length-1?'Turn Page →':'Next Chapter →';
 const dots=$('#chapter-page-dots');if(dots){
  dots.textContent='';pages.slice(0,18).forEach((_,i)=>{const button=document.createElement('button');button.type='button';button.className=i===page?'is-current':'';button.setAttribute('aria-label',`Page ${i+1}`);button.setAttribute('aria-current',i===page?'page':'false');button.onclick=()=>showPage(i);dots.appendChild(button)})
 }
}
function showPage(n,immediate=false){
 const section=document.getElementById(actualScene());if(!section||moving)return;
 const stops=pageStops(section),target=Math.max(0,Math.min(stops.length-1,n));
 const old=getPage();pageState.set(actualScene(),target);
 if(old===target && Math.abs(section.scrollTop-stops[target])<4){refreshPageUI();return}
 const wipe=$('#chapter-page-wipe');
 refreshPageUI();
 if(prefersReduced||immediate){section.scrollTop=stops[target];document.dispatchEvent(new CustomEvent('ammu:page-turn',{detail:{scene:actualScene(),page:target}}));return}
 moving=true;const gs=window.gsap;
 if(gs){
  const timeline=gs.timeline({onComplete:()=>{moving=false;refreshPageUI();document.dispatchEvent(new CustomEvent('ammu:page-turn',{detail:{scene:actualScene(),page:target}}))}});
  if(wipe)timeline.fromTo(wipe,{autoAlpha:0,xPercent:target>old?110:-110,rotate:-3},{autoAlpha:1,xPercent:0,rotate:0,duration:.35,ease:'power2.inOut'});
  timeline.to(section,{scrollTop:stops[target],duration:.10,ease:'none'});
  if(wipe)timeline.to(wipe,{autoAlpha:0,xPercent:target>old?-110:110,rotate:3,duration:.55,ease:'power2.inOut'});
  else timeline.to(section,{opacity:1,duration:.55});
 }else{
   if(wipe)wipe.classList.add('turning');setTimeout(()=>{section.scrollTop=stops[target];setTimeout(()=>{wipe?.classList.remove('turning');moving=false;refreshPageUI();document.dispatchEvent(new CustomEvent('ammu:page-turn',{detail:{scene:actualScene(),page:target}}))},350)},350)
 }
}
function step(dir){
 const pages=activePages(),page=getPage();
 if(dir>0){if(page<pages.length-1)return showPage(page+1);goTo(scenes[Math.min(scenes.length-1,current+1)]);return}
 if(page>0)return showPage(page-1);
 goTo(scenes[Math.max(0,current-1)],false,true)
}
function prepareChapters(){
 if(started)return;started=true;document.body.classList.add('chapter-mode');$('#experience').classList.add('page-mode');$('#chapter-ui').hidden=false;
 scenes.forEach(id=>{let e=document.getElementById(id);if(e){e.classList.remove('chapter-active');$('#experience').appendChild(e)}});
 document.querySelectorAll('.site-nav a[href^="#"]').forEach(a=>{let id=a.getAttribute('href').slice(1);if(scenes.includes(id))a.addEventListener('click',ev=>{ev.preventDefault();goTo(id)})});
 document.body.addEventListener('click',ev=>{const a=ev.target.closest('#experience a[href^="#"]');if(!a)return;const id=a.getAttribute('href').slice(1);if(scenes.includes(id)){ev.preventDefault();goTo(id)}});
 $('#chapter-previous').onclick=()=>step(-1);$('#chapter-next').onclick=()=>step(1);
 window.addEventListener('keydown',e=>{if(!document.body.classList.contains('page-turn-mode')||!$('#intro-stage').hidden)return;
  if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)||document.querySelector('#gallery-lightbox:not([hidden]),#modal-backdrop:not([hidden])'))return;
  if(e.key==='PageDown'){e.preventDefault();step(1)}else if(e.key==='PageUp'){e.preventDefault();step(-1)}
 });
 // V8: scroll current chapter naturally before moving to another chapter.
 // A fresh wheel gesture at a real scroll edge changes the chapter, not leftover momentum.
 let edge=null,edgeAt=0,lastWheel=0,navigationCooldown=0;
 document.getElementById('experience').addEventListener('wheel',e=>{
  if(!document.body.classList.contains('chapter-mode')||moving)return;
  if(e.target.closest('canvas,textarea,input,select,.night-chat-log,.magazine-book,.modal-box,.guide-rail,[data-allow-scroll]'))return;
  if(document.querySelector('#modal-backdrop:not([hidden])')||!$('#intro-stage').hidden)return;
  const section=document.getElementById(actualScene());if(!section)return;
  const now=performance.now();const dir=e.deltaY>0?1:-1;
  const max=Math.max(0,section.scrollHeight-section.clientHeight);
  const atEnd=dir>0&&section.scrollTop>=max-3;
  const atStart=dir<0&&section.scrollTop<=3;
  if(!(atEnd||atStart)){edge=null;return} // Let this same wheel gesture finish scrolling naturally.
  e.preventDefault();
  const requested=dir>0?'bottom':'top';
  if(now<navigationCooldown)return;
  if(edge!==requested||now-lastWheel>1200){edge=requested;edgeAt=now;lastWheel=now;return}
  // Wait for momentum to stop, then require a second deliberate gesture.
  if(now-edgeAt<330){lastWheel=now;return}
  if(now-lastWheel<170){lastWheel=now;return}
  edge=null;lastWheel=now;navigationCooldown=now+1300;
  if(dir>0&&current<scenes.length-1)goTo(scenes[current+1]);
  if(dir<0&&current>0)goTo(scenes[current-1],false,true);
 },{passive:false,capture:true});
 window.addEventListener('resize',()=>refreshPageUI());
 window.ammuGo=goTo;window.ammuAdvance=()=>step(1);
 window.ammuRefreshPage=id=>{const elem=document.getElementById(id);if(!elem)return;pageState.set(id,0);elem.scrollTop=0;requestAnimationFrame(refreshPageUI)};
 window.ammuShowElement=el=>{const section=el?.closest('section.section');if(!section)return;if(section.id!==actualScene())return goTo(section.id);
  const stop=pageStops(section);const absY=section.scrollTop+el.getBoundingClientRect().top-section.getBoundingClientRect().top-80;const index=stop.reduce((best,v,i)=>Math.abs(v-absY)<Math.abs(stop[best]-absY)?i:best,0);showPage(index)
 };
 setupWishes();setupNight();setupCertificates();setupBonusGames();goTo('home',true);
}
function goTo(id,immediate=false,lastPage=false){
 if(!scenes.includes(id)||moving)return;
 const target=scenes.indexOf(id),old=document.getElementById(scenes[current]);
 if(target===current&&old?.classList.contains('chapter-active'))return showPage(0,immediate);
 const enter=()=>{
  old?.classList.remove('chapter-active');current=target;
  const next=document.getElementById(id);next.hidden=false;next.classList.add('chapter-active');
  next.scrollTop=0;pageState.set(id,0);
  document.querySelectorAll('.site-nav nav a').forEach(a=>a.classList.toggle('active-link',a.getAttribute('href')==='#'+id));
  history.replaceState(null,'','#'+id);animateContent(next);
  requestAnimationFrame(()=>{if(lastPage){const stops=pageStops(next);pageState.set(id,stops.length-1);next.scrollTop=stops[stops.length-1]}refreshPageUI()});
  document.dispatchEvent(new CustomEvent('ammu:chapter-change',{detail:{id,index:current,total:scenes.length}}));
 };
 if(!old?.classList.contains('chapter-active')||immediate||prefersReduced){enter();moving=false;return}
 moving=true;const gs=window.gsap,wipe=$('#scene-transition');
 if(gs&&wipe){gs.timeline({onComplete:()=>{wipe.style.visibility='hidden';wipe.style.transform='';moving=false;refreshPageUI()}})
  .set(wipe,{visibility:'visible',yPercent:105,rotate:2})
  .to(wipe,{yPercent:0,rotate:0,duration:.54,ease:'power4.inOut'})
  .add(()=>enter())
  .to(wipe,{yPercent:-106,rotate:-2,duration:.74,ease:'power3.inOut'})
  .set(wipe,{clearProps:'all'})
 }else{
   if(wipe)wipe.classList.add('turning');setTimeout(()=>{enter();setTimeout(()=>{wipe?.classList.remove('turning');moving=false;refreshPageUI()},470)},420)
 }
}
window.ammuGo=goTo;
function animateContent(section){
 const selectors='.section-top,.hero-copy,.hero-photo-wrap,.story-columns,.gallery-tabs,.gallery-card,.letter-envelope,.letter-sheet,.movie-ticket,.night-phone,.night-memory-details,.game-tabs,.game-board,.cert-types,.cert-main,.wishes-one-at-time,.wishes-form-wrap,.cake-studio,.gift-box-card,.prank-card,.membership-hero,.voucher,.shop-splash,.shop-guided,.cart-layout,.tracking-ticket,.final-letter,.liquid-storyboard-stage,.magazine-desk';
 const els=[...section.querySelectorAll(selectors)];
 els.forEach((el,i)=>{el.classList.add('entrance-item');el.style.setProperty('--stagger-delay',Math.min(i,12)*.085+'s')});
 const gs=window.gsap;
 if(gs&&!prefersReduced){gs.fromTo(els.filter(el=>el.getBoundingClientRect().top<window.innerHeight*.95).slice(0,18),{opacity:0,y:46,rotateX:5,scale:.97},{opacity:1,y:0,rotateX:0,scale:1,duration:.95,stagger:.105,ease:'back.out(1.18)',clearProps:'transform,opacity'})}
 let obs=new IntersectionObserver(entries=>{entries.forEach(en=>{if(en.isIntersecting){en.target.classList.add('is-visible');obs.unobserve(en.target)}})},{root:section,threshold:.07});
 section.querySelectorAll('.product-card,.story-paper,.magazine-book,.voucher,.night-message,.gallery-card').forEach(el=>{el.classList.add('quiet-reveal');obs.observe(el)});
 if(section.id==='wishes')showWish(wishStep);
 if(section.id==='midnight'&&nightIndex===0)renderNightPrompt();
}
document.addEventListener('ammu:open',()=>setTimeout(prepareChapters,80));
document.addEventListener('ammu:ready',()=>{if(!$('#experience').hidden)prepareChapters()});
function setupWishes(){const cards=$$('#ashu-wishes .wish-display');const labels=$$('#wishes-form label');const next=$('#wish-next-one'),wrap=$('#wish-form-panel'),formnext=$('#wish-form-next'),formback=$('#wish-form-back');if(!cards.length)return;
 next.addEventListener('click',()=>{if(wishStep<cards.length-1){wishStep++;showWish(wishStep)}else{next.hidden=true;wrap.hidden=false;wrap.classList.add('wizard-open');renderFormStep();window.ammuShowElement?.(wrap)}});
 formnext.addEventListener('click',()=>{if(formStep<labels.length-1){formStep++;renderFormStep()}else{wrap.classList.add('wizard-complete');$('#wish-form-progress').textContent='Review your wishes';$('#wish-form-back').hidden=false}});
 formback.addEventListener('click',()=>{wrap.classList.remove('wizard-complete');formStep=Math.max(0,formStep-1);renderFormStep()});
 $('#wish-maybe-later').addEventListener('click',()=>goTo('cake'));
 function renderFormStep(){labels.forEach((l,i)=>l.classList.toggle('wish-field-active',i===formStep));$('#wish-form-progress').textContent='Step '+(formStep+1)+' / '+labels.length;formnext.textContent=formStep===labels.length-1?'Review & Send →':'Next Question →';wrap.classList.remove('wizard-complete');formback.disabled=formStep===0;}
 renderFormStep()}
function showWish(i){const cards=$$('#ashu-wishes .wish-display');cards.forEach((c,j)=>c.classList.toggle('wish-active',j===i));$('#wish-sequence-label').textContent='Wish '+(i+1)+' / '+cards.length;$('#wish-next-one').textContent=i===cards.length-1?'Your Turn, Pottiiiiiiii →':'Read Next Wish →'}
// Night chat v2: staged, editable scene, memory prompts are paraphrases, never claimed as real transcripts.
const nights=[['11:58 PM','Ammu','From the CodeXa Girls group to this many conversations...','Ashu','Somehow we never run out of stories. 🌙'],['12:17 AM','Ashu','One more Marvel scene? Or one more anime episode?','Ammu','The Tony Stark conversation is never really finished! ✨'],['12:36 AM','Ammu','Did you see the reel I sent?','Ashu','I was literally about to send one too 😭'],['12:59 AM','Ashu','One more Discord movie night soon?','Ammu','And something fun to watch together 🍿'],['01:12 AM','Ashu','Remember the Spider-Man ticket drama?','Ammu','How could anybody forget THAT 😭'],['01:29 AM','Ammu','Next time, pani puri or waffles?','Ashu','Why not both? 🌮🧇'],['01:48 AM','Ashu','Even the little fights became stories.','Ammu','So many little memories to keep 💗'],['02:03 AM','Ashu','There are so many more memories ahead.','Ammu','Goodnight... or maybe one more story? 🌙']];
function setupNight(){$('#night-reveal').onclick=addNightMessage;$('#night-restart').onclick=()=>{nightIndex=0;$('#night-chat-log').innerHTML='';renderNightPrompt()};$('#star-random').addEventListener('click',()=>addNightMessage());$('#star-field').addEventListener('click',e=>{if(e.target.closest('.star-btn'))setTimeout(addNightMessage,240)});renderNightPrompt()}
function renderNightPrompt(){$('#night-progress').textContent=nightIndex+' / '+nights.length+' midnight memories';$('#night-reveal').textContent=nightIndex===nights.length?'Replay Our Night ↻':'Reveal Next Memory ✦';}
function addNightMessage(){if(nightIndex===nights.length){nightIndex=0;$('#night-chat-log').innerHTML=''}const [time,a,atext,b,btext]=nights[nightIndex];const note=window.ammuBirthdayConfig?.stars?.[nightIndex]||atext;nightIndex++;$('#midnight-clock').textContent=time;const log=$('#night-chat-log');log.insertAdjacentHTML('beforeend',`<div class="night-message"><small>${a}</small><div>${note}</div></div><div class="night-message right"><small>${b}</small><div>${btext}</div></div>`);log.scrollTop=log.scrollHeight;$('#night-typing').textContent='Inspired by memories, not private chat transcripts 💗';renderNightPrompt();}
// Professional printable designs, explicitly souvenir / not a credential.
const certs=[['Lifetime Bestie','CERTIFICATE OF ENDLESS FRIENDSHIP','For every memory, movie, midnight talk and silly fight.','💗'],['Birthday Royalty','OFFICIAL BIRTHDAY ROYALTY AWARD','Celebrating the extraordinary Ammuuuu and all the smiles she brings.','👑'],['Movie Marathon','HONORARY CINEMA COMPANION','For the legendary Irumudi first show, and every cinema ticket afterward.','🎟️'],['Midnight Star','THE AFTER-MIDNIGHT STORYTELLER','For conversations that made even the longest nights feel short.','🌙'],['Cute Chaos','LIFETIME CUTE CHAOS AWARD','For the little fights, funny faces, stickers and wonderful chaos.','🎀'],['Iron Man Fan','TONY STARK APPRECIATION MEDAL','For being the most devoted Iron Man fan in our little universe.','⚡']];
function setupCertificates(){let list=$('#cert-types');list.innerHTML=certs.map((x,i)=>`<button data-cert="${i}">${String(i+1).padStart(2,'0')} · ${x[0]}</button>`).join('');list.addEventListener('click',e=>{let b=e.target.closest('[data-cert]');if(!b)return;certificateIndex=+b.dataset.cert;renderCertificate()});$('#cert-next').onclick=()=>{certificateIndex=(certificateIndex+1)%certs.length;renderCertificate()};$('#cert-download').onclick=downloadProfessionalCertificate;renderCertificate()}
function renderCertificate(){let [name,title,description,emoji]=certs[certificateIndex];$('#cert-preview').innerHTML=`<div class="cert-overline">A LITTLE UNIVERSE · THE ASHU COLLECTION</div><div class="cert-icon">${emoji}</div><h3>${title}</h3><div class="cert-overline">THIS KEEPSAKE IS PRESENTED TO</div><div class="cert-name">Ammuuuuuuuu</div><p>${description}</p><div class="cert-seal">AWARDED<br>17 NOV<br>♡</div><div class="cert-signatures"><span>Presented by <b>Ashuuuuuuuuuuu</b></span><span>Lifetime validity ♡</span></div>`;$$('#cert-types button').forEach((b,i)=>b.classList.toggle('active',i===certificateIndex))}
function downloadProfessionalCertificate(){let c=document.createElement('canvas');c.width=1800;c.height=1270;let ctx=c.getContext('2d'),[name,title,description,emoji]=certs[certificateIndex];let grad=ctx.createLinearGradient(0,0,1800,1270);grad.addColorStop(0,'#fffaf0');grad.addColorStop(1,'#f8e9e6');ctx.fillStyle=grad;ctx.fillRect(0,0,1800,1270);ctx.strokeStyle='#ae8051';ctx.lineWidth=20;ctx.strokeRect(45,45,1710,1180);ctx.lineWidth=3;ctx.strokeRect(79,79,1642,1112);ctx.fillStyle='#77445a';ctx.textAlign='center';ctx.font='bold 28px Georgia';ctx.fillText('A LITTLE UNIVERSE   •   THE ASHU COLLECTION',900,206);ctx.font='66px Georgia';ctx.fillText(emoji,900,320);ctx.font='bold 65px Georgia';ctx.fillText(title,900,460);ctx.font='26px Arial';ctx.fillText('THIS COMMEMORATIVE CERTIFICATE IS PRESENTED TO',900,540);ctx.fillStyle='#a65a7a';ctx.font='bold 85px Georgia';ctx.fillText('Ammuuuuuuuu',900,662);ctx.font='31px Georgia';wrapCanvasText(ctx,description,900,740,1450,46);ctx.strokeStyle='#aa7f50';ctx.lineWidth=5;ctx.beginPath();ctx.arc(900,970,78,0,2*Math.PI);ctx.stroke();ctx.font='bold 25px Georgia';ctx.fillText('17 NOV',900,972);ctx.font='21px Georgia';ctx.fillText('WITH LOVE',900,1005);ctx.fillStyle='#75465b';ctx.font='26px Georgia';ctx.fillText('From Ashu                                      Lifetime keepsake · Not an official credential',900,1132);let a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='Ammu_'+name.replaceAll(' ','_')+'_Certificate.png';a.click()}
function wrapCanvasText(ctx,text,x,y,maxWidth,line){const words=text.split(' ');let ln='';for(let w of words){let t=ln+w+' ';if(ctx.measureText(t).width>maxWidth){ctx.fillText(ln,x,y);y+=line;ln=w+' '}else ln=t}ctx.fillText(ln,x,y)}
// Extra live games in the same existing interface. No React.
let bonus={pos:0,score:0,used:[],bouquet:[],clicks:0};
function setupBonusGames(){window.renderBonusGame=(mode,board,game)=>{if(!['butterflies','either','bouquet','reel','compliments'].includes(mode))return false;
 if(mode==='butterflies'){board.innerHTML=`<div class="game-progress">BUTTERFLY GARDEN · ${bonus.clicks}/12</div><h3>Catch the fluttering butterflies 🦋</h3><p>Collect twelve little butterflies to unlock a hug.</p><div class="hearts-field">${Array.from({length:12},(_,i)=>`<button data-butterfly="${i}" class="pop-heart" style="animation-delay:${(i*.13).toFixed(2)}s">🦋</button>`).join('')}</div>`;board.querySelectorAll('[data-butterfly]').forEach(b=>{b.disabled=bonus.used.includes(b.dataset.butterfly);if(b.disabled)b.style.opacity='.2';b.onclick=()=>{bonus.used.push(b.dataset.butterfly);bonus.clicks++;if(bonus.clicks>=12){board.innerHTML='<h3>Butterfly Queen Unlocked! 🦋👑</h3><p>Ammuuuu, one big virtual hug from Ashu!</p><button class="btn btn-pink" id="bonus-reset">Play Again</button>';$('#bonus-reset').onclick=()=>{bonus={pos:0,score:0,used:[],bouquet:[],clicks:0};window.renderBonusGame(mode,board,game)}}else window.renderBonusGame(mode,board,game)}});return true}
 if(mode==='either'){const choices=[['Pani puri','Waffles'],['Iron Man','Spider-Man'],['Movie night','Discord games'],['Cute teasing','Late-night chats'],['Teddy bear','Keychain']];let i=bonus.pos%choices.length;board.innerHTML=`<h3>This or That? 💗</h3><p>Choice ${i+1} / ${choices.length}. Both answers are valid, Pottiiiiiiii!</p><div class="game-options">${choices[i].map(x=>`<button class="either-btn">${x}</button>`).join('')}</div><div class="game-center" id="either-result"></div>`;board.querySelectorAll('.either-btn').forEach(b=>b.onclick=()=>{bonus.pos++;$('#either-result').textContent='Cute choice! 💗';setTimeout(()=>window.renderBonusGame(mode,board,game),450)});return true}
 if(mode==='bouquet'){board.innerHTML=`<h3>Make a Tiny Flower Bouquet 💐</h3><p>Pick five flowers for your own birthday bouquet.</p><div class="game-options">${['🌷','🌹','🌻','🌸','🌼','🌺'].map(x=>`<button data-flower="${x}" style="font-size:32px">${x}</button>`).join('')}</div><div class="game-center" style="font-size:45px">${bonus.bouquet.join(' ')}</div><p>${bonus.bouquet.length}/5 picked</p>${bonus.bouquet.length>=5?'<button class="btn btn-pink" id="bouquet-reset">Make Another</button>':''}`;board.querySelectorAll('[data-flower]').forEach(b=>b.onclick=()=>{if(bonus.bouquet.length<5){bonus.bouquet.push(b.dataset.flower);window.renderBonusGame(mode,board,game)}});$('#bouquet-reset')?.addEventListener('click',()=>{bonus.bouquet=[];window.renderBonusGame(mode,board,game)});return true}
 if(mode==='reel'){const picks=['Irumudi 🎟️','Paradise 🍿','Doraemon 🪄','418 🎬','Marvel Movie Marathon ⚡','A future film we haven’t chosen yet 💗'];board.innerHTML=`<h3>Movie Night Roulette 🎬</h3><p>Let the little film wheel pick a fun memory!</p><div class="game-center"><div style="font-size:72px;animation:float 2s ease-in-out infinite">🎞️</div><h3 id="reel-result">What will we watch?</h3><button class="btn btn-pink" id="spin-movie">Spin Again ✦</button></div>`;$('#spin-movie').onclick=()=>{$('#reel-result').textContent=picks[Math.floor(Math.random()*picks.length)]};return true}
 if(mode==='compliments'){const notes=['You make ordinary days feel special.','Your tiny gestures mean so much.','Your cute reactions deserve their own award.','Your excitement for Tony Stark makes me smile.','You have a wonderfully warm heart.','There are still so many stories to make!'];board.innerHTML=`<h3>The Compliment Machine ✨</h3><p>A little reminder that you matter.</p><div class="game-center"><div style="font-size:64px">💌</div><h3 id="compliment-note">Click to open your next note!</h3><button class="btn btn-pink" id="compliment-next">Open A Little Note 💗</button></div>`;$('#compliment-next').onclick=()=>{$('#compliment-note').textContent=notes[Math.floor(Math.random()*notes.length)]};return true}
 return false};}
