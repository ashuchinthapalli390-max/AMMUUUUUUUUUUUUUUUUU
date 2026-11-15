import React,{useCallback,useEffect,useRef,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'framer-motion';
import './birthday-frontdoor.css';
const TARGET=Date.parse('2026-11-17T00:00:00+05:30');
const PHOTO='/assets/teaser/ammu-glasses.jpg';
const ORBIT_PHOTOS=[
  {src:'/assets/teaser/ammu-glasses.jpg',tilt:-5},
  {src:'/assets/teaser/ammu-original-white.jpg',tilt:6},
  {src:'/assets/photos/ammu_01.jpg',tilt:-4},
  {src:'/assets/photos/original_black.jpg',tilt:5},
  {src:'/assets/photos/ammu_02.jpg',tilt:-6},
  {src:'/assets/photos/ammu_03.jpg',tilt:4}
];
const flowers=['✿','✦','♡','❀','🦋','✧'];
const istDate=t=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(t));
const dates=Array.from({length:23},(_,i)=>{let d=new Date(Date.UTC(2026,9,26+i));return {id:d.toISOString().slice(0,10),day:d.getUTCDate(),mon:d.getUTCMonth()===9?'OCT':'NOV',index:i+1}});
function IntroCurtain({onOpen}){return <motion.div className="ad-opening" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,scale:1.05}} transition={{duration:.7}}>
  <div className="ad-curtain ad-left"/><div className="ad-curtain ad-right"/><div className="ad-spotlight"/>
  <div className="ad-bg-orbit-container" aria-hidden="true">
    <div className="ad-bg-orbit-ring">
      {ORBIT_PHOTOS.map((item,idx)=><div key={idx} className={`ad-bg-orbit-spoke spoke-${idx}`} style={{'--i':idx,'--tilt':`${item.tilt}deg`}}>
        <div className="ad-bg-orbit-card-anchor">
          <div className="ad-bg-orbit-card">
            <div className="ad-bg-orbit-img-wrap"><img src={item.src} alt="Ammu photo"/></div>
            <div className="ad-bg-orbit-pin">♡</div>
          </div>
        </div>
      </div>)}
    </div>
  </div>
  <div className="ad-intro-content">
    <motion.span className="ad-kicker" initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:.2}}>A LITTLE WORLD • MADE WITH LOVE • FROM ASHU</motion.span>
    <motion.div className="ad-kicker-heart" initial={{scale:0}} animate={{scale:1}} transition={{delay:.35,type:'spring'}}>♡</motion.div>
    <motion.h1 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:.5,duration:.8}}>A Little Birthday Universe<br/><em>Just For You, Pottiiiiiiii.</em></motion.h1>
    <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.75}}>Every little day brings us closer to celebrating you. 💗</motion.p>
    <button className="ad-button" onClick={onOpen}>Open Our Little Calendar ✿</button>
  </div>
  <span className="ad-butterfly ad-float-one">🦋</span><span className="ad-butterfly ad-float-two">✿</span>
