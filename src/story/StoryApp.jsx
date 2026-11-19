import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {gsap, ScrollTrigger, ScrollSmoother, MOTION_OK, scrollToId} from './kit.jsx';
import Universe3D, {PALETTES} from '../fx/Universe3D.js';
import {Prologue, Journey, Memories, Magazine, BestieId} from './ChaptersOne.jsx';
import {Letters, Playlist, Wishes, Cake, Gifts} from './ChaptersTwo.jsx';
import {Movies, Midnight, Games, LittleThings, Certificates, Finale} from './ChaptersThree.jsx';
import './story.css';

export const CHAPTERS = [
  {id: 'home', icon: '🏠', label: 'Our Little Universe'},
  {id: 'journey', icon: '🌱', label: 'Our Journey'},
  {id: 'memories', icon: '📸', label: 'Memories'},
  {id: 'magazine', icon: '📖', label: 'Birthday Magazine'},
  {id: 'bestie-id', icon: '🪪', label: 'Bestie ID'},
  {id: 'letters', icon: '💌', label: 'Letters'},
  {id: 'playlist', icon: '🎧', label: 'Playlist'},
  {id: 'wishes', icon: '🌠', label: 'Three Wishes'},
  {id: 'cake', icon: '🎂', label: 'Birthday Cake'},
  {id: 'gifts', icon: '🎁', label: 'Surprises'},
  {id: 'movies', icon: '🎬', label: 'Cinema Archive'},
  {id: 'midnight', icon: '🌙', label: 'Midnight Universe'},
  {id: 'games', icon: '🎮', label: 'Games'},
  {id: 'little-things', icon: '🫙', label: 'Little Things'},
  {id: 'certificates', icon: '🏅', label: 'Certificates'},
  {id: 'finale', icon: '💗', label: 'Still Us'}
];

