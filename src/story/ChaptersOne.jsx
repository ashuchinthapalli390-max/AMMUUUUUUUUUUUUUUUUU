// Chapters 1-5: Prologue, Journey, Memories, Magazine, Bestie ID.
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {gsap, SplitText, useScene, revealHead, ChapterHead, Overlay} from './kit.jsx';

const rnd = (a, b) => a + Math.random() * (b - a);

/* ───────────────────────── 1. PROLOGUE ───────────────────────── */
export function Prologue({data}) {
  const ref = useRef(null);
  const nick = data.nickname || 'Pottiiiiiiii';
  useScene(ref, q => {
    const split = SplitText.create(q('.pro-h1'), {type: 'words,chars', wordsClass: 'sh-w', charsClass: 'pro-c'});
    // the intro plays the moment the ribbon overlay hands over (not hidden behind it)
    const intro = gsap.timeline({paused: true, delay: 0.15});
    const play = () => intro.play();
    if (window.__ammuStoryRevealed) play(); else window.addEventListener('story:revealed', play, {once: true});
    intro
      .from(split.chars, {autoAlpha: 0, yPercent: 130, rotationX: -100, transformOrigin: '50% 50% -30px', stagger: 0.04, duration: 1.1, ease: 'back.out(1.8)'})
      .from(q('.pro-title .pro-kicker, .pro-scribble'), {autoAlpha: 0, y: 20, stagger: 0.1, duration: 0.7}, 0.2)
      .from(q('.pro-pola'), {autoAlpha: 0, scale: 0.3, rotation: () => rnd(-60, 60), z: -500, duration: 1.3, stagger: 0.12, ease: 'expo.out'}, 0.4)
      .from(q('.pro-photo'), {clipPath: 'circle(0% at 50% 56%)', duration: 1.4, ease: 'expo.out'}, 0.5)
      .from(q('.pro-hint'), {autoAlpha: 0, y: 20, duration: 0.6}, 1.4);

    const tl = gsap.timeline({scrollTrigger: {trigger: q('.pro-pin')[0], start: 'top top', end: '+=230%', pin: true, scrub: 1}});
    // explicit start values: the intro above animates the same elements, so the scroll
    // timeline must not record the intro's hidden "from" state as its starting point
    tl.fromTo(q('.pro-hint'), {autoAlpha: 1}, {autoAlpha: 0, duration: 0.15}, 0)
      .fromTo(q('.pro-title'), {scale: 1, z: 0, autoAlpha: 1, filter: 'blur(0px)'}, {scale: 2.4, z: 300, autoAlpha: 0, filter: 'blur(6px)', ease: 'power2.in', duration: 1}, 0)
      .fromTo(q('.pro-pola'), {x: 0, y: 0, z: 0, rotation: 0, scale: 1, autoAlpha: 1}, {x: (i) => [-1, 1, -1][i] * innerWidth * 0.6, y: (i) => [-1, -0.4, 1][i] * innerHeight * 0.5, rotation: (i) => [-40, 35, 25][i], scale: 1.4, autoAlpha: 0, duration: 1, ease: 'power2.in'}, 0)
      .fromTo(q('.pro-photo'), {clipPath: 'circle(16% at 50% 56%)'}, {clipPath: 'circle(78% at 50% 50%)', duration: 1.1, ease: 'power2.inOut'}, 0.1)
      .fromTo(q('.pro-photo img'), {scale: 1.35}, {scale: 1, duration: 1.4, ease: 'none'}, 0)
      .to(q('.pro-shade'), {autoAlpha: 1, duration: 0.5}, 0.8)
      .from(q('.pro-after > *'), {autoAlpha: 0, y: 60, rotationX: -40, stagger: 0.12, duration: 0.5, ease: 'back.out(1.6)'}, 1.0)
      .to({}, {duration: 0.5});
  });
  return (
    <section id="home" className="ch ch-prologue" ref={ref}>
      <div className="pro-pin">
        <div className="pro-photo"><img src={data.heroImage || '/assets/photos/original_black.jpg'} alt="The birthday girl" /><div className="pro-shade" /></div>
        <div className="pro-polas" aria-hidden="true">
          {['/assets/photos/original_white.jpg', '/assets/photos/ammu_01.jpg', '/assets/photos/ammu_04.jpg'].map((s, i) => (
            <figure key={s} className={`pro-pola p${i}`}><img src={s} alt="" /><figcaption>{['my favourite human', 'birthday girl ✿', 'too cute to handle'][i]}</figcaption></figure>
          ))}
        </div>
        <div className="pro-title">
          <span className="pro-kicker">FOR THE ONE AND ONLY • 17 NOVEMBER</span>
          <div className="pro-scribble">A tiny little universe for…</div>
          <h1 className="pro-h1">Happiest Birthday, <em>Ammuuuu!</em></h1>
        </div>
        <div className="pro-after">
          <span className="pro-kicker light">A STORY IN SIXTEEN LITTLE CHAPTERS</span>
          <h2>Welcome to your universe, <em>{nick}</em></h2>
          <p>From silly fights and midnight conversations to little adventures that mean everything. Here's a world made just for you.</p>
          <div className="pro-sign">with all my heart, <b>{data.sender || 'From Ashu'} ♡</b></div>
        </div>
        <div className="pro-hint" aria-hidden="true"><span className="pro-hint-bunny">🐰</span><span>scroll slowly</span><i /></div>
      </div>
    </section>
  );
}