</motion.div>}
function Poster({remaining,close}){
  const [posterData, setPosterData] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    fetch('/assets/countdown/manifest.json')
      .then(r => r.json())
      .then(manifest => {
        if (Array.isArray(manifest.posters)) {
          let match = manifest.posters.find(p => p.daysRemaining === remaining);
          if (!match && remaining <= 1) {
            match = manifest.posters.find(p => p.daysRemaining === 1);
          }
          if (!match) {
            match = manifest.posters[manifest.posters.length - 1];
          }
          setPosterData(match);
        }
      })
      .catch(e => console.warn('Could not load countdown manifest:', e));
  }, [remaining]);

  const imageSrc = posterData?.image || PHOTO;
  const label = posterData?.label || `${remaining} DAYS LEFT`;
  const filename = posterData?.filename || `Ammu_Countdown_${remaining}_Days.png`;

  return (
    <div className="ad-modal-backdrop" role="presentation" onClick={close}>
      <motion.div
        className="ad-poster"
        role="dialog"
        aria-modal="true"
        aria-label="Today's birthday countdown poster"
        initial={{ opacity: 0, scale: 0.88, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '520px', padding: '24px 20px 28px' }}
      >
        <button className="ad-close" onClick={close} aria-label="Close poster">×</button>
        <span className="ad-kicker">A LIMITED BIRTHDAY EDITION · MADE BY ASHU</span>
        <div className="ad-poster-side-label">{label} ♡</div>
        
        <div
          className="ad-poster-real-frame"
          style={{
            margin: '16px 0',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '6px solid white',
            boxShadow: '0 12px 35px rgba(110,45,76,0.25)',
            background: '#fff0f5',
            position: 'relative',
            cursor: 'zoom-in'
          }}
          onClick={() => setFullscreen(true)}
          title="Click to view full size"
        >
          <img
            src={imageSrc}
            alt={`Countdown poster: ${label}`}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        <h2>{label}</h2>
        <p>Every new sunrise makes your sweetest birthday a little closer, Pottiiiiiiii! 💗</p>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '18px', flexWrap: 'wrap' }}>
          <a
            href={imageSrc}
            download={filename}
            className="ad-button"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            Save Poster as PNG ↓
          </a>
          <button
            type="button"
            className="ad-outline"
            onClick={() => setFullscreen(true)}
          >
            Full Size ⤢
          </button>
        </div>

        {fullscreen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.92)',
              zIndex: 10000002,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              cursor: 'zoom-out'
            }}
            onClick={() => setFullscreen(false)}
          >
            <img
              src={imageSrc}
              alt={label}
              style={{
                maxWidth: '95vw',
                maxHeight: '95vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
              }}
            />
            <button
              onClick={() => setFullscreen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '25px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#fff',
                fontSize: '32px',
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
function GoddessCalendar({info,checking,onCheck,onCountdown,poster}){let today=info.today||istDate(Date.now()),complete=info.checkedDates||[];let remaining=Math.max(0,Math.ceil((TARGET-Date.now())/86400000));return <motion.main className="ad-calendar" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,x:-50}}>
  <span className="ad-season">✧ DEVI'S MOONLIT DAYS ✧</span><h1>THE GODDESS OF <em>LITTLE JOYS</em></h1><p className="ad-subtitle">A little countdown to Ammuuu's special day · 17 November</p>
  <div className="ad-calendar-layout"><div className="ad-calendar-person"><div className="ad-portrait"><img src={PHOTO} alt="Ammu in her black embroidered dress with sunglasses"/><span>MY LOVELYYYY POTTIIII ♡</span></div><blockquote>“To my dearest Ammuuu… every sunrise is another little flower in our story. Let's collect them together.” <b>From Ashu ♡</b></blockquote><button className="ad-button" disabled={!!info.checkedToday||checking||today>'2026-11-17'} onClick={onCheck}>{checking?'Collecting today’s flower…':info.checkedToday?'Today’s Flower Collected ✓':'Check In For Today 🌸'}</button><button className="ad-outline" onClick={onCountdown}>Visit The Velvet Countdown 🎀</button></div>
  <div className="ad-diary"><div className="ad-diary-top"><h2>A Little Diary of 23 Days</h2><span>{complete.length} / 23 flowers collected</span></div><div className="ad-date-grid">{dates.map(d=>{const checked=complete.includes(d.id),current=d.id===today,birthday=d.id==='2026-11-17';const past=d.id<today;return <div key={d.id} className={'ad-day'+(checked?' checked':'')+(current?' current':'')+(birthday?' birthday':'')+(past?' past':'')} aria-label={`${d.day} ${d.mon}: ${checked?'checked in':current?'today':past?'missed':'upcoming'}`}>
    <small>{birthday?'GRAND DAY ✨':`DAY ${String(d.index).padStart(2,'0')}`}</small><strong>{d.day}</strong><small>{d.mon}</small><div className="ad-day-flower">{checked?'✿':birthday?'♛':current?'🌷':'❀'}</div>{checked&&<svg className="ad-day-cross" viewBox="0 0 100 100" aria-hidden="true"><path d="M13 50 L42 76 L87 22"/></svg>}{current&&checking&&<div className="ad-paper-burn"/>}</div>})}</div><p className="ad-diary-note">Only today's flower can be collected. Every other date is part of our unfolding story. ♡</p></div></div>
  <div className="ad-corner-flower top">✿</div><div className="ad-corner-flower bottom">🌸</div></motion.main>}

