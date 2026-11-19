// Chapters 11-16: Movies, Midnight, Games, Little Things, Certificates, Finale.
import React, {Suspense, lazy, useRef, useState} from 'react';
import {gsap, useScene, revealHead, ChapterHead, Overlay, burstAt, scrollToId} from './kit.jsx';
import WonderlandOfGames from '../components/WonderlandOfGames.jsx';

const SlapAshuGame = lazy(() => import('../components/games/SlapAshuGame.jsx'));

/* ───────────────────────── 11. MOVIES (film strip coverflow) ───────────────────────── */
export function Movies({data}) {
  const ref = useRef(null);
  const movies = data.movies || [];
  useScene(ref, q => {
    revealHead(q, ref.current);
    const track = q('.mv-track')[0];
    const dist = () => Math.max(0, track.scrollWidth - innerWidth * 0.5);
    const h = gsap.fromTo(track, {x: () => innerWidth * 0.35}, {x: () => -dist() + innerWidth * 0.15, ease: 'none',
      scrollTrigger: {trigger: q('.mv-pin')[0], start: 'top top', end: () => '+=' + (dist() + innerWidth * 0.2), pin: true, scrub: 1, invalidateOnRefresh: true}});
    q('.mv-card').forEach(card => {
      gsap.fromTo(card, {rotationY: -50, scale: 0.8, z: -200}, {rotationY: 0, scale: 1, z: 0, ease: 'none',
        scrollTrigger: {trigger: card, containerAnimation: h, start: 'left right', end: 'center center', scrub: true}});
      gsap.to(card, {rotationY: 50, scale: 0.8, z: -200, ease: 'none', immediateRender: false,
        scrollTrigger: {trigger: card, containerAnimation: h, start: 'center center', end: 'right left', scrub: true}});
    });
    gsap.to(q('.mv-holes'), {backgroundPositionX: '-600px', ease: 'none', scrollTrigger: {trigger: q('.mv-pin')[0], start: 'top top', end: () => '+=' + dist(), scrub: true}});
  }, [movies.length]);
  return (
    <section id="movies" className="ch ch-movies" ref={ref}>
      <ChapterHead kicker="MOVIE DATES, LAUGHS & TICKETS" title="Our Little" em="Cinema Archive" sub="One ticket at a time, we turned ordinary days into stories worth keeping. 🍿" />
      <div className="mv-pin">
        <div className="mv-holes top" /><div className="mv-holes bottom" />
        <div className="mv-track">
          {movies.map((m, i) => (
            <article key={i} className={`mv-card th-${m.theme}`}>
              <div className="mv-poster"><img src={m.poster} alt={`${m.title} poster`} loading="lazy" /><span className={`mv-status ${m.status === 'Planned' ? 'planned' : ''}`}>{m.status}</span></div>
              <div className="mv-ticket">
                <span className="mv-icon">{m.icon}</span>
                <div><h3>{m.title}</h3><p>{m.description}</p></div>
                <span className="mv-stub">ADMIT<br />TWO<br />♡</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 12. MIDNIGHT ───────────────────────── */
const TIMES = ['11:58 PM', '12:17 AM', '12:36 AM', '12:59 AM', '01:12 AM', '01:29 AM', '01:48 AM', '02:03 AM'];
export function Midnight({data}) {
  const ref = useRef(null);
  const stars = data.stars || [];
  useScene(ref, q => {
    revealHead(q, ref.current);
    const msgs = q('.mn-msg');
    const clock = q('.mn-clock')[0];
    const log = q('.mn-log-inner')[0];
    const tl = gsap.timeline({scrollTrigger: {
      trigger: q('.mn-pin')[0], start: 'top top', end: () => '+=' + msgs.length * innerHeight * 0.45, pin: true, scrub: 1, invalidateOnRefresh: true,
      onUpdate: self => { const i = Math.min(msgs.length - 1, Math.floor(self.progress * msgs.length)); if (clock) clock.textContent = TIMES[i % TIMES.length]; }
    }});
    tl.fromTo(q('.mn-moon'), {x: () => -innerWidth * 0.35, y: 120}, {x: () => innerWidth * 0.35, y: -60, ease: 'none', duration: msgs.length}, 0)
      .from(q('.mn-phone'), {y: 200, rotationX: 40, autoAlpha: 0, duration: 0.6, ease: 'power3.out'}, 0);
    msgs.forEach((m, i) => {
      tl.from(m, {autoAlpha: 0, y: 40, scale: 0.7, transformOrigin: m.classList.contains('right') ? '100% 100%' : '0% 100%', duration: 0.35, ease: 'back.out(2)'}, 0.4 + i);
      tl.to(q('.mn-typing')[0], {autoAlpha: 1, duration: 0.15, yoyo: true, repeat: 1}, 0.2 + i);
    });
    tl.to(log, {y: () => -Math.max(0, log.scrollHeight - log.parentElement.clientHeight + 10), ease: 'none', duration: msgs.length - 1}, 1);
    tl.to({}, {duration: 0.5});
  }, [stars.length]);
  return (
    <section id="midnight" className="ch ch-midnight dark" ref={ref}>
      <div className="mn-sky" aria-hidden="true" />
      <ChapterHead light kicker="THE WORLD SLEPT. WE TALKED." title="Our Midnight" em="Universe" sub="Some of our favourite memories never needed sunlight. Inspired by our nights, not copied chats 🌙" />
      <div className="mn-pin">
        <div className="mn-moon" aria-hidden="true">🌙</div>
        <div className="mn-phone">
          <div className="mn-top"><span>Ashu ♡ Ammu</span><b className="mn-clock">{TIMES[0]}</b></div>
          <div className="mn-log"><div className="mn-log-inner">
            {stars.map((s, i) => (
              <div key={i} className={`mn-msg ${i % 2 ? 'right' : ''}`}><small>{i % 2 ? 'Ashu' : 'Ammu'}</small><p>{s}</p></div>
            ))}
          </div></div>
          <div className="mn-typing">typing<span>.</span><span>.</span><span>.</span></div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 13. GAMES ───────────────────────── */
export function Games() {
  const ref = useRef(null);
  const [slap, setSlap] = useState(false);
  useScene(ref, q => {
    revealHead(q, ref.current);
    gsap.from(q('.gm-banner'), {scale: 0.6, rotation: -6, autoAlpha: 0, duration: 1.1, ease: 'elastic.out(1, .6)', scrollTrigger: {trigger: q('.gm-banner')[0], start: 'top 85%'}});
    gsap.from(q('.gm-board'), {y: 100, rotationX: 30, autoAlpha: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: {trigger: q('.gm-board')[0], start: 'top 85%'}});
  });
  return (
    <section id="games" className="ch ch-games" ref={ref}>
      <ChapterHead kicker="BESTIE GAMES & LITTLE CHALLENGES" title="A Little Wonderland Of Games For" em="Pottiiiiiiii 🎮💗" sub="Win hearts, guess our memories, tease your Ashu, and become the official birthday champion." />
      <div className="gm-banner">
        <span className="gm-badge">✿ SPECIAL INTERACTIVE MINI-GAME ✿</span>
        <div className="gm-emoji">😤💥</div>
        <h3>Angry With Ashu? 😭💗</h3>
        <p>Pottiiiiiiii, kopam thagge varaku Ashu ni tease cheyyi!</p>
        <button type="button" className="btn btn-pink" id="open-slap-ashu-btn" onClick={() => setSlap(true)}>Slap Ashu 🎀</button>
      </div>
      <div className="gm-board"><WonderlandOfGames onOpenSlapAshu={() => setSlap(true)} /></div>
      <Overlay open={slap} onClose={() => setSlap(false)} label="Slap Ashu game" className="st-game">
        <Suspense fallback={<div className="slap-loading-state"><div className="slap-loading-spinner">🎀</div><p>Loading Ashu's 3D stage...</p></div>}>
          <SlapAshuGame onClose={() => setSlap(false)} />
        </Suspense>
      </Overlay>
    </section>
  );
}

/* ───────────────────────── 14. LITTLE THINGS (jar of notes) ───────────────────────── */
export function LittleThings({data}) {
  const ref = useRef(null);
  const reasons = data.reasons || [];
  const [kept, setKept] = useState(false);
  useScene(ref, q => {
    revealHead(q, ref.current);
    const notes = q('.lt2-note');
    const tl = gsap.timeline({scrollTrigger: {trigger: q('.lt2-pin')[0], start: 'top top', end: () => '+=' + notes.length * innerHeight * 0.32, pin: true, scrub: 1, invalidateOnRefresh: true}});
    tl.from(q('.lt2-jar'), {y: 200, scale: 0.6, autoAlpha: 0, duration: 0.6, ease: 'back.out(1.6)'});
    notes.forEach((n, i) => {
      const a = (i / notes.length) * Math.PI * 2 - Math.PI / 2;
      tl.to(q('.lt2-jar'), {keyframes: {rotation: [0, -7, 6, 0]}, duration: 0.3, transformOrigin: '50% 100%'}, 0.6 + i * 0.5)
        .fromTo(n, {x: 0, y: 40, scale: 0.1, rotation: 0, autoAlpha: 0},
          {x: () => Math.cos(a) * Math.min(innerWidth * 0.38, 520), y: () => Math.sin(a) * Math.min(innerHeight * 0.34, 300), scale: 1, rotation: gsap.utils.random(-10, 10), autoAlpha: 1, duration: 0.6, ease: 'back.out(1.7)'}, 0.65 + i * 0.5);
    });
    tl.from(q('.lt2-keep'), {autoAlpha: 0, scale: 0.6, duration: 0.4}, '>-0.2').to({}, {duration: 0.4});
  }, [reasons.length]);
  return (
    <section id="little-things" className="ch ch-little" ref={ref}>
      <ChapterHead kicker="A HUNDRED TINY REASONS" title="Little Things" em="I Adore" sub="Scroll and the jar spills every little note I kept for you." />
      <div className="lt2-pin">
        <div className="lt2-orbit">
          {reasons.map((r, i) => <div key={i} className="lt2-note" style={{'--h': `${(i * 37) % 360}`}}><b>#{i + 1}</b>{r}</div>)}
        </div>
        <div className="lt2-jar"><div className="lt2-lid" /><div className="lt2-glass"><span>💗</span><span>✿</span><span>💌</span><span>✨</span><span>🌸</span></div><div className="lt2-tag">little things ♡</div></div>
        <button type="button" id="keep-memories-btn" className="btn btn-pink lt2-keep" onClick={e => { setKept(true); burstAt(e.currentTarget); }}>{kept ? 'Kept forever 💗' : 'Keep These Memories 💗'}</button>
      </div>
    </section>
  );
}

/* ───────────────────────── 15. CERTIFICATES ───────────────────────── */
const CERTS = [
  ['Lifetime Bestie', 'CERTIFICATE OF ENDLESS FRIENDSHIP', 'For every memory, movie, midnight talk and silly fight.', '💗'],
  ['Birthday Royalty', 'OFFICIAL BIRTHDAY ROYALTY AWARD', 'Celebrating the extraordinary Ammuuuu and all the smiles she brings.', '👑'],
  ['Movie Marathon', 'HONORARY CINEMA COMPANION', 'For the legendary Irumudi first show, and every cinema ticket afterward.', '🎟️'],
  ['Midnight Star', 'THE AFTER-MIDNIGHT STORYTELLER', 'For conversations that made even the longest nights feel short.', '🌙'],
  ['Cute Chaos', 'LIFETIME CUTE CHAOS AWARD', 'For the little fights, funny faces, stickers and wonderful chaos.', '🎀'],
  ['Iron Man Fan', 'TONY STARK APPRECIATION MEDAL', 'For being the most devoted Iron Man fan in our little universe.', '⚡']
];
function wrapText(ctx, text, x, y, max, line) {
  let ln = '';
  for (const w of text.split(' ')) { const t = ln + w + ' '; if (ctx.measureText(t).width > max) { ctx.fillText(ln, x, y); y += line; ln = w + ' '; } else ln = t; }
  ctx.fillText(ln, x, y);
}
function downloadCert([name, title, description, emoji]) {
  const c = document.createElement('canvas'); c.width = 1800; c.height = 1270;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 1800, 1270); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#f8e9e6');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1800, 1270);
  ctx.strokeStyle = '#ae8051'; ctx.lineWidth = 20; ctx.strokeRect(45, 45, 1710, 1180); ctx.lineWidth = 3; ctx.strokeRect(79, 79, 1642, 1112);
  ctx.fillStyle = '#77445a'; ctx.textAlign = 'center';
  ctx.font = 'bold 28px Georgia'; ctx.fillText('A LITTLE UNIVERSE   •   THE ASHU COLLECTION', 900, 206);
  ctx.font = '66px Georgia'; ctx.fillText(emoji, 900, 320);
  ctx.font = 'bold 65px Georgia'; ctx.fillText(title, 900, 460);
  ctx.font = '26px Arial'; ctx.fillText('THIS COMMEMORATIVE CERTIFICATE IS PRESENTED TO', 900, 540);
  ctx.fillStyle = '#a65a7a'; ctx.font = 'bold 85px Georgia'; ctx.fillText('Ammuuuuuuuu', 900, 662);
  ctx.font = '31px Georgia'; wrapText(ctx, description, 900, 740, 1450, 46);
  ctx.strokeStyle = '#aa7f50'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(900, 970, 78, 0, 2 * Math.PI); ctx.stroke();
  ctx.font = 'bold 25px Georgia'; ctx.fillText('17 NOV', 900, 972); ctx.font = '21px Georgia'; ctx.fillText('WITH LOVE', 900, 1005);
  ctx.fillStyle = '#75465b'; ctx.font = '26px Georgia';
  ctx.fillText('From Ashu                                      Lifetime keepsake · Not an official credential', 900, 1132);
  const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = `Ammu_${name.replaceAll(' ', '_')}_Certificate.png`; a.click();
}
export function Certificates() {
  const ref = useRef(null);
  const [sel, setSel] = useState(0);
  useScene(ref, q => {
    revealHead(q, ref.current);
    gsap.fromTo(q('.ct-card'), {rotation: 0, x: 0, y: 0}, {
      rotation: (i) => (i - 2.5) * 11, x: (i) => (i - 2.5) * Math.min(120, innerWidth * 0.11), y: (i) => Math.abs(i - 2.5) * 18, ease: 'power2.out',
      scrollTrigger: {trigger: q('.ct-fan')[0], start: 'top 85%', end: 'top 30%', scrub: 1}
    });
    gsap.from(q('.ct-paper'), {rotationX: -60, y: 80, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: {trigger: q('.ct-paper')[0], start: 'top 85%'}});
  });
  const pick = i => {
    setSel(i);
    const p = ref.current?.querySelector('.ct-paper');
    if (p && !matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.fromTo(p, {rotationY: -90, autoAlpha: 0.3}, {rotationY: 0, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.4)'});
  };
  const [name, title, desc, emoji] = CERTS[sel];
  return (
    <section id="certificates" className="ch ch-certs" ref={ref}>
      <ChapterHead kicker="ASHU'S COLLECTOR'S EDITION · MADE JUST FOR YOU" title="Officially Cute" em="Certificate Gallery" sub="Beautiful keepsake certificates, signed by Ashu. Fun commemorative cards, not government credentials." />
      <div className="ct-fan">
        {CERTS.map((c, i) => (
          <button type="button" key={i} className={`ct-card ${i === sel ? 'is-on' : ''}`} style={{zIndex: i === sel ? 10 : i}} onClick={() => pick(i)}>
            <span>{c[3]}</span><b>{c[0]}</b><small>{String(i + 1).padStart(2, '0')}</small>
          </button>
        ))}
      </div>
      <div className="ct-paper">
        <div className="ct-over">A LITTLE UNIVERSE · THE ASHU COLLECTION</div>
        <div className="ct-icon">{emoji}</div>
        <h3>{title}</h3>
        <div className="ct-over">THIS KEEPSAKE IS PRESENTED TO</div>
        <div className="ct-name">Ammuuuuuuuu</div>
        <p>{desc}</p>
        <div className="ct-seal">AWARDED<br />17 NOV<br />♡</div>
        <div className="ct-sign"><span>Presented by <b>Ashuuuuuuuuuuu</b></span><span>Lifetime validity ♡</span></div>
      </div>
      <div className="ct-actions">
        <button type="button" className="btn btn-soft" onClick={() => pick((sel + 1) % CERTS.length)}>Next Certificate →</button>
        <button type="button" className="btn btn-pink" onClick={() => downloadCert(CERTS[sel])}>Download {name} ↓</button>
      </div>
    </section>
  );
}

/* ───────────────────────── 16. FINALE ───────────────────────── */
const FINALE_TEXT = 'From our little arguments in CodeXa Girls to Marvel, Discord, midnight chats, all the movies and our everyday chaos… somewhere in between, you became one of my favourite parts of life. Happiest Birthday, Ammuuuuuuuuuuuuuuuuu. I hope we make a thousand more little memories.';
export function Finale({data}) {
  const ref = useRef(null);
  useScene(ref, q => {
    const tl = gsap.timeline({scrollTrigger: {trigger: q('.fn-pin')[0], start: 'top top', end: '+=200%', pin: true, scrub: 1}});
    tl.from(q('.fn-kicker'), {autoAlpha: 0, y: 20, duration: 0.3})
      .from(q('.fn-h2 > span'), {autoAlpha: 0, yPercent: 100, rotationX: -80, stagger: 0.2, duration: 0.5, ease: 'back.out(1.8)'}, 0.1)
      .fromTo(q('.fn-word'), {opacity: 0.12}, {opacity: 1, stagger: 0.05, duration: 0.2, ease: 'none'}, 0.6)
      .from(q('.fn-sign'), {autoAlpha: 0, scale: 0.8, duration: 0.4}, '>')
      .from(q('.fn-heart i'), {scale: 0, autoAlpha: 0, stagger: {each: 0.01, from: 'random'}, duration: 0.3, ease: 'back.out(3)'}, '<')
      .from(q('.fn-actions > *'), {autoAlpha: 0, y: 30, stagger: 0.1, duration: 0.3}, '>-0.1')
      .to({}, {duration: 0.4});
  });
  // a heart drawn with little hearts
  const heart = [];
  for (let t = 0; t < Math.PI * 2; t += Math.PI / 22) {
    const x = 16 * Math.sin(t) ** 3, y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    heart.push(<i key={t} style={{left: `${50 + x * 2.6}%`, top: `${46 + y * 2.6}%`}}>{['💗', '💖', '✨', '🌸'][heart.length % 4]}</i>);
  }
  return (
    <section id="finale" className="ch ch-finale dark" ref={ref}>
      <div className="fn-pin">
        <div className="fn-heart" aria-hidden="true">{heart}</div>
        <div className="fn-letter">
          <span className="fn-kicker">THE LAST PAGE • BUT NOT OUR LAST MEMORY</span>
          <h2 className="fn-h2"><span>After everything,</span> <span><em>still us. ♡</em></span></h2>
          <p>{FINALE_TEXT.split(' ').map((w, i) => <span key={i} className="fn-word">{w} </span>)}</p>
          <div className="fn-sign">Forever cheering for you,<br /><strong>{data.sender || 'From Ashu'} 💗</strong></div>
          <div className="fn-actions">
            <button type="button" className="btn btn-pink" onClick={() => scrollToId('home')}>Replay Our Little World ↻</button>
            <button type="button" className="btn btn-soft" onClick={() => scrollToId('gifts')}>Open Gifts Again 🎁</button>
            <button type="button" className="btn btn-soft" onClick={e => { burstAt(e.currentTarget); window.ammuOpenCelebration?.(); }}>Celebrate Again 🎉</button>
          </div>
        </div>
      </div>
      <footer className="fn-footer">DESIGNED WITH MEMORIES, HEARTS AND ALL OUR LITTLE CHAOS ♡</footer>
    </section>
  );
}
