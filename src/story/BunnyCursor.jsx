import React, {useEffect, useRef} from 'react';
import './bunny-cursor.css';

const INTERACTIVE = 'a, button, [role="button"], label, select, summary, input[type="checkbox"], input[type="radio"], .is-clickable, [data-cursor="hover"]';
const BURST = ['💗', '💖', '✿', '✨', '🌸', '♡', '🎀'];

/**
 * A cute rabbit-face cursor: springy follow, floppy ears that react to speed,
 * blinking eyes, happy ^^ eyes over clickable things, squish + heart puff on click.
 * Also provides window.ammuTriggerMagicalBurst(x, y) for celebrations.
 */
export default function BunnyCursor() {
  const rootRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    const layer = layerRef.current;
    const spawnBurst = (x, y, count = 16, spread = 120) => {
      if (!layer) return;
      for (let i = 0; i < count; i++) {
        const s = document.createElement('span');
        s.className = 'bunny-spark';
        s.textContent = BURST[i % BURST.length];
        s.style.left = `${x}px`;
        s.style.top = `${y}px`;
        s.style.fontSize = `${12 + Math.random() * 16}px`;
        layer.appendChild(s);
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const d = spread * (0.45 + Math.random() * 0.75);
        const anim = s.animate([
          {transform: 'translate(-50%,-50%) scale(.2) rotate(0deg)', opacity: 1},
          {transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d - 30}px)) scale(1) rotate(${(Math.random() - 0.5) * 120}deg)`, opacity: 1, offset: 0.55},
          {transform: `translate(calc(-50% + ${Math.cos(a) * d * 1.15}px), calc(-50% + ${Math.sin(a) * d + 40}px)) scale(.7)`, opacity: 0}
        ], {duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,.8,.3,1)'});
        anim.onfinish = () => s.remove();
      }
    };
    window.ammuTriggerMagicalBurst = (x = innerWidth / 2, y = innerHeight / 2) => spawnBurst(x, y, 22, 180);

    const fine = matchMedia('(pointer:fine)').matches;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = rootRef.current;
    if (!fine || !root) return () => { delete window.ammuTriggerMagicalBurst; };

    document.documentElement.classList.add('bunny-cursor-on');
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, vx = 0, vy = 0;
    let earL = 0, earR = 0, tilt = 0, raf = 0, visible = false, lastTrail = 0;

    const move = e => {
      tx = e.clientX; ty = e.clientY;
      if (!visible) { visible = true; x = tx; y = ty; root.classList.add('is-visible'); }
      const over = e.target?.closest?.(INTERACTIVE);
      root.classList.toggle('is-hover', !!over);
      root.classList.toggle('is-text', !!e.target?.closest?.('input:not([type=checkbox]):not([type=radio]), textarea, [contenteditable="true"]'));
    };
    const leave = () => { visible = false; root.classList.remove('is-visible'); };
    const down = e => {
      root.classList.add('is-down');
      if (!reduced) spawnBurst(e.clientX, e.clientY, 8, 60);
    };
    const up = () => root.classList.remove('is-down');

    const loop = now => {
      raf = requestAnimationFrame(loop);
      const k = reduced ? 1 : 0.28;
      const nx = x + (tx - x) * k, ny = y + (ty - y) * k;
      vx = nx - x; vy = ny - y; x = nx; y = ny;
      const speed = Math.min(40, Math.hypot(vx, vy));
      // ears trail behind the movement, then spring back
      earL += ((-vx * 2.2 - speed * 0.8) - earL) * 0.18;
      earR += ((-vx * 2.2 + speed * 0.8) - earR) * 0.18;
      tilt += (vx * 1.4 - tilt) * 0.15;
      root.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${Math.max(-18, Math.min(18, tilt))}deg)`;
      root.style.setProperty('--ear-l', `${Math.max(-50, Math.min(30, earL))}deg`);
      root.style.setProperty('--ear-r', `${Math.max(-30, Math.min(50, earR))}deg`);
      if (!reduced && speed > 14 && now - lastTrail > 70 && layer) {
        lastTrail = now;
        const p = document.createElement('span');
        p.className = 'bunny-trail';
        p.textContent = Math.random() < 0.5 ? '🐾' : '♡';
        p.style.left = `${x - vx * 2}px`;
        p.style.top = `${y - vy * 2 + 14}px`;
        layer.appendChild(p);
        p.animate([{opacity: 0.8, transform: 'translate(-50%,-50%) scale(1)'}, {opacity: 0, transform: 'translate(-50%,-30%) scale(.4)'}], {duration: 700, easing: 'ease-out'}).onfinish = () => p.remove();
      }
    };
    raf = requestAnimationFrame(loop);

    // natural blinking
    let blinkTimer;
    const blink = () => {
      root.classList.add('is-blink');
      setTimeout(() => root.classList.remove('is-blink'), 140);
      blinkTimer = setTimeout(blink, 2200 + Math.random() * 2600);
    };
    blinkTimer = setTimeout(blink, 1800);

    window.addEventListener('pointermove', move, {passive: true});
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(blinkTimer);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('blur', leave);
      document.documentElement.classList.remove('bunny-cursor-on');
      delete window.ammuTriggerMagicalBurst;
    };
  }, []);

  return (
    <>
      <div ref={layerRef} className="bunny-fx-layer" aria-hidden="true" />
      <div ref={rootRef} className="bunny-cursor" aria-hidden="true">
        <svg viewBox="0 0 64 72" width="46" height="52">
          <defs>
            <radialGradient id="bunnyFace" cx="50%" cy="40%" r="60%">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#ffeef5" />
            </radialGradient>
          </defs>
          <g className="bunny-ear left">
            <ellipse cx="21" cy="17" rx="7" ry="16" fill="url(#bunnyFace)" stroke="#e7a3bf" strokeWidth="1.6" />
            <ellipse cx="21" cy="18" rx="3.4" ry="11" fill="#ffb3cd" />
          </g>
          <g className="bunny-ear right">
            <ellipse cx="43" cy="17" rx="7" ry="16" fill="url(#bunnyFace)" stroke="#e7a3bf" strokeWidth="1.6" />
            <ellipse cx="43" cy="18" rx="3.4" ry="11" fill="#ffb3cd" />
          </g>
          <g className="bunny-head">
            <ellipse cx="32" cy="46" rx="21" ry="19" fill="url(#bunnyFace)" stroke="#e7a3bf" strokeWidth="1.8" />
            <g className="bunny-eyes open">
              <ellipse cx="24.5" cy="44" rx="3" ry="3.6" fill="#4b2236" />
              <ellipse cx="39.5" cy="44" rx="3" ry="3.6" fill="#4b2236" />
              <circle cx="25.6" cy="42.6" r="1.1" fill="#fff" />
              <circle cx="40.6" cy="42.6" r="1.1" fill="#fff" />
            </g>
            <g className="bunny-eyes happy" fill="none" stroke="#4b2236" strokeWidth="2.2" strokeLinecap="round">
              <path d="M21 45 Q24.5 40.5 28 45" />
              <path d="M36 45 Q39.5 40.5 43 45" />
            </g>
            <ellipse className="bunny-cheek" cx="18.5" cy="51" rx="4" ry="2.6" fill="#ff9cbf" />
            <ellipse className="bunny-cheek" cx="45.5" cy="51" rx="4" ry="2.6" fill="#ff9cbf" />
            <g className="bunny-nose">
              <path d="M29.6 49.2 Q32 47.6 34.4 49.2 Q32 52.2 29.6 49.2Z" fill="#ff6fa5" />
              <path d="M32 51.4 V53.6 M32 53.6 Q29.4 56 27.6 54.2 M32 53.6 Q34.6 56 36.4 54.2" fill="none" stroke="#a5587a" strokeWidth="1.2" strokeLinecap="round" />
            </g>
          </g>
          <g className="bunny-bow">
            <path d="M44 31 l-6 -4 v8z M44 31 l6 -4 v8z" fill="#ff6fa5" />
            <circle cx="44" cy="31" r="2" fill="#e8457f" />
          </g>
        </svg>
      </div>
    </>
  );
}