function CurtainCountdown({info,onBack,onEnter}){const [remaining,setRemaining]=useState(Math.max(0,TARGET-Date.now()));const [serverOffset,setServerOffset]=useState(0);useEffect(()=>{if(info.serverTime)setServerOffset(Date.parse(info.serverTime)-Date.now())},[info.serverTime]);useEffect(()=>{let raf=0;let last=0;const run=(ts)=>{if(ts-last>38){last=ts;setRemaining(Math.max(0,TARGET-(Date.now()+serverOffset)))}raf=requestAnimationFrame(run)};raf=requestAnimationFrame(run);return()=>cancelAnimationFrame(raf)},[serverOffset]);const d=Math.floor(remaining/86400000),h=Math.floor(remaining%86400000/3600000),m=Math.floor(remaining%3600000/60000),s=Math.floor(remaining%60000/1000),ms=remaining%1000;
const canEnter = remaining<=0 || (info?.open ?? false);
return <motion.main className="ad-countdown" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><div className="ad-curtain ad-left"/><div className="ad-curtain ad-right"/><div className="ad-stage-light"/><div className="ad-stage-centre"><span className="ad-kicker">FROM ASHU • JUST FOR AMMUUUUUU ♡</span><h1>One Little Present…<br/><em>For One Very Special Ammuuuuuu 💗</em></h1><p>Pottiiiiiiii, your birthday universe is almost ready!</p><div className="ad-clock" aria-label="Birthday countdown"><div>{[d,h,m,s,ms].map((v,i)=><React.Fragment key={i}>{i>0&&<span className="ad-colon">:</span>}<span className="ad-clock-unit"><strong>{String(v).padStart(i===4?3:2,'0')}</strong><small>{['DAYS','HOURS','MINUTES','SECONDS','MILLISECONDS'][i]}</small></span></React.Fragment>)}</div></div>{canEnter?<button className="ad-button" onClick={onEnter}>UNTIE YOUR BIRTHDAY RIBBON 🎀</button>:(
  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}>
    <span className="ad-lock-caption">The curtains open on 17 November, 12:00 AM IST ✨</span>
  </div>
)}<button className="ad-back" onClick={onBack}>← Back to our little calendar</button></div><span className="ad-butterfly ad-float-one">🦋</span><span className="ad-butterfly ad-float-two">✧</span></motion.main>}

export default function BirthdayFrontdoor({skip=false}){
if(skip)return null;
const [phase,setPhase]=useState('opening');
const [info,setInfo]=useState({today:istDate(Date.now()),checkedDates:[],checkedToday:false,serverTime:new Date().toISOString(),open:false});
const [checking,setChecking]=useState(false);
const [poster,setPoster]=useState(false);
const [notice,setNotice]=useState('');
const reduced=useReducedMotion();
const infoRef=useRef(info);
useEffect(()=>{infoRef.current=info},[info]);
const refresh=useCallback(async()=>{try{let r=await fetch('/api/checkin/status',{credentials:'same-origin'});if(r.ok){const j=await r.json();setInfo(prev=>({...prev,...j}))}let b=await fetch('/api/bootstrap',{credentials:'same-origin'}).then(x=>x.json()).catch(()=>({}));if(b.open){setInfo(prev=>({...prev,open:!!b.open}))}}catch{}},[]);
useEffect(()=>{refresh()},[refresh]);

const check=async()=>{if(checking||info.checkedToday)return;setChecking(true);try{let r=await fetch('/api/checkin',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:'{}'});let j=await r.json();if(!r.ok)throw new Error(j.error||'Could not save check-in');await refresh();setNotice('Yayyyy Pottiiiiiiii! Today’s little flower is collected! 🌸');window.ammuTriggerMagicalBurst?.(window.innerWidth/2,window.innerHeight*0.45);setTimeout(()=>{setPoster(true);setNotice('')},reduced?200:1200)}catch(e){setNotice(e.message)}finally{setChecking(false)}};

const enter=async()=>{
  const b=await fetch('/api/bootstrap',{credentials:'same-origin'}).then(x=>x.json()).catch(()=>({}));
  if(!b.open){setNotice('Birthday universe unlocks on 17 November 💗');return}
  window.ammuTriggerMagicalBurst?.(window.innerWidth/2,window.innerHeight/2);
  await window.ammuReinitialize?.();
  window.ammuUnlock?.();
  const btn=document.getElementById('open-present');
  if(btn){btn.hidden=false;btn.click();{const i=document.getElementById('intro-stage');if(i)i.hidden=true}}
  setPhase('done');
};

if(phase==='done')return null;

return (
  <div className="ad-frontdoor">
    <div className="ad-floating" aria-hidden="true">{flowers.map((x,i)=><span key={i} style={{left:`${9+i*15}%`,animationDelay:`${i*.7}s`}}>{x}</span>)}</div>
    <AnimatePresence mode="wait">
      {phase==='opening'&&<IntroCurtain key="intro" onOpen={()=>setPhase('calendar')}/>}
      {phase==='calendar'&&<GoddessCalendar key="calendar" info={info} checking={checking} onCheck={check} onCountdown={()=>setPhase('countdown')}/>}
      {phase==='countdown'&&<CurtainCountdown key="curtain" info={info} onBack={()=>setPhase('calendar')} onEnter={enter}/>}
    </AnimatePresence>
    {poster&&<Poster remaining={Math.max(0,Math.ceil((TARGET-Date.now())/86400000))} close={()=>setPoster(false)}/>}
    {notice&&<div className="ad-notice" role="status">{notice}</div>}
  </div>
);
}
