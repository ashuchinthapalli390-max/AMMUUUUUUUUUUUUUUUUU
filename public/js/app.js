import {setupKeepsakes} from './keepsakes.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state={site:null,story:0,filter:'All',galleryPage:0,galleryPageSize:8,filtered:[],galleryIndex:0,letter:0,claims:[],magPage:0,cakeStage:0,cake:null,cakeRecipient:null,cakeCut:0,cakeLit:false,cakeBlown:false,selectedCake:'pink'};
try{state.claims=JSON.parse(localStorage.getItem('ammu_claims')||'[]')}catch{}
try{localStorage.removeItem('ammu_cart');localStorage.removeItem('ammu_decisions');localStorage.removeItem('ammu_coupon_copied');sessionStorage.removeItem('ammu_order')}catch{}
let toastTimer;function toast(msg){let el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3900)}
function persist(){localStorage.setItem('ammu_claims',JSON.stringify(state.claims))}
async function request(p,opts={}){let response=await fetch(p,{credentials:'same-origin',headers:{'Content-Type':'application/json'},...opts});let obj=await response.json().catch(()=>({}));if(!response.ok)throw new Error(obj.error||`Server error (${response.status})`);return obj}
function modal(title,text,emoji='💗',actions=[['Okaayyy ♡',()=>closeModal()]]){let e=$('#modal-content');e.replaceChildren();e.innerHTML=`<span class="modal-emoji">${esc(emoji)}</span><h3>${esc(title)}</h3><p>${esc(text).replaceAll('\n','<br>')}</p><div class="modal-actions"></div>`;let row=e.querySelector('.modal-actions');actions.forEach(([label,fn],i)=>{let b=document.createElement('button');b.className='btn '+(i===0?'btn-pink':'btn-outline');b.textContent=label;b.onclick=()=>{if(fn)fn()};row.append(b)});$('#modal-backdrop').hidden=false;document.body.classList.add('modal-open')}
function closeModal(){$('#modal-backdrop').hidden=true;document.body.classList.remove('modal-open')}
$('#modal-close').onclick=closeModal;$('#modal-backdrop').addEventListener('click',e=>{if(e.target.id==='modal-backdrop')closeModal()});window.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();$('#gallery-lightbox').hidden=true}});
function createPetals(x,y,n=9){const layer=$('#petal-layer');for(let i=0;i<n;i++){let el=document.createElement('span');el.className='petal';el.textContent=['✿','♡','✧','🌸'][Math.floor(Math.random()*4)];el.style.left=x+'px';el.style.top=y+'px';el.style.setProperty('--tx',(Math.random()*180-90)+'px');el.style.setProperty('--ty',(Math.random()*-190-20)+'px');el.style.color=['#ef9eb6','#f3d4df','#c26b9b'][i%3];layer.append(el);setTimeout(()=>el.remove(),1550)}}
document.addEventListener('click',e=>{if(e.target.closest('button,.btn,.gallery-card,.gift-box-card')&&Math.random()>.66)createPetals(e.clientX,e.clientY,4)});
function playMusic(){
  if (window.ammuToggleMusic) {
    window.ammuToggleMusic();
  } else {
    document.dispatchEvent(new CustomEvent('ammu:toggle-music'));
  }
}
$('#music-toggle').onclick=playMusic;
window.addEventListener('ammu:music-state', (e) => {
  const isPlaying = e.detail?.playing;
  const btn = $('#music-toggle');
  if (btn) {
    btn.textContent = isPlaying ? '❚❚' : '♫';
    btn.classList.toggle('playing', !!isPlaying);
    btn.setAttribute('aria-label', isPlaying ? 'Pause music' : 'Play music');
  }
});$('#replay-intro').onclick=()=>modal('One more surprise?', 'Replay our birthday opening from the beginning?', '🎀',[['Replay Intro',()=>{closeModal();$('#experience').hidden=true;document.body.classList.remove('chapter-mode');$('#gate').hidden=false;$('#open-present').hidden=false;window.scrollTo(0,0)}],['Keep Exploring',closeModal]]);
$('#mobile-menu').onclick=()=>$('.site-nav nav').classList.toggle('open');$$('.site-nav nav a').forEach(a=>a.onclick=()=>$('.site-nav nav').classList.remove('open'));
const relTime=()=>Date.parse(state.site?.birthdayDate||'2026-11-17T00:00:00+05:30')-Date.now();
function tick(){let diff=Math.max(0,relTime());let s=Math.floor(diff/1000);['days','hours','minutes','seconds'].forEach((id,i)=>{$('#'+id).textContent=String([Math.floor(s/86400),Math.floor(s%86400/3600),Math.floor(s%3600/60),s%60][i]).padStart(2,'0')});if(diff<=0){$('#open-present').hidden=false;$('#gate-date').textContent='Your birthday surprise is unlocked 🎁'}}
function unlock(){
  if(!state.site?.open){toast('The birthday countdown is still running 💗');return}
  $('#gate').hidden=true;
  $('#experience').hidden=false;
  document.dispatchEvent(new Event('ammu:open'));
  $('#intro-stage').hidden=false;
  $('#intro-stage').classList.remove('opening');
  requestAnimationFrame(()=>{renderCakeStage();startCake()});
  if(location.hash){
    let h=location.hash.slice(1);
    if(['shop','cart','tracking'].includes(h))h='gifts';
    setTimeout(()=>window.ammuGo?.(h),120);
  }else window.ammuGo?.('home');
  createPetals(window.innerWidth/2,window.innerHeight/3,35);
}
window.ammuUnlock=unlock;$('#open-present').onclick=unlock;
$('#intro-unwrap').onclick=()=>{let overlay=$('#intro-stage');overlay.classList.add('opening');createPetals(window.innerWidth/2,window.innerHeight/2,28);setTimeout(()=>overlay.hidden=true,1250)};
async function init(){try{let data=await request('/api/bootstrap');state.site=data;if(data.open){$('#open-present').hidden=false;$('#gate-date').textContent='Birthday website is ready to open';renderAll()}else{$('#open-present').hidden=true}tick()}catch(e){toast('Could not reach birthday server: '+e.message)}}
window.ammuReinitialize=init;
setInterval(tick,1000);init();
function renderAll(){window.ammuBirthdayConfig=state.site;if(state.site.heroImage)$('#home .photo-big img').src=state.site.heroImage;renderTimeline();renderGallery();renderLetters();renderWishes();renderPranks();renderVouchers();renderExtras();setupKeepsakes(state.site);wireGlobal();document.dispatchEvent(new Event('ammu:ready'));}
function openGiftOverlay(id){
 const pranks=$('#pranks');
 const memberships=$('#memberships');
 if(!pranks||!memberships)return;
 if(id==='pranks'){
   memberships.classList.remove('gift-modal-open');
   memberships.hidden=true;
   pranks.hidden=false;
   pranks.classList.add('gift-modal-open');
   document.body.classList.add('gift-modal-active');
   renderPranks();
   pranks.scrollTop=0;
 }else if(id==='memberships'){
   pranks.classList.remove('gift-modal-open');
   pranks.hidden=true;
   memberships.hidden=false;
   memberships.classList.add('gift-modal-open');
   document.body.classList.add('gift-modal-active');
   renderVouchers();
   memberships.scrollTop=0;
 }
}
function closeGiftOverlay(){
 const pranks=$('#pranks');
 const memberships=$('#memberships');
 if(pranks){pranks.classList.remove('gift-modal-open');pranks.hidden=true;}
 if(memberships){memberships.classList.remove('gift-modal-open');memberships.hidden=true;}
 document.body.classList.remove('gift-modal-active');
 const gifts=$('#gifts');
 if(gifts)gifts.scrollIntoView({behavior:'smooth',block:'start'});
}
window.ammuOpenGift=openGiftOverlay;
window.ammuCloseGift=closeGiftOverlay;