/* ───────────────────────── 2. JOURNEY (horizontal) ───────────────────────── */
export function Journey({data}) {
  const ref = useRef(null);
  const chapters = data.chapters || [];
  useScene(ref, q => {
    revealHead(q, ref.current);
    const track = q('.jr-track')[0];
    const dist = () => Math.max(0, track.scrollWidth - innerWidth + 40);
    const h = gsap.to(track, {x: () => -dist(), ease: 'none',
      scrollTrigger: {trigger: q('.jr-pin')[0], start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true}});
    gsap.to(q('.jr-thread-fill'), {scaleX: 1, ease: 'none', scrollTrigger: {trigger: q('.jr-pin')[0], start: 'top top', end: () => '+=' + dist(), scrub: true}});
    q('.jr-card').forEach(card => {
      gsap.fromTo(card, {rotationY: -28, z: -180, autoAlpha: 0.35}, {rotationY: 0, z: 0, autoAlpha: 1, ease: 'none',
        scrollTrigger: {trigger: card, containerAnimation: h, start: 'left 105%', end: 'left 45%', scrub: true}});
      const img = card.querySelector('img');
      if (img) gsap.fromTo(img, {xPercent: -10}, {xPercent: 10, ease: 'none', scrollTrigger: {trigger: card, containerAnimation: h, start: 'left right', end: 'right left', scrub: true}});
    });
  }, [chapters.length]);
  return (
    <section id="journey" className="ch ch-journey" ref={ref}>
      <ChapterHead kicker="CHAPTER ONE • OUR STORY" title="Who knew a little fight would become" em="all of this?" sub="From the CodeXa Girls group to midnight talks, movie plans and all our little adventures." />
      <div className="jr-pin">
        <div className="jr-track">
          <div className="jr-intro"><span>{chapters.length}</span><p>little chapters,<br /><em>one big story</em></p><b>keep scrolling →</b></div>
          {chapters.map((c, i) => (
            <article key={c.id || i} className="jr-card">
              <div className="jr-img"><img src={c.image} alt="" loading="lazy" /></div>
              <div className="jr-body">
                <span className="jr-num">{String(i + 1).padStart(2, '0')} / {String(chapters.length).padStart(2, '0')}</span>
                <span className="jr-icon">{c.icon}</span>
                <h3>{c.title}</h3>
                <p>{c.description}</p>
              </div>
            </article>
          ))}
          <div className="jr-outro">…and <em>so many</em> more pages to write 💗</div>
        </div>
        <div className="jr-thread"><div className="jr-thread-fill" /><span>🐰</span></div>
      </div>
    </section>
  );
}

