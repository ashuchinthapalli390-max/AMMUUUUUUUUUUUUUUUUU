// Shared building blocks for the scroll story.
import React, {useEffect, useLayoutEffect} from 'react';
import {createPortal} from 'react-dom';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {ScrollSmoother} from 'gsap/ScrollSmoother';
import {SplitText} from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
export {gsap, ScrollTrigger, ScrollSmoother, SplitText};

export const MOTION_OK = '(prefers-reduced-motion: no-preference)';

/** Build a GSAP scene scoped to a ref; only runs when the viewer allows motion. */
export function useScene(ref, build, deps = []) {
  useLayoutEffect(() => {
    if (!ref.current) return;
    const mm = gsap.matchMedia(ref.current);
    mm.add(MOTION_OK, () => build(gsap.utils.selector(ref.current), ref.current));
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Letter-by-letter 3D reveal for a chapter heading, played as it scrolls in. */
export function revealHead(q, trigger, {scrub = false} = {}) {
  const title = q('.sh-title')[0];
  if (!title) return null;
  const split = SplitText.create(title, {type: 'words,chars', wordsClass: 'sh-w', charsClass: 'sh-c'});
  const tl = gsap.timeline({scrollTrigger: {trigger: trigger || title, start: 'top 80%', toggleActions: 'play none none reverse', ...(scrub ? {scrub: 1, end: 'top 30%'} : {})}});
  tl.from(q('.sh-kicker'), {autoAlpha: 0, letterSpacing: '0.8em', y: 16, duration: 0.8, ease: 'power3.out'}, 0)
    .from(split.chars, {autoAlpha: 0, yPercent: 120, rotationX: -100, z: -60, transformOrigin: '50% 50% -20px', stagger: 0.022, duration: 0.85, ease: 'back.out(1.9)'}, 0.08)
    .from(q('.sh-sub'), {autoAlpha: 0, y: 24, filter: 'blur(10px)', duration: 0.8, ease: 'power2.out'}, 0.35);
  return tl;
}

export function ChapterHead({kicker, title, em, sub, light = false, align = 'center'}) {
  return (
    <header className={`sh ${light ? 'sh-light' : ''} sh-${align}`}>
      {kicker && <span className="sh-kicker">{kicker}</span>}
      <h2 className="sh-title">{title}{em && <> <em>{em}</em></>}</h2>
      {sub && <p className="sh-sub">{sub}</p>}
    </header>
  );
}

/** Fullscreen layer rendered on <body> so it is never trapped inside the smooth-scroll transform. */
export function Overlay({open, onClose, children, label, className = ''}) {
  useEffect(() => {
    if (!open) return;
    const onKey = e => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    const smoother = ScrollSmoother.get();
    smoother?.paused(true);
    return () => { window.removeEventListener('keydown', onKey); smoother?.paused(false); };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className={`st-overlay ${className}`} role="dialog" aria-modal="true" aria-label={label}>
      <div className="st-overlay-bg" onClick={onClose} />
      <div className="st-overlay-body">
        <button type="button" className="st-overlay-close" onClick={onClose} aria-label="Close">✕</button>
        {children}
      </div>
    </div>,
    document.body
  );
}

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const smoother = ScrollSmoother.get();
  if (smoother) smoother.scrollTo(el, true, 'top top');
  else window.scrollTo({top: el.getBoundingClientRect().top + window.scrollY, behavior: 'smooth'});
}

export const burstAt = el => {
  const r = el?.getBoundingClientRect?.();
  window.ammuTriggerMagicalBurst?.(r ? r.left + r.width / 2 : innerWidth / 2, r ? r.top + r.height / 2 : innerHeight / 2);
  window.ammuUniverseBurst?.();
};

export async function postJSON(url, body) {
  const res = await fetch(url, {method: 'POST', credentials: 'same-origin', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)});
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok || data.ok === false) throw new Error(data?.error?.message || 'Something went wrong, please try again 🌸');
  return data;
}

export const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