function wireGlobal(){if(window._ammuWired)return;window._ammuWired=true;
 $$('.gift-box-card').forEach(x=>x.onclick=()=>{let id=x.dataset.gift;openGiftOverlay(id==='pranks'?'pranks':'memberships')});
 $('#close-pranks-modal')?.addEventListener('click',closeGiftOverlay);
 $('#close-memberships-modal')?.addEventListener('click',closeGiftOverlay);
 window.addEventListener('keydown',e=>{if(e.key==='Escape')closeGiftOverlay()});
 $('#cake-to-gifts').onclick=()=>window.ammuGo?.('gifts');
 $('#wishes-form').onsubmit=submitWishes;
 $('#support-claim').onclick=()=>{if(state.claims.includes('support')){modal('Lifetime Member Already!','Ammuuuu, your Forever Support Club membership is already active! 💗','🎀');return}modal('Ashu’s Lifetime Support Club','Always caring, listening, teasing and being there as friends, Pottiiiiiiii 💗','🎀',[["Accept My Membership 💗",()=>{closeModal();claim('support')}],["Maybe Later",()=>modal('Anthenaa Pottiiiiiiii? 😭','Ayyooo, okayyy! Whenever you want, the little membership card is still right here. No pressure, cutieee. 💗','🌸')]]);};
 $('#keep-memories-btn')?.addEventListener('click',()=>{modal('All Little Promises Kept ♡','Every promise is safely kept in our little universe, Pottiiiiiiii! You can revisit them anytime. 💗','🎀',[['Back To Gifts 🎁',()=>{closeModal();closeGiftOverlay();}],['Continue To Finale →',()=>{closeModal();closeGiftOverlay();window.ammuGo?.('finale')}]]);createPetals(window.innerWidth/2,window.innerHeight/2,25)});
 $('#gallery-more').onclick=()=>{state.galleryPage++;renderGallery();window.ammuRefreshPage?.('memories')};$('#gallery-prev').onclick=()=>{state.galleryPage=Math.max(0,state.galleryPage-1);renderGallery();window.ammuRefreshPage?.('memories')};$('#story-next').onclick=()=>selectStory(state.story+1);$('#story-prev').onclick=()=>selectStory(state.story-1);$('#letter-next').onclick=()=>selectLetter(state.letter+1);
 $('#reason-jar').onclick=()=>{const r=state.site?.reasons||['Your voice makes even silly stories interesting.','Your little hand signs and your cute reactions.','The way you care about things and people.','That seahorse sticker on my phone!','All the movies and little adventures.','Our midnight talks and random reels.','Even our arguments have become stories.','Your love for Tony Stark and Iron Man.','The day we went for pani puri.','Your soft heart, your humour and your pure energy.'];$('#reason-message').textContent='“'+r[Math.floor(Math.random()*r.length)]+'”';createPetals(window.innerWidth/2,window.innerHeight/2,16)};
 $('#hug-btn').onclick=()=>modal('Sending You A Hug','A big warm virtual hug from Ashu to his favourite Pottiiiiiiii. No questions asked.','🫂');$('#annoy-btn').onclick=()=>modal('ASHUUUUU! 😭','Patience is buffering... But your unlimited teasing membership is still active.','😈',[['Againnnn',()=>{closeModal();setTimeout(()=>$('#annoy-btn').click(),200)}],['Hehehe Okay',closeModal]]);$('#seahorse-btn').onclick=()=>modal('Remember this one?','You put a little seahorse sticker on the back of my phone. Somehow even that became one of my favourite memories.','🐚');
 $('#download-certificate').onclick=()=>window.ammuGo?.('certificates');
 $('#video-montage').onclick=()=>{const v=document.createElement('video');v.controls=true;v.playsInline=true;v.style.cssText='width:100%;max-height:65vh;border-radius:12px';v.src='/assets/video/birthday-montage.mp4';v.onerror=()=>toast('Add your personal montage as public/assets/video/birthday-montage.mp4 🎬');modal('Our Little Birthday Movie','A special montage of our favourite memories. You can add your video later.','🎬',[['Close Movie',closeModal]]);$('#modal-content').insertBefore(v,$('#modal-content .modal-actions'));};
 $('#lightbox-close').onclick=()=>$('#gallery-lightbox').hidden=true;$('#lightbox-prev').onclick=()=>openPhoto(state.galleryIndex-1);$('#lightbox-next').onclick=()=>openPhoto(state.galleryIndex+1);
}
function copy(text){navigator.clipboard?.writeText(text).then(()=>toast('Copied '+text+' 💗')).catch(()=>{let t=document.createElement('textarea');document.body.append(t);t.value=text;t.select();document.execCommand('copy');t.remove();toast('Copied '+text)})}
function renderTimeline(){let c=$('#timeline-list');c.innerHTML=state.site.chapters.map((ch,i)=>`<button class="story-tile ${i===state.story?'active':''}" data-story="${i}"><span class="story-icon">${esc(ch.icon)}</span><span><b>${esc(ch.title)}</b><small>CHAPTER ${String(i+1).padStart(2,'0')}</small></span></button>`).join('');$$('[data-story]').forEach(e=>e.onclick=()=>selectStory(Number(e.dataset.story)));selectStory(state.story,false)}
function selectStory(n,repaint=true){state.story=(n+state.site.chapters.length)%state.site.chapters.length;let ch=state.site.chapters[state.story];$('#story-number').textContent='CHAPTER '+String(state.story+1).padStart(2,'0')+' / '+state.site.chapters.length;$('#story-feature-title').textContent=ch.title;$('#story-feature-description').textContent=ch.description;$('#story-feature-image').src=ch.image;$$('[data-story]').forEach((e,i)=>e.classList.toggle('active',i===state.story));if(repaint)$('[data-story="'+state.story+'"]').scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'})}
function renderGallery(){
 const options=['All',...new Set(state.site.gallery.map(g=>g.category))];
 $('#gallery-tabs').innerHTML=options.map(n=>`<button class="${n===state.filter?'active':''}" data-filter="${esc(n)}">${esc(n)}</button>`).join('');
 $$('#gallery-tabs [data-filter]').forEach(b=>b.onclick=()=>{state.filter=b.dataset.filter;state.galleryPage=0;renderGallery();window.ammuRefreshPage?.('memories')});
 state.filtered=state.site.gallery.filter(x=>x.approved!==false&&(state.filter==='All'||x.category===state.filter));
 const count=Math.max(1,Math.ceil(state.filtered.length/state.galleryPageSize));
 state.galleryPage=Math.max(0,Math.min(count-1,state.galleryPage));
 const first=state.galleryPage*state.galleryPageSize;
 const grid=$('#gallery-grid');
 grid.innerHTML=state.filtered.slice(first,first+state.galleryPageSize).map((x,i)=>`<button class="gallery-card" data-photo="${first+i}" style="--rotation:${((i%5)-2)*1.8}deg"><img src="${esc(x.src)}" loading="lazy" alt="${esc(x.caption)}"><span>${esc(x.caption)}</span></button>`).join('');
 grid.classList.remove('gallery-turn');void grid.offsetHeight;grid.classList.add('gallery-turn');
 grid.querySelectorAll('[data-photo]').forEach(b=>b.onclick=()=>openPhoto(Number(b.dataset.photo)));
 $('#gallery-more').hidden=state.galleryPage>=count-1;
 $('#gallery-prev').disabled=state.galleryPage<=0;
 $('#gallery-page-index').textContent='SCRAPBOOK PAGE '+String(state.galleryPage+1).padStart(2,'0')+' / '+String(count).padStart(2,'0');
}
function openPhoto(i){if(!state.filtered.length)return;state.galleryIndex=(i+state.filtered.length)%state.filtered.length;let im=state.filtered[state.galleryIndex];$('#lightbox-img').src=im.src;$('#lightbox-img').alt=im.caption;$('#lightbox-caption').textContent=im.caption;$('#lightbox-index').textContent=(state.galleryIndex+1)+' / '+state.filtered.length;$('#gallery-lightbox').hidden=false}
function renderLetters(){$('#letter-list').innerHTML=state.site.letters.map((l,i)=>`<button class="letter-envelope ${i===state.letter?'active':''}" data-letter="${i}"><span class="emoji">💌</span><b>${esc(l.title)}</b><span style="margin-left:auto">↗</span></button>`).join('');$$('[data-letter]').forEach(b=>b.onclick=()=>selectLetter(Number(b.dataset.letter)));selectLetter(state.letter)}
function selectLetter(n){const sheet=$('#letter-detail');sheet.classList.remove('v8-letter-reveal');void sheet.offsetWidth;sheet.classList.add('v8-letter-reveal');state.letter=(n+state.site.letters.length)%state.site.letters.length;let l=state.site.letters[state.letter];$('#letter-detail h3').textContent=l.title;$('#letter-body').textContent=l.text;$$('[data-letter]').forEach((b,i)=>b.classList.toggle('active',i===state.letter))}
function renderWishes(){$('#ashu-wishes').innerHTML=state.site.wishesFromAshu.map((w,i)=>`<article class="wish-display"><span>Wish ${i+1}</span><p>${esc(w)}</p></article>`).join('')}
async function submitWishes(e){e.preventDefault();let form=new FormData(e.currentTarget);let payload=Object.fromEntries(['wish1','wish2','wish3','change','improve'].map(k=>[k,String(form.get(k)||'').trim()]));if(!Object.values(payload).some(Boolean)){toast('Write at least one little wish, or choose Maybe Later 💗');return}let btn=e.currentTarget.querySelector('[type=submit]');btn.disabled=true;$('#wishes-result').textContent='Saving your wishes...';try{let r=await request('/api/wishes',{method:'POST',body:JSON.stringify(payload)});$('#wishes-result').textContent=r.emailStatus==='sent'?'Saved and emailed to Ashu 💌':'Saved safely. Email notification will need Ashu’s email settings.';modal('Your Little Wishes Are Safe!','Thank you for sharing, Pottiiiiiiii. All your notes are saved. 💗','💌',[['To The Cake Studio 🎂',()=>{closeModal();window.ammuGo?.('cake')}],['Keep Exploring',closeModal]])}catch(err){$('#wishes-result').textContent=err.message}finally{btn.disabled=false}}
let prankIndex=0;
function renderPranks(){
 const p=state.site.pranks[prankIndex];if(!p)return;
 const illustrations={iphone:'📱',ironman:'🦾',villa:'🏡',bmw:'🚘'};
 const icon=illustrations[p.id]||p.icon;
 $('#prank-grid').innerHTML=`<div class="premium-gift-stage" key="${esc(p.id)}"><span class="premium-index">DREAM GIFT ${String(prankIndex+1).padStart(2,'0')} / ${state.site.pranks.length}</span><div class="v5-prank-scene"><div class="v5-prank-card" id="v5-prank-card"><div class="v5-prank-face v5-prank-front"><img class="v5-prank-art" src="/assets/dream-gifts/${esc(p.id)}.svg" alt="Premium dream gift illustration of ${esc(p.name)}"/><div class="v5-prank-object v5-prank-emoji">${esc(icon)}</div><span class="eyebrow">A LITTLE DREAM, ALL WRAPPED UP ♡</span><h3>${esc(p.name)}</h3><p>For my one and only Pottiiiiiiii</p><button type="button" class="btn btn-pink" id="v5-prank-claim">Claim This Gift 🎀</button></div><div class="v5-prank-face v5-prank-back"><span class="eyebrow">FROM ASHU'S VERY BROKE HEART ♡</span><h3>Hehehe, Pottiiiiiiii 😭</h3><p>${esc(p.joke)}</p><button type="button" class="btn btn-pink" id="v5-prank-next">${prankIndex===state.site.pranks.length-1?'Open The Real Gifts 💌':'Next Dream Gift →'}</button></div></div></div></div>`;
 $('#v5-prank-claim').onclick=()=>{$('#v5-prank-card').classList.add('flipped');createPetals(window.innerWidth*.5,window.innerHeight*.45,15)};
 $('#v5-prank-next').onclick=()=>{prankIndex++;if(prankIndex>=state.site.pranks.length){prankIndex=0;window.ammuGo?.('memberships')}else renderPranks()};
}
function renderVouchers(){
  const all=state.site.vouchers.filter(x=>x.id!=='coupon');
  const completed=all.filter(x=>state.claims.includes(x.id)).length;
  const visible=all.slice(0,Math.min(all.length,completed+1));
  const finalCard=$('#membership-complete-card');
  if(finalCard)finalCard.hidden=completed<all.length;
  const supportBtn=$('#support-claim');
  if(supportBtn){
    if(state.claims.includes('support')){
      supportBtn.textContent='Membership Accepted ✓';
      supportBtn.disabled=true;
      supportBtn.classList.add('accepted');
    }else{
      supportBtn.textContent='Accept Membership 💗';
      supportBtn.disabled=false;
      supportBtn.classList.remove('accepted');
    }
  }
  $('#voucher-grid').innerHTML=visible.map(x=>`<article class="voucher"><div><span>${esc(x.icon)}</span><h4>${esc(x.title)}</h4><p>${esc(x.description)}</p></div><button class="btn btn-outline" data-claim="${esc(x.id)}">${state.claims.includes(x.id)?'Claimed ✓':'Claim Voucher ♡'}</button></article>`).join('');
  $$('[data-claim]').forEach(b=>b.onclick=()=>claim(b.dataset.claim));
}
async function claim(id){
  if(id==='coupon')return;
  if(state.claims.includes(id)){
    modal('Already Yours!','This little voucher is already part of your membership card.','💗');
    return;
  }
  let voucher=state.site.vouchers.find(x=>x.id===id);
  try{
    await request('/api/membership',{method:'POST',body:JSON.stringify({id})});
    state.claims.push(id);
    persist();
    renderVouchers();
    document.dispatchEvent(new CustomEvent('ammu:voucher-claim',{detail:{id}}));
    modal('Lifetime Claim Accepted!',id==='support'?'Your lifetime care and friendship card is here whenever you need it. You can also come back and look at it later!':(voucher?.description||'A little promise from Ashu.'),voucher?.icon||'💗');
  }catch(e){
    toast(e.message);
  }
}
// cake behaviour / stages, state machine. Three.js implementation is in separate module and is loaded only when needed.
const cakeStages=['DECORATE YOUR CAKE','MAKE A LITTLE WISH','LIGHT THE CANDLES','BLOW THE CANDLES','CUT THE CAKE','SERVE THE FIRST SLICE','CAKE CELEBRATION'];
let cakePromise;
async function startCake(){if(cakePromise)return cakePromise;cakePromise=import('./cake3d.js').then(m=>m.createCake($('#cake-canvas'),{photo:'/assets/photos/original_black.jpg',onCutProgress:v=>{state.cakeCut=v;$('#cake-cut-progress').style.width=Math.round(v*100)+'%';if(v>=1&&state.cakeStage===4){state.cakeStage=5;renderCakeStage();toast('A perfect little slice! Now choose who gets the first piece 🎂')}}})).then(c=>{state.cake=c;$('#cake-fallback').style.display=c.is3d?'none':'flex';renderCakeStage();return c}).catch(e=>{console.warn('3D cake module error',e);cakePromise=null;$('#cake-fallback').querySelector('p').textContent='3D renderer unavailable. Make sure npm install and the Three.js vendor step completed.';return null});return cakePromise}
function cakeStage(n){state.cakeStage=Math.max(0,Math.min(6,n));renderCakeStage()}
function renderCakeStage(){if(!state.site)return;const s=state.cakeStage;state.cake?.setMode(s===4?'cut':'orbit');$('#cake-stage-badge').textContent='STAGE '+String(s+1).padStart(2,'0')+' · '+cakeStages[s];$$('#cake-steps li').forEach((e,i)=>{e.classList.toggle('active',i===Math.min(s,5));e.classList.toggle('complete',i<s)});$('#cake-prev').disabled=s===0;$('#cake-next').textContent=s===6?'Gifts Time! 🎁':s===5?'Celebrate! 🎉':'Next Step →';$('#cake-next').disabled=(s===2&&!state.cakeLit)||(s===3&&!state.cakeBlown)||(s===4&&state.cakeCut<1)||(s===5&&!state.cakeRecipient);$('#cake-cut-meter').hidden=s!==4;$('#cake-knife-msg').hidden=s!==4;$('#cake-after').hidden=s!==6;
const titles=['Choose Your Sweet Style','Close Your Eyes, Make a Wish','Ready to Light Them?','A Little Birthday Breath','Drag To Cut The Cake','Who Gets The First Slice?','We Did It, Birthday Girl!'];$('#cake-panel-title').textContent=titles[s];let html='';
 if(s===0)html=`<p class="panel-description">Rotate the cake, choose a frosting style and prepare for the celebration.</p><div class="cake-color-grid"><button data-cakecolor="pink" class="cake-color ${state.selectedCake==='pink'?'selected':''}" style="background:#f4b4cf">Pink Dream</button><button data-cakecolor="choco" class="cake-color ${state.selectedCake==='choco'?'selected':''}" style="background:#b7826d">Chocolate</button><button data-cakecolor="cream" class="cake-color ${state.selectedCake==='cream'?'selected':''}" style="background:#f3e2c4">Cream</button></div><p class="panel-description" style="margin-top:17px">Birthday writing: “Happy Birthday Ammuuu ♡”.</p><button class="btn btn-pink" data-cakenext>Make A Wish →</button>`;
 if(s===1)html=`<p class="panel-description">You don't have to tell anyone your wish. The birthday girl can keep a secret. 💗</p><textarea id="cake-wish" placeholder="Optional private wish..." rows="4"></textarea><p class="panel-description">Your wish stays on this device and is not sent to Ashu.</p><button class="btn btn-pink" data-cakenext>I've Made My Wish ✨</button>`;
 if(s===2)html=`<p class="panel-description">Five little birthday candles are waiting for you.</p><button class="btn btn-pink" id="light-candles">Light Candles 🕯️</button><button class="btn btn-soft" data-cakenext>Continue →</button>`;
 if(s===3)html=`<p class="panel-description">Blow out all five candles. If microphone permission is unavailable, tapping works perfectly.</p><button class="btn btn-pink" id="blow-tap">Tap To Blow 💨</button><button class="btn btn-soft" id="blow-mic">Use My Microphone 🎤</button><p class="panel-description">Mic is processed locally; no recording is sent or saved.</p>`;
 if(s===4)html=`<p class="panel-description">Place your knife anywhere around the cake, then drag twice across the surface to form your slice. The 3D model will show the frosting separating and the sponge inside.</p><button class="btn btn-pink" id="cut-guided">Make A Cut 🔪</button><button class="btn btn-soft" id="cut-reset">Reset Cutting ↻</button><p class="panel-description">Cut progress: <b id="cake-progress-label">${Math.round(state.cakeCut*100)}%</b></p>`;
 if(s===5)html=`<p class="panel-description">Who is lucky enough to get the very first slice? Your choice, Ammuuuu!</p>${[['ammu','Ammuuuu (Birthday Girl)'],['ashu','Ashuuuu (Me 😭)'],['both','Share It Together'],['surprise','Save It For Later']].map(([v,n])=>`<button class="btn ${state.cakeRecipient===v?'btn-pink':'btn-soft'}" data-recipient="${v}">${n}</button>`).join('')}<p class="panel-description">No wrong answer. Ashu might pretend to complain.</p>`;
 if(s===6)html=`<p class="panel-description">Yayyyyy! Your cake is officially cut. A sweet new memory to keep.</p><button class="btn btn-pink" id="cake-replay-panel">Cut It Again ↻</button><a href="#gifts" class="btn btn-soft">Open My Gifts 🎁</a>`;
 $('#cake-panel').innerHTML=html;
 $$('[data-cakenext]').forEach(b=>b.onclick=()=>cakeStage(s+1));$$('[data-cakecolor]').forEach(b=>b.onclick=()=>{state.selectedCake=b.dataset.cakecolor;state.cake?.setStyle(b.dataset.cakecolor);renderCakeStage()});
 $('#light-candles')?.addEventListener('click',()=>{state.cakeLit=true;state.cake?.setCandles(true);toast('All five candles are glowing! ✨');cakeStage(3)});
 $('#blow-tap')?.addEventListener('click',blowCandles);$('#blow-mic')?.addEventListener('click',startBlowMic);
 $('#cut-guided')?.addEventListener('click',()=>{if(state.cake?.makeCut)state.cake.makeCut();else{state.cakeCut=Math.min(1,state.cakeCut+.5);$('#cake-cut-progress').style.width=100*state.cakeCut+'%';if(state.cakeCut>=1)cakeStage(5)}});
 $('#cut-reset')?.addEventListener('click',()=>{state.cakeCut=0;state.cake?.resetCut();renderCakeStage()});
 $$('[data-recipient]').forEach(b=>b.onclick=()=>{state.cakeRecipient=b.dataset.recipient;state.cake?.serveSlice(b.dataset.recipient);let msg=b.dataset.recipient==='ashu'?'Aaaaa! First piece for Ashu! My birthday wishes are complete! 😭💗':b.dataset.recipient==='ammu'?'Birthday girl gets the first bite, as she should! 💗':b.dataset.recipient==='both'?'One little slice, shared with all our chaos. 💗':'A secret slice, saved for another day.';toast(msg);cakeStage(6);createPetals(window.innerWidth/2,window.innerHeight/2,35)});
 $('#cake-replay-panel')?.addEventListener('click',replayCake);
}
function blowCandles(){state.cakeBlown=true;state.cake?.setCandles(false);toast('All candles blown out! Make that wish come true ✨');cakeStage(4);createPetals(window.innerWidth/2,window.innerHeight/2,18)}
async function startBlowMic(){if(!navigator.mediaDevices?.getUserMedia){toast('Microphone unavailable. Tap To Blow works too 💗');return}try{let stream=await navigator.mediaDevices.getUserMedia({audio:true});let ctx=new AudioContext(),source=ctx.createMediaStreamSource(stream),analyser=ctx.createAnalyser();analyser.fftSize=1024;source.connect(analyser);let arr=new Uint8Array(analyser.frequencyBinCount);let start=Date.now(),trigger=0;const check=()=>{analyser.getByteFrequencyData(arr);let avg=arr.reduce((a,b)=>a+b,0)/arr.length;if(avg>32)trigger++;if(trigger>=7||Date.now()-start>8000){stream.getTracks().forEach(t=>t.stop());ctx.close();if(trigger>=7)blowCandles();else toast('Couldn’t detect a blow. Use Tap To Blow 💗');return}requestAnimationFrame(check)};check()}catch{toast('Permission denied. Tap To Blow instead!')}}
function replayCake(){state.cakeCut=0;state.cakeRecipient=null;state.cakeLit=false;state.cakeBlown=false;state.cake?.resetCut();state.cake?.setCandles(false);cakeStage(0)}
$('#cake-prev').onclick=()=>cakeStage(state.cakeStage-1);$('#cake-next').onclick=()=>{if(state.cakeStage===6){window.ammuGo?.('gifts');return}if((state.cakeStage===2&&!state.cakeLit)||(state.cakeStage===3&&!state.cakeBlown)){toast('Complete the candle moment before continuing 💗');return}if(state.cakeStage===4&&state.cakeCut<1){toast('First cut a cake slice!');return}if(state.cakeStage===5&&!state.cakeRecipient){toast('Choose who gets the first slice!');return}cakeStage(state.cakeStage+1)};$('#cake-replay').onclick=replayCake;

// === Playable extra experiences: cinema tickets, night-memory sky and three mini-games ===
const movies=[
 ['Irumudi','The first movie together. You sitting next to me during the first half became such a special little memory.','🎟️'],
 ['Paradise','Another cinema ticket for our collection of adventures.','🍿'],
 ['Doraemon','A recent little movie memory full of nostalgia.','🪄'],
 ['418','Another adventure in our movie archive.','🎬'],
 ['Ranabali','We planned it but it didn’t happen. An unfinished ticket for our future memory box.','💌'],
 ['Spider-Man Plans','A 9:30 PM ticket, a lot of confusion and your legendary cute scolding.','🕷️']];
const stars=[
 'Some of our best conversations happened when everyone else was asleep.',
 'One more episode, one more game, one more memory.',
 'Reels shared at the most random hours.',
 'Little things we said became bigger memories.',
 'The MCU recap that somehow became our favourite story.',
 'No matter how late, we always had something to talk about.',
 'A tiny reminder of the trust we built, day by day.',
 'The future still has so many nights and adventures waiting for us.'];
function renderExtras(){
 $('#movie-archive').innerHTML=(state.site.movies||movies.map(m=>({title:m[0],description:m[1],icon:m[2]}))).map((m,i)=>`<button class="movie-ticket movie-poster-card" data-movie="${i}" aria-label="Open our ${esc(m.title)} movie memory"><div class="movie-poster-frame ${esc(m.theme||'burgundy')}">${m.poster&&m.poster.startsWith('/assets/')?`<img src="${esc(m.poster)}" alt="${esc(m.title)} poster" loading="lazy">`:`<div class="movie-fallback-art"><span class="movie-poster-star">✦</span><span class="movie-fallback-title">${esc(m.title)}</span><span class="movie-poster-note">OUR CINEMA DIARY • FROM ASHU</span></div>`}<span class="movie-poster-status">${esc(m.status||'Our Memory')}</span></div><div class="movie-caption"><h3>${esc(m.title)}</h3><p>${esc(m.description)}</p><span>Open Our Memory ↗</span></div></button>`).join('');
 $$('[data-movie]').forEach(b=>b.onclick=()=>{let m=(state.site.movies||movies.map(a=>({title:a[0],description:a[1],icon:a[2]})))[+b.dataset.movie];modal(m.title,m.description,m.icon)});
 const places=[[14,17],[78,20],[23,70],[81,73],[50,20],[12,52],[62,80],[92,48],[42,84],[7,39],[82,52],[60,9],[34,40],[95,15],[48,62],[15,88]].slice(0,Math.min(16,(state.site.stars||stars).length));
 $('#star-field').innerHTML='<div class="sky-moon">☾</div>'+places.map(([x,y],i)=>`<button class="star-btn" style="left:${x}%;top:${y}%;animation-delay:${(i*.47).toFixed(2)}s" data-star="${i}" aria-label="Open midnight memory ${i+1}">${i%3===0?'✧':'✦'}</button>`).join('');
 $$('[data-star]').forEach(b=>b.onclick=()=>modal('A Little Midnight Memory',(state.site.stars||stars)[+b.dataset.star],'🌙'));
 $('#star-random').onclick=()=>{let b=$$('[data-star]')[Math.floor(Math.random()*$$('[data-star]').length)];b.click()};
 $$('[data-game]').forEach(b=>b.onclick=()=>{game.mode=b.dataset.game;initGame()});initGame();
}
const game={mode:'quiz',index:0,score:0,flipped:[],matches:0,deck:[],hearts:0,popped:[]};
const questions=[
 {q:'Where did Ashu and Ammu first start talking?',options:['In a classroom','CodeXa Girls group','At Domino’s','At a movie theatre'],answer:1},
 {q:'Who is Ammu’s favourite Marvel character?',options:['Thor','Loki','Tony Stark / Iron Man','Captain America'],answer:2},
 {q:'Which movie was their first theatre outing together?',options:['Irumudi','Paradise','Doraemon','418'],answer:0},
 {q:'What little sticker went onto Ashu’s phone?',options:['A butterfly','An Iron Man helmet','A seahorse','A rose'],answer:2},
 {q:'What food outing became a little memory at NRT?',options:['Pani puri','Sushi','Pasta','Cake'],answer:0}];
function initGame(){game.index=0;game.score=0;game.hearts=0;game.popped=[];game.matches=0;game.flipped=[];game.deck=['🎟️','🌸','🧸','💗','🎟️','🌸','🧸','💗'].map((x,i)=>({icon:x,id:i,matched:false,flipped:false}));for(let i=game.deck.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[game.deck[i],game.deck[j]]=[game.deck[j],game.deck[i]]}$$('[data-game]').forEach(b=>b.classList.toggle('active',b.dataset.game===game.mode));renderGame()}
function renderGame(){let e=$('#game-board');if(window.renderBonusGame?.(game.mode,e,game))return;if(game.mode==='quiz'){if(game.index>=questions.length){e.innerHTML=`<div class="game-center"><span style="font-size:70px">🏆</span><h3>You Got ${game.score}/${questions.length}!</h3><p>Ammuuuu, no matter the score you are still the birthday champion.</p><button class="btn btn-pink" id="game-restart">Play Again ♡</button></div>`;$('#game-restart').onclick=initGame;return}let q=questions[game.index];e.innerHTML=`<div class="game-progress"><span>BESTIE KNOWLEDGE QUIZ</span><span>QUESTION ${game.index+1} / ${questions.length} • ${game.score} PTS</span></div><h3>${esc(q.q)}</h3><p>Choose the one that feels right, Pottiiiiiiii.</p><div class="game-options">${q.options.map((x,i)=>`<button data-answer="${i}">${esc(x)}</button>`).join('')}</div>`;$$('[data-answer]').forEach(b=>b.onclick=()=>{let correct=+b.dataset.answer===q.answer;if(correct)game.score++;$$('[data-answer]').forEach(x=>x.disabled=true);b.classList.add(correct?'correct':'wrong');toast(correct?'YAYY correct! 💗':'Hehehe not quite! The answer is '+q.options[q.answer]);setTimeout(()=>{game.index++;renderGame()},850)});return}
 if(game.mode==='match'){e.innerHTML=`<div class="game-progress"><span>MEMORY MATCH</span><span>${game.matches} / 4 PAIRS FOUND</span></div><h3>Match Our Little Icons</h3><p>Find all four pairs. The cards have a tiny story inside.</p><div class="match-grid">${game.deck.map((c,i)=>`<button data-match="${i}" class="match-card ${c.flipped?'flipped':''} ${c.matched?'matched':''}">${c.flipped||c.matched?c.icon:'♡'}</button>`).join('')}</div>${game.matches===4?'<div class="game-center" style="margin-top:22px"><b>YOU MATCHED THEM ALL! 🎉</b><br><button class="btn btn-pink" id="game-restart">Play Again</button></div>':''}`;$$('[data-match]').forEach(b=>b.onclick=()=>{let n=+b.dataset.match,c=game.deck[n];if(c.matched||c.flipped||game.flipped.length>=2)return;c.flipped=true;game.flipped.push(n);renderGame();if(game.flipped.length===2){let [i,j]=game.flipped;if(game.deck[i].icon===game.deck[j].icon){game.deck[i].matched=game.deck[j].matched=true;game.matches++;game.flipped=[];setTimeout(renderGame,350)}else{setTimeout(()=>{game.deck[i].flipped=false;game.deck[j].flipped=false;game.flipped=[];renderGame()},700)}}});$('#game-restart')?.addEventListener('click',initGame);return}
 if(game.mode==='hearts'){e.innerHTML=`<div class="game-progress"><span>HEART CATCHER</span><span>${game.hearts} / 18 HEARTS COLLECTED</span></div><h3>Catch All The Little Hearts</h3><p>Click each floating heart to fill Ammu's birthday jar!</p><div class="hearts-field">${Array.from({length:18},(_,i)=>`<button class="pop-heart ${game.popped.includes(i)?'popped':''}" data-pop="${i}" ${game.popped.includes(i)?'disabled':''}>${i%3===0?'💗':i%3===1?'💖':'💕'}</button>`).join('')}</div>${game.hearts>=18?'<div class="game-center"><b>All 18 collected! You deserve unlimited hugs 💗</b><br><button class="btn btn-pink" id="game-restart">Play Again</button></div>':''}`;$$('[data-pop]').forEach(b=>b.onclick=()=>{let n=+b.dataset.pop;if(game.popped.includes(n))return;game.popped.push(n);game.hearts++;createPetals(b.getBoundingClientRect().x,b.getBoundingClientRect().y,3);renderGame()});$('#game-restart')?.addEventListener('click',initGame)}
}
function downloadCertificate(){let canvas=document.createElement('canvas');canvas.width=1400;canvas.height=990;let c=canvas.getContext('2d');c.fillStyle='#fff6f3';c.fillRect(0,0,1400,990);c.strokeStyle='#cd7298';c.lineWidth=16;c.strokeRect(45,45,1310,900);c.strokeStyle='#efb7c9';c.lineWidth=3;c.strokeRect(80,80,1240,830);c.textAlign='center';c.fillStyle='#d46a99';c.font='55px Georgia';c.fillText('✿      ♡      ✿',700,190);c.fillStyle='#813c5c';c.font='italic 65px Georgia';c.fillText('Official Birthday Certificate',700,310);c.fillStyle='#a6607e';c.font='29px Arial';c.fillText('THIS CERTIFICATE IS PROUDLY AWARDED TO',700,400);c.font='bold 82px Georgia';c.fillStyle='#a84f79';c.fillText('AMMUUUUU',700,515);c.fillStyle='#794c66';c.font='40px Georgia';c.fillText('For being the sweetest, cutest Pottiiiiiiii',700,610);c.fillText('and Ashu’s favourite little troublemaker',700,670);c.font='italic 44px Georgia';c.fillStyle='#bd658b';c.fillText('Forever your silly bestie, From Ashu 💗',700,800);let a=document.createElement('a');a.download='Ammu_Birthday_Certificate.png';a.href=canvas.toDataURL('image/png');a.click();toast('Birthday certificate saved! 🏆')}

// Retry 3D initialization when its visible chapter opens; avoid zero-sized WebGL scenes.
document.addEventListener('ammu:chapter-change',e=>{if(e.detail?.id==='cake'&&!state.cake?.is3d){requestAnimationFrame(()=>startCake());}});