/* ───────────────────────── 3. MEMORIES (3D photo tunnel) ───────────────────────── */
export function Memories({data}) {
  const ref = useRef(null);
  const photos = useMemo(() => (data.gallery || []).filter(p => p.approved !== false), [data.gallery]);
  const spots = useMemo(() => photos.map((_, i) => {
    const a = i * 2.39996; // golden angle spiral keeps photos away from the centre
    const r = 0.28 + (i % 3) * 0.07;
    return {x: Math.cos(a) * r, y: Math.sin(a) * r * 0.8, rot: rnd(-10, 10)};
  }), [photos]);
  const [open, setOpen] = useState(null);
  useScene(ref, q => {
    revealHead(q, ref.current);
    const items = q('.mem-photo');
    const step = 0.16;
    const tl = gsap.timeline({scrollTrigger: {trigger: q('.mem-pin')[0], start: 'top top', end: () => '+=' + Math.max(2600, items.length * 150), pin: true, scrub: 1.2, invalidateOnRefresh: true}});
    items.forEach((el, i) => {
      const s = spots[i];
      tl.fromTo(el, {x: () => s.x * innerWidth, y: () => s.y * innerHeight, z: -3400, rotation: s.rot},
        {z: 700, ease: 'none', duration: 1}, i * step);
      tl.fromTo(el, {autoAlpha: 0}, {autoAlpha: 1, duration: 0.2, ease: 'none'}, i * step);
      tl.to(el, {autoAlpha: 0, duration: 0.12, ease: 'none'}, i * step + 0.86);
    });
    tl.fromTo(q('.mem-center'), {autoAlpha: 0, scale: 0.6}, {autoAlpha: 1, scale: 1, duration: 0.5}, items.length * step * 0.8);
    gsap.from(q('.mem-row'), {xPercent: (i) => (i ? 20 : -20), autoAlpha: 0, duration: 1.2, stagger: 0.15, ease: 'power3.out', scrollTrigger: {trigger: q('.mem-rows')[0], start: 'top 85%'}});
  }, [photos.length]);
  const row = (list, k) => (
    <div className={`mem-row r${k}`} key={k}><div className="mem-row-track">
      {[...list, ...list].map((p, i) => <button type="button" key={i} className="mem-thumb" onClick={() => setOpen(p)}><img src={p.src} alt={p.caption} loading="lazy" /></button>)}
    </div></div>
  );
  return (
    <section id="memories" className="ch ch-memories" ref={ref}>
      <ChapterHead kicker="THE LITTLE THINGS WE KEEP" title="About Our" em="Journey" sub="Every little photograph feels like a page from a story worth keeping. Fly through them 📸" />
      <div className="mem-pin">
        <div className="mem-space">
          {photos.map((p, i) => (
            <button type="button" key={p.id || i} className="mem-photo" onClick={() => setOpen(p)} aria-label={p.caption}>
              <img src={p.src} alt="" loading="lazy" />
              <span>{p.caption}</span>
            </button>
          ))}
        </div>
        <div className="mem-center"><b>{photos.length}</b><span>little forevers 💗</span></div>
      </div>
      <div className="mem-rows">
        {row(photos.slice(0, Math.ceil(photos.length / 2)), 0)}
        {row(photos.slice(Math.ceil(photos.length / 2)), 1)}
      </div>
      <Overlay open={!!open} onClose={() => setOpen(null)} label="Photo" className="st-lightbox">
        {open && <figure className="lb-fig"><img src={open.src} alt={open.caption} /><figcaption>{open.caption}<small>{open.category}</small></figcaption></figure>}
      </Overlay>
    </section>
  );
}

/* ───────────────────────── 4. MAGAZINE (page-turning book) ───────────────────────── */
export function Magazine({data}) {
  const ref = useRef(null);
  const pages = data.magazinePages || [];
  useScene(ref, q => {
    revealHead(q, ref.current);
    const sheets = q('.mz-sheet');
    const turns = Math.max(1, sheets.length - 1);
    const tl = gsap.timeline({scrollTrigger: {trigger: q('.mz-pin')[0], start: 'top top', end: () => '+=' + turns * innerHeight * 0.55, pin: true, scrub: 1, invalidateOnRefresh: true}});
    tl.from(q('.mz-book'), {rotationX: 35, y: 120, scale: 0.85, autoAlpha: 0, duration: 0.8, ease: 'power2.out'});
    sheets.slice(0, -1).forEach((s, i) => {
      tl.to(s, {rotationY: -180, duration: 1, ease: 'power1.inOut'}, 0.8 + i)
        .set(s, {zIndex: 100 + i}, 0.8 + i + 0.5);
    });
    tl.to(q('.mz-count b'), {textContent: sheets.length, snap: {textContent: 1}, duration: turns, ease: 'none'}, 0.8);
  }, [pages.length]);
  return (
    <section id="magazine" className="ch ch-magazine" ref={ref}>
      <ChapterHead kicker="AN EDITORIAL BIRTHDAY KEEPSAKE • FROM ASHU" title="The" em="Ammuuuu Birthday Magazine" sub="Our story as a real little book. Keep scrolling, and the pages turn themselves." />
      <div className="mz-pin">
        <div className="mz-book" id="magazine-book">
          <div className="mz-inside-cover"><span>✿</span><p>This little book belongs to<br /><b>{data.bestieCard?.name || 'Ammuuuu'}</b></p><small>printed with love • {data.sender || 'From Ashu'}</small></div>
          {pages.map((p, i) => {
            const next = pages[i + 1];
            return (
              <div key={i} className={`mz-sheet t-${p.type}`} style={{zIndex: pages.length - i}}>
                <div className="mz-face front">
                  {p.type === 'cover' ? (
                    <div className="mz-cover" style={{backgroundImage: `url(${p.image})`}}>
                      <span>{p.eyebrow}</span><h3>{p.title}</h3><p>{p.subtitle}</p><small>{p.note}</small>
                    </div>
                  ) : (
                    <div className="mz-page">
                      <span className="mz-eyebrow">{p.eyebrow}</span>
                      <div className="mz-mini" style={{backgroundImage: `url(${p.image})`}} />
                      <h3>{p.title}</h3>
                      <h4>{p.subtitle}</h4>
                      <p>{p.body}</p>
                      <small>{p.note}</small>
                      <span className="mz-folio">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                  )}
                </div>
                {next && <div className="mz-face back" style={{backgroundImage: `url(${next.image})`}}><span>{next.note}</span></div>}
              </div>
            );
          })}
        </div>
        <div className="mz-count"><b>1</b> / {pages.length} pages</div>
      </div>
    </section>
  );
}

