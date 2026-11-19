// Chapters 6-10: Letters, Playlist, Wishes, Cake, Gifts.
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {gsap, useScene, revealHead, ChapterHead, burstAt, postJSON, store, scrollToId} from './kit.jsx';
import LiveGiftSharing from '../components/LiveGiftSharing.jsx';

/* ───────────────────────── 6. LETTERS ───────────────────────── */
export function Letters({data}) {
  const ref = useRef(null);
  const letters = data.letters || [];
  useScene(ref, q => {
    revealHead(q, ref.current);
    const envs = q('.lt-env');
    const per = 1.7;
    const tl = gsap.timeline({scrollTrigger: {trigger: q('.lt-pin')[0], start: 'top top', end: () => '+=' + envs.length * innerHeight * 0.9, pin: true, scrub: 1, invalidateOnRefresh: true}});
    envs.forEach((env, i) => {
      const t = i * per;
      tl.fromTo(env, {y: () => innerHeight * 0.9, rotation: i % 2 ? 9 : -9, autoAlpha: 0}, {y: 0, rotation: 0, autoAlpha: 1, duration: 0.45, ease: 'back.out(1.3)'}, t)
        .to(env.querySelector('.lt-seal'), {scale: 0, rotation: 90, autoAlpha: 0, duration: 0.2}, t + 0.45)
        .to(env.querySelector('.lt-flap'), {rotationX: 180, duration: 0.3, ease: 'power2.inOut'}, t + 0.5)
        .set(env.querySelector('.lt-flap'), {zIndex: 0}, t + 0.65)
        .to(env.querySelector('.lt-paper'), {yPercent: -62, duration: 0.45, ease: 'power2.out'}, t + 0.75)
        .from(env.querySelectorAll('.lt-word'), {autoAlpha: 0.08, duration: 0.3, stagger: 0.01, ease: 'none'}, t + 0.9)
        .to(q('.lt-dot')[i] || {}, {scale: 1.6, backgroundColor: '#ff6fa5', duration: 0.2}, t + 0.5);
      if (i < envs.length - 1) tl.to(env, {x: () => -innerWidth * 0.9, rotation: -18, autoAlpha: 0, duration: 0.45, ease: 'power2.in'}, t + per - 0.2);
    });
    tl.to({}, {duration: 0.4});
  }, [letters.length]);
  return (
    <section id="letters" className="ch ch-letters" ref={ref}>
      <ChapterHead kicker="HANDWRITTEN WITH LOVE" title="Little Letters" em="For You" sub="Open one whenever the world feels a little too loud, or when you simply want to smile. They open as you scroll 💌" />
      <div className="lt-pin">
        <div className="lt-stage">
          {letters.map((l, i) => (
            <div key={i} className="lt-env" style={{zIndex: i + 1}}>
              <div className="lt-back" />
              <div className="lt-paper">
                <span className="lt-num">LETTER {i + 1} OF {letters.length}</span>
                <h3>{l.title}</h3>
                <p>{l.text.split(' ').map((w, k) => <span key={k} className="lt-word">{w} </span>)}</p>
                <b className="lt-sign">— Ashu ♡</b>
              </div>
              <div className="lt-front" />
              <div className="lt-flap" />
              <div className="lt-seal">♡</div>
            </div>
          ))}
        </div>
        <div className="lt-dots">{letters.map((_, i) => <i key={i} className="lt-dot" />)}</div>
      </div>
    </section>
  );
}