function LoveMarquee({words, tone = 'pink'}) {
  const items = [...words, ...words];
  return (
    <div className={`st-marquee tone-${tone}`} aria-hidden="true">
      <div className="st-marquee-track">
        {[0, 1].map(k => (
          <div className="st-marquee-group" key={k}>
            {items.map((w, i) => <span key={i}>{w}<b>{['✿', '♡', '✦', '🎀'][i % 4]}</b></span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Creates the smooth scroller before any chapter builds its ScrollTriggers (first child = first layout effect). */
function SmoothBoot() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    if (!matchMedia(MOTION_OK).matches) return;
    const s = ScrollSmoother.create({wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 1.2, effects: true, smoothTouch: 0.12, normalizeScroll: false});
    return () => s.kill();
  }, []);
  return null;
}

function StoryChrome() {
  const fill = useRef(null);
  const rider = useRef(null);
  const [chapter, setChapter] = useState('home');
  const [showTop, setShowTop] = useState(false);
  const [hideHead, setHideHead] = useState(false);
  useEffect(() => {
    const onCh = e => setChapter(e.detail);
    const onPr = e => {
      const {p, dir, y} = e.detail;
      if (fill.current) fill.current.style.transform = `scaleX(${p})`;
      if (rider.current) rider.current.style.left = `${p * 100}%`;
      setShowTop(y > innerHeight * 1.2);
      setHideHead(dir > 0 && y > 200);
    };
    window.addEventListener('story:chapter', onCh);
    window.addEventListener('story:progress', onPr);
    return () => { window.removeEventListener('story:chapter', onCh); window.removeEventListener('story:progress', onPr); };
  }, []);
  return (
    <>
      <header className={`st-head ${hideHead ? 'is-hidden' : ''}`}>
        <span aria-hidden="true">✿</span><h1>To My Dear Lovelyy Pottiiiiiiiiiiiiiiiiiiii 💗</h1><span aria-hidden="true">✿</span>
      </header>
      <div className={`st-progress ${hideHead ? 'is-up' : ''}`} aria-hidden="true"><div ref={fill} className="st-progress-fill" /><span ref={rider} className="st-progress-rider">🐰</span></div>
      <nav className="st-dock" aria-label="Birthday chapters">
        {CHAPTERS.map(c => (
          <button key={c.id} type="button" className={`st-dot ${chapter === c.id ? 'is-active' : ''}`} onClick={() => scrollToId(c.id)} aria-label={c.label} aria-current={chapter === c.id ? 'true' : undefined}>
            <span className="st-dot-icon">{c.icon}</span><span className="st-dot-label">{c.label}</span>
          </button>
        ))}
      </nav>
      <button type="button" className={`st-top ${showTop ? 'is-shown' : ''}`} onClick={() => { window.ammuUniverseBurst?.(); scrollToId('home'); }} aria-label="Fly back to the top"><span>💗</span><small>top</small></button>
    </>
  );
}

function Story({data}) {
  const canvas = useRef(null);
  const sky = useRef(null);

  useLayoutEffect(() => {
    const reduced = !matchMedia(MOTION_OK).matches;
    let universe = null;
    try {
      universe = new Universe3D(canvas.current, {reduced});
      universe.run();
      window.ammuUniverseBurst = () => universe?.burst();
    } catch (err) {
      console.warn('3D universe unavailable, continuing without WebGL', err);
      canvas.current.style.display = 'none';
    }
    const skyCol = {a: PALETTES.home.sky[0], b: PALETTES.home.sky[1]};
    const paint = () => { sky.current?.style.setProperty('--sky-a', skyCol.a); sky.current?.style.setProperty('--sky-b', skyCol.b); };
    paint();

    const content = document.getElementById('smooth-content');
    const triggers = [];
    triggers.push(ScrollTrigger.create({
      trigger: content, start: 'top top', end: 'bottom bottom',
      onUpdate: self => {
        universe?.setProgress(self.progress);
        universe?.setVelocity(self.getVelocity());
        window.dispatchEvent(new CustomEvent('story:progress', {detail: {p: self.progress, dir: self.direction, y: self.scroll()}}));
      }
    }));
    CHAPTERS.forEach(({id}) => {
      const el = document.getElementById(id);
      if (!el) return;
      triggers.push(ScrollTrigger.create({
        trigger: el, start: 'top 55%', end: 'bottom 55%',
        onToggle: self => {
          if (!self.isActive) return;
          universe?.setPalette(id);
          const pal = PALETTES[id];
          if (pal) gsap.to(skyCol, {a: pal.sky[0], b: pal.sky[1], duration: 1.2, ease: 'power2.out', onUpdate: paint, overwrite: true});
          document.body.classList.toggle('st-night', !!pal?.dark);
          window.dispatchEvent(new CustomEvent('story:chapter', {detail: id}));
        }
      }));
    });

    // velocity-reactive love marquees
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.utils.toArray('.st-marquee').forEach((m, i) => {
        const track = m.querySelector('.st-marquee-track');
        const loop = gsap.fromTo(track, {xPercent: i % 2 ? -50 : 0}, {xPercent: i % 2 ? 0 : -50, duration: 28, ease: 'none', repeat: -1});
        loop.totalTime(28 * 400);
        const skew = gsap.quickTo(m, 'skewY', {duration: 0.5, ease: 'power3'});
        ScrollTrigger.create({trigger: m, start: 'top bottom', end: 'bottom top', onUpdate: self => {
          const v = self.getVelocity();
          loop.timeScale((1 + Math.min(6, Math.abs(v) / 300)) * (self.direction || 1));
          skew(gsap.utils.clamp(-5, 5, v / -300));
        }});
        gsap.fromTo(m, {rotation: i % 2 ? 3 : -3}, {rotation: i % 2 ? -3 : 3, ease: 'none', scrollTrigger: {trigger: m, start: 'top bottom', end: 'bottom top', scrub: true}});
      });
    });

    // layout keeps changing (images, opened gifts, games) → keep every trigger honest
    let t, lastH = content.offsetHeight;
    const ro = new ResizeObserver(() => {
      const h = content.offsetHeight;
      if (Math.abs(h - lastH) < 4) return;
      lastH = h; clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 300);
    });
    ro.observe(content);
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    document.fonts?.ready?.then(refresh);
    requestAnimationFrame(refresh);

    return () => {
      ro.disconnect(); clearTimeout(t);
      window.removeEventListener('load', refresh);
      triggers.forEach(tr => tr.kill());
      mm.revert();
      universe?.dispose();
      delete window.ammuUniverseBurst;
      document.body.classList.remove('st-night');
    };
  }, []);

  return (
    <>
      <div ref={sky} className="st-sky" aria-hidden="true" />
      <canvas ref={canvas} className="st-canvas" aria-hidden="true" />
      <StoryChrome />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <SmoothBoot />
          <Prologue data={data} />
          <LoveMarquee words={['Happiest Birthday Ammuuuu', 'Pottiiiiiiii', '17 November', 'From Ashu']} />
          <Journey data={data} />
          <Memories data={data} />
          <LoveMarquee tone="cream" words={['Every photo, a little forever', 'Too cute to handle', 'Our little universe']} />
          <Magazine data={data} />
          <BestieId data={data} />
          <Letters data={data} />
          <Playlist data={data} />
          <Wishes data={data} />
          <LoveMarquee words={['Make a wish', 'Blow the candles', 'Cake time Pottiiii', 'Yayyyy']} />
          <Cake />
          <Gifts data={data} />
          <Movies data={data} />
          <LoveMarquee tone="night" words={['After midnight', 'One more story', 'Goodnight… or not', 'Stars for Ammu']} />
          <Midnight data={data} />
          <Games />
          <LittleThings data={data} />
          <Certificates />
          <LoveMarquee words={['After everything', 'Still us', 'Forever besties', 'Happy Birthday Ammu']} />
          <Finale data={data} />
        </div>
      </div>
    </>
  );
}

/**
 * The unlocked birthday experience. Mounted by the front door once the server
 * says the birthday is open; uses the bootstrap data it was handed (or fetches it).
 */
export default function StoryApp({open, initialData}) {
  const [data, setData] = useState(initialData?.open ? initialData : null);
  const [error, setError] = useState('');
  useEffect(() => { if (initialData?.open) setData(initialData); }, [initialData]);
  useEffect(() => {
    if (!open || data) return;
    fetch('/api/bootstrap', {credentials: 'same-origin'})
      .then(r => r.json())
      .then(b => { if (b?.open) { setData(b); window.ammuBirthdayConfig = b; } else setError('locked'); })
      .catch(() => setError('network'));
  }, [open, data]);
  useEffect(() => { if (data) window.ammuBirthdayConfig = data; }, [data]);

  return (
    <div id="experience" className="st-root" hidden={!open}>
      {open && data && <Story data={data} />}
      {open && !data && (
        <div className="st-loading">{error ? (error === 'locked' ? 'Your universe opens on 17 November ✨' : 'Could not load your universe. Please reload 💗') : <span className="st-loading-bunny">🐰</span>}</div>
      )}
    </div>
  );
}