/* ───────────────────────── 5. BESTIE ID CARD ───────────────────────── */
export function BestieId({data}) {
  const ref = useRef(null);
  const card = data.bestieCard || {};
  const [qr, setQr] = useState('');
  useEffect(() => {
    window.ammuMakeQR?.(location.origin)?.then?.(setQr).catch?.(() => {});
  }, []);
  useScene(ref, q => {
    revealHead(q, ref.current);
    const tl = gsap.timeline({scrollTrigger: {trigger: q('.bi-pin')[0], start: 'top top', end: '+=160%', pin: true, scrub: 1}});
    tl.from(q('.bi-card'), {y: 300, rotationX: 60, rotationZ: -12, scale: 0.7, autoAlpha: 0, duration: 0.6, ease: 'power3.out'})
      .to(q('.bi-holo'), {backgroundPosition: '200% 0', duration: 1.6, ease: 'none'}, 0)
      .to(q('.bi-card'), {rotationY: 180, duration: 0.8, ease: 'power2.inOut'}, 0.7)
      .from(q('.bi-perk'), {autoAlpha: 0, x: 40, scale: 0.8, stagger: 0.08, duration: 0.3}, 1.3)
      .from(q('.bi-stamp'), {scale: 3, autoAlpha: 0, rotation: -40, duration: 0.3, ease: 'back.out(2)'}, 1.7)
      .to({}, {duration: 0.3});
    gsap.to(q('.bi-float'), {y: -14, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut'});
  });
  return (
    <section id="bestie-id" className="ch ch-bestie" ref={ref}>
      <ChapterHead kicker="A ONE-OF-ONE LITTLE KEEPSAKE" title="Your Very Own" em="Bestie ID Card 🎀" sub="One official-looking card for the world's most unofficial, unlimited friendship. A cute keepsake, not a real identity document." />
      <div className="bi-pin">
        <div className="bi-float">
          <div className="bi-card" id="bestie-card" onClick={e => gsap.to(e.currentTarget, {rotationY: '+=180', duration: 0.9, ease: 'back.out(1.4)'})} role="button" tabIndex={0} aria-label="Bestie ID card, tap to flip">
            <div className="bi-face bi-front">
              <div className="bi-holo" />
              <div className="bi-top"><span>✿ THE BESTIE BUREAU</span><b>LIFETIME</b></div>
              <div className="bi-main">
                <img src={card.photo} alt="" />
                <div>
                  <small>NAME</small><h3>{card.name}</h3>
                  <small>ALSO KNOWN AS</small><p>{card.nickname}</p>
                  <small>CARD NO.</small><p className="bi-mono">{card.number}</p>
                  <small>VALID UNTIL</small><p>Forever & ever ♾️</p>
                </div>
              </div>
              <div className="bi-bottom"><span>Issued by <b>{card.issuedBy}</b></span><span className="bi-chip" /></div>
            </div>
            <div className="bi-face bi-back">
              <h4>Official Bestie Perks</h4>
              <ul>{(card.perks || []).map((p, i) => <li key={i} className="bi-perk">💗 {p}</li>)}</ul>
              <div className="bi-back-foot">
                {qr ? <img className="bi-qr" src={qr} alt="QR code to this birthday universe" /> : <div className="bi-qr ph">♡</div>}
                <div className="bi-stamp">APPROVED<br />17·NOV</div>
              </div>
            </div>
          </div>
        </div>
        <p className="bi-tip">scroll to flip • tap to flip back 🔄</p>
      </div>
    </section>
  );
}