/* ───────────────────────── 7. PLAYLIST ───────────────────────── */
export function Playlist({data}) {
  const ref = useRef(null);
  const audio = useRef(null);
  const tracks = data.playlist || [];
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const cur = tracks[idx] || {};

  useEffect(() => {
    const a = new Audio();
    a.preload = 'none';
    audio.current = a;
    const tick = () => setProgress(a.duration ? a.currentTime / a.duration : 0);
    const onEnd = () => setIdx(i => (i + 1) % Math.max(1, tracks.length));
    a.addEventListener('timeupdate', tick);
    a.addEventListener('ended', onEnd);
    return () => { a.pause(); a.removeEventListener('timeupdate', tick); a.removeEventListener('ended', onEnd); };
  }, [tracks.length]);

  useEffect(() => {
    const a = audio.current;
    if (!a || !cur.src) return;
    if (!a.src.endsWith(cur.src)) { a.src = cur.src; setProgress(0); }
    if (playing) a.play().catch(() => setPlaying(false)); else a.pause();
  }, [idx, playing, cur.src]);

  const choose = i => { if (i === idx) setPlaying(p => !p); else { setIdx(i); setPlaying(true); } };

  useScene(ref, q => {
    revealHead(q, ref.current);
    gsap.fromTo(q('.pl-vinyl-spin'), {rotation: 0}, {rotation: 900, ease: 'none', scrollTrigger: {trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 0.6}});
    gsap.from(q('.pl-deck'), {x: -200, rotationY: 50, autoAlpha: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: {trigger: q('.pl-studio')[0], start: 'top 75%'}});
    gsap.from(q('.pl-track'), {x: 120, autoAlpha: 0, rotationX: -40, stagger: 0.08, duration: 0.9, ease: 'back.out(1.5)', scrollTrigger: {trigger: q('.pl-list')[0], start: 'top 80%'}});
  });

  return (
    <section id="playlist" className="ch ch-playlist" ref={ref}>
      <ChapterHead kicker="FOR MY LOVELYYYY POTTIIIIIIII" title="A Beautiful" em="Playlist For You ♡" sub="Every tune is a memory of laughter, quiet talks, and little moments. Press play and keep scrolling." />
      <div className="pl-studio">
        <div className={`pl-deck ${playing ? 'is-playing' : ''}`}>
          <div className="pl-vinyl-spin">
            <div className="pl-vinyl">
              <div className="pl-label" style={{backgroundImage: `url(${cur.cover})`}} />
            </div>
          </div>
          <div className="pl-arm" />
          <div className="pl-now">
            <small>{playing ? 'NOW PLAYING' : 'READY TO PLAY'}</small>
            <h3>{cur.title}</h3>
            <p>{cur.artist}</p>
            <div className="pl-bar"><i style={{transform: `scaleX(${progress})`}} /></div>
            <div className="pl-ctrl">
              <button type="button" onClick={() => { setIdx(i => (i - 1 + tracks.length) % tracks.length); setPlaying(true); }} aria-label="Previous">⏮</button>
              <button type="button" className="pl-play" onClick={() => setPlaying(p => !p)} aria-label={playing ? 'Pause' : 'Play'}>{playing ? '❚❚' : '▶'}</button>
              <button type="button" onClick={() => { setIdx(i => (i + 1) % tracks.length); setPlaying(true); }} aria-label="Next">⏭</button>
            </div>
            <div className="pl-eq" aria-hidden="true">{Array.from({length: 12}, (_, i) => <i key={i} style={{animationDelay: `${i * 0.09}s`}} />)}</div>
          </div>
        </div>
        <ol className="pl-list">
          {tracks.map((t, i) => (
            <li key={t.id || i}>
              <button type="button" className={`pl-track ${i === idx ? 'is-current' : ''}`} onClick={() => choose(i)}>
                <img src={t.cover} alt="" loading="lazy" />
                <span><b>{t.title}</b><small>{t.artist}</small><em>{t.caption}</em></span>
                <i>{i === idx && playing ? '❚❚' : '▶'}</i>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ───────────────────────── 8. WISHES ───────────────────────── */
const QUESTIONS = [
  ['wish1', 'Your first birthday wish 🌟', 'Anything at all, big or tiny…'],
  ['wish2', 'Your second wish 💫', 'Something you are quietly hoping for…'],
  ['wish3', 'Your third wish ✨', 'The last one, make it count!'],
  ['change', 'One thing you would like Ashu to change 🌷', 'Be honest, I promise to listen.'],
  ['improve', 'How can our friendship be even better? 💗', 'Ideas, plans, complaints, all welcome.']
];
export function Wishes({data}) {
  const ref = useRef(null);
  const wishes = data.wishesFromAshu || [];
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({});
  const [state, setState] = useState('idle');
  const [msg, setMsg] = useState('');
  useScene(ref, q => {
    revealHead(q, ref.current);
    const items = q('.ws-lantern');
    const tl = gsap.timeline({scrollTrigger: {trigger: q('.ws-pin')[0], start: 'top top', end: () => '+=' + items.length * innerHeight * 0.7, pin: true, scrub: 1, invalidateOnRefresh: true}});
    items.forEach((el, i) => {
      tl.fromTo(el, {y: () => innerHeight * 0.6, scale: 0.4, autoAlpha: 0, filter: 'blur(12px)'}, {y: 0, scale: 1, autoAlpha: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out'}, i * 1.2)
        .to(el, {y: () => -innerHeight * 0.6, scale: 0.6, autoAlpha: 0, filter: 'blur(8px)', duration: 0.6, ease: 'power2.in'}, i * 1.2 + 0.9);
    });
    tl.fromTo(q('.ws-turn'), {autoAlpha: 0, scale: 0.7}, {autoAlpha: 1, scale: 1, duration: 0.5}, items.length * 1.2 - 0.1);
    gsap.from(q('.ws-form'), {y: 80, rotationX: 25, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: {trigger: q('.ws-form')[0], start: 'top 85%'}});
  }, [wishes.length]);

  const submit = async e => {
    e.preventDefault();
    if (state === 'sending') return;
    if (!Object.values(form).some(v => v && v.trim())) { setMsg('Write at least one little answer first 🌸'); return; }
    setState('sending'); setMsg('');
    try {
      await postJSON('/api/wishes', form);
      setState('sent');
      burstAt(e.currentTarget);
    } catch (err) {
      setState('idle'); setMsg(err.message);
    }
  };
  const [key, label, hint] = QUESTIONS[step];
  return (
    <section id="wishes" className="ch ch-wishes" ref={ref}>
      <ChapterHead kicker="BEFORE WE OPEN THE GIFTS" title="Three Little" em="Birthday Wishes" sub="First, three wishes from Ashu. Then, if you want, tell me what's on your heart." />
      <div className="ws-pin">
        {wishes.map((w, i) => (
          <div key={i} className="ws-lantern"><span>WISH {i + 1} / {wishes.length}</span><p>{w}</p><i>🏮</i></div>
        ))}
        <div className="ws-turn"><b>Your turn, Pottiiiiiiii</b> 🌠<span>scroll a little more ↓</span></div>
      </div>
      <form className="ws-form" onSubmit={submit}>
        {state === 'sent' ? (
          <div className="ws-sent"><span>💌</span><h3>Your wishes are flying to Ashu!</h3><p>Thank you for trusting me with them. I'll keep every word safe. ✨</p></div>
        ) : (
          <>
            <div className="ws-steps">{QUESTIONS.map((_, i) => <i key={i} className={i <= step ? 'on' : ''} />)}</div>
            <label className="ws-field" key={key}>
              <span>{label}</span>
              <textarea value={form[key] || ''} placeholder={hint} maxLength={1200} rows={4} onChange={e => setForm(f => ({...f, [key]: e.target.value}))} />
            </label>
            {msg && <p className="ws-msg" role="status">{msg}</p>}
            <div className="ws-actions">
              <button type="button" className="btn btn-soft" disabled={step === 0} onClick={() => setStep(s => s - 1)}>← Back</button>
              <span>{step + 1} / {QUESTIONS.length}</span>
              {step < QUESTIONS.length - 1
                ? <button type="button" className="btn btn-pink" onClick={() => setStep(s => s + 1)}>Next →</button>
                : <button type="submit" className="btn btn-pink" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send To Ashu 💌'}</button>}
            </div>
          </>
        )}
      </form>
    </section>
  );
}

/* ───────────────────────── 9. CAKE ───────────────────────── */
export function Cake() {
  const ref = useRef(null);
  const [blown, setBlown] = useState(false);
  useScene(ref, q => {
    revealHead(q, ref.current);
    const tl = gsap.timeline({scrollTrigger: {trigger: q('.ck-pin')[0], start: 'top top', end: '+=170%', pin: true, scrub: 1}});
    tl.from(q('.ck-plate'), {scaleX: 0, autoAlpha: 0, duration: 0.3})
      .from(q('.ck-tier'), {y: () => -innerHeight, rotation: (i) => [-8, 6, -4][i], duration: 0.5, stagger: 0.35, ease: 'bounce.out'}, 0.2)
      .from(q('.ck-drip'), {scaleY: 0, transformOrigin: '50% 0%', stagger: 0.02, duration: 0.25}, 1.3)
      .from(q('.ck-sprinkle'), {scale: 0, autoAlpha: 0, stagger: 0.01, duration: 0.2, ease: 'back.out(3)'}, 1.45)
      .from(q('.ck-candle'), {scaleY: 0, transformOrigin: '50% 100%', stagger: 0.08, duration: 0.25, ease: 'back.out(2)'}, 1.6)
      .from(q('.ck-flame'), {scale: 0, autoAlpha: 0, stagger: 0.08, duration: 0.2, ease: 'back.out(3)'}, 1.9)
      .from(q('.ck-actions'), {autoAlpha: 0, y: 30, duration: 0.3}, 2.1)
      .to({}, {duration: 0.3});
  });
  const blow = e => {
    if (blown) { setBlown(false); return; }
    setBlown(true);
    burstAt(e.currentTarget.closest('.ck-pin')?.querySelector('.ck-cake'));
  };
  const sprinkles = Array.from({length: 26}, (_, i) => <i key={i} className="ck-sprinkle" style={{left: `${8 + (i * 37) % 84}%`, top: `${10 + (i * 53) % 70}%`, background: ['#ff6fa5', '#ffd27a', '#8fd8ff', '#c9a7ff', '#fff'][i % 5], transform: `rotate(${i * 47}deg)`}} />);
  return (
    <section id="cake" className="ch ch-cake dark" ref={ref}>
      <ChapterHead light kicker="THE MAIN EVENT • 3D BIRTHDAY EXPERIENCE" title="A Grand Little Celebration For Our Birthday Girl" em="🎂" sub="A beautiful birthday world is waiting for you, Pottiiiiiiii. Watch your cake build itself, make a wish, and blow the candles." />
      <div className="ck-pin">
        <div className={`ck-cake ${blown ? 'is-blown' : ''}`} id="cake-canvas">
          <div className="ck-candles">{[0, 1, 2, 3, 4].map(i => <div key={i} className="ck-candle"><span className="ck-flame" /><span className="ck-smoke" /></div>)}</div>
          {['top', 'mid', 'base'].map((t, i) => (
            <div key={t} className={`ck-tier ck-${t}`}>
              <div className="ck-frost">{Array.from({length: 9 - i * 2}, (_, k) => <i key={k} className="ck-drip" style={{left: `${6 + k * (88 / (8 - i * 2))}%`, height: `${16 + (k % 3) * 10}px`}} />)}</div>
              {sprinkles.slice(i * 8, i * 8 + 9)}
              {i === 2 && <span className="ck-text">Happy Birthday Ammu</span>}
            </div>
          ))}
          <div className="ck-plate" />
        </div>
        <div className="ck-actions">
          <button type="button" className="btn btn-soft" onClick={blow}>{blown ? 'Light Them Again 🕯️' : 'Make A Wish & Blow 🌬️'}</button>
          <button type="button" className="btn btn-pink" onClick={() => window.ammuOpenCelebration?.()}>Visit Your Birthday Celebration 💗</button>
        </div>
        {blown && <p className="ck-wish">Yayyyy! Your wish is on its way to the stars ✨</p>}
      </div>
    </section>
  );
}

/* ───────────────────────── 10. GIFTS ───────────────────────── */
export function Gifts({data}) {
  const ref = useRef(null);
  const pranks = data.pranks || [];
  const vouchers = data.vouchers || [];
  const [opened, setOpened] = useState(() => store.get('ammu-gifts-opened', []));
  const [claimed, setClaimed] = useState(() => store.get('ammu-vouchers-claimed', []));
  const [flipped, setFlipped] = useState([]);
  const [busy, setBusy] = useState('');
  const [note, setNote] = useState('');

  useScene(ref, q => {
    revealHead(q, ref.current);
    gsap.from(q('.gf-box'), {y: -260, rotation: (i) => (i ? 14 : -14), autoAlpha: 0, duration: 1.2, stagger: 0.2, ease: 'bounce.out', scrollTrigger: {trigger: q('.gf-boxes')[0], start: 'top 75%'}});
  });

  const open = (id, el) => {
    if (opened.includes(id)) { scrollToId(id); return; }
    const lid = el.querySelector('.gf-lid');
    const go = () => { const next = [...opened, id]; setOpened(next); store.set('ammu-gifts-opened', next); burstAt(el); };
    if (lid && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.timeline({onComplete: go})
        .to(el, {keyframes: {rotation: [0, -5, 5, -3, 3, 0]}, duration: 0.45})
        .to(lid, {y: -160, rotation: -30, autoAlpha: 0, duration: 0.55, ease: 'power3.out'});
    } else go();
  };

  const claim = useCallback(async (v, el) => {
    if (claimed.includes(v.id) || busy) return;
    setBusy(v.id); setNote('');
    try {
      await postJSON('/api/membership', {id: v.id});
      const next = [...claimed, v.id];
      setClaimed(next); store.set('ammu-vouchers-claimed', next);
      burstAt(el);
    } catch (err) { setNote(err.message); }
    setBusy('');
  }, [claimed, busy]);

  useEffect(() => {
    const fresh = [...(ref.current?.querySelectorAll('.gf-pop:not([data-in])') || [])];
    fresh.forEach(el => el.setAttribute('data-in', ''));
    if (fresh.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.from(fresh, {y: 60, rotationX: -50, autoAlpha: 0, stagger: 0.07, duration: 0.8, ease: 'back.out(1.5)'});
  }, [opened.length]);

  const box = (id, num, title, text, emoji) => (
    <button type="button" className={`gf-box ${opened.includes(id) ? 'is-open' : ''}`} data-gift={id} onClick={e => open(id, e.currentTarget)}>
      <span className="gf-gift" aria-hidden="true"><span className="gf-lid" /><span className="gf-body">{emoji}</span></span>
      <small>GIFT NO. {num}</small><h3>{title}</h3><p>{text}</p>
      <b>{opened.includes(id) ? 'Opened ✓ See below ↓' : 'Open This Gift →'}</b>
    </button>
  );

  return (
    <section id="gifts" className="ch ch-gifts" ref={ref}>
      <ChapterHead kicker="TWO SURPRISES • FROM ASHU" title="Two Little Surprises," em="Just For You 💗" sub="One to make you laugh, and one to remind you that Ashu is always on your side." />
      <div className="gf-boxes">
        {box('pranks', '01', 'The Millionaire Dreams', "Some extremely expensive gifts that only exist in Ashu's imagination.", '🎁')}
        {box('memberships', '02', 'Forever Little Promises', 'Lifetime membership, cute vouchers and endless promises from Ashu.', '💌')}
      </div>

      {opened.includes('pranks') && (
        <div className="gf-panel" id="pranks">
          <h3 className="gf-panel-title">The Dream Gift Showroom ✨ <small>tap a gift to see the truth 😭</small></h3>
          <div className="gf-dreams">
            {pranks.map(p => (
              <button type="button" key={p.id} className={`gf-dream gf-pop ${flipped.includes(p.id) ? 'is-flipped' : ''}`} onClick={() => setFlipped(f => f.includes(p.id) ? f.filter(x => x !== p.id) : [...f, p.id])}>
                <span className="gf-dream-in">
                  <span className="gf-dream-face front"><img src={`/assets/dream-gifts/${p.id}.svg`} alt="" onError={e => { e.currentTarget.style.display = 'none'; }} /><i>{p.icon}</i><b>{p.name}</b><small>Reveal my gift →</small></span>
                  <span className="gf-dream-face back"><i>{p.icon}</i><p>{p.joke}</p></span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {opened.includes('memberships') && (
        <div className="gf-panel" id="memberships">
          <h3 className="gf-panel-title">Forever Little Promises 💌 <small>{claimed.length} / {vouchers.length} claimed</small></h3>
          <div className="gf-vouchers">
            {vouchers.map(v => {
              const done = claimed.includes(v.id);
              return (
                <div key={v.id} className={`gf-voucher gf-pop ${done ? 'is-claimed' : ''}`}>
                  <span className="gf-v-icon">{v.icon}</span>
                  <div><h4>{v.title}</h4><p>{v.description}</p></div>
                  <button type="button" className="btn btn-pink" disabled={done || busy === v.id} onClick={e => claim(v, e.currentTarget)}>{done ? 'Claimed ♡' : busy === v.id ? '…' : 'Claim 💗'}</button>
                  {done && <span className="gf-stamp">CLAIMED<br />FOREVER</span>}
                </div>
              );
            })}
          </div>
          {note && <p className="ws-msg" role="status">{note}</p>}
          {claimed.length >= vouchers.length && vouchers.length > 0 && (
            <div className="gf-complete" id="membership-complete-card"><span>🏆</span><h4>All promises claimed!</h4><p>Every single one is yours for life, Pottiiiiiiii. No expiry, no fine print. 💗</p></div>
          )}
        </div>
      )}
      <div className="gf-live"><LiveGiftSharing giftId="gifts-duo" /></div>
    </section>
  );
}
