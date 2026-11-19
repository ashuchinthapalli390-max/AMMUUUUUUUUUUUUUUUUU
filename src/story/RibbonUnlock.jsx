import React, {useEffect, useRef} from 'react';
import gsap from 'gsap';
import './ribbon-unlock.css';

/**
 * Cinematic unlock: a gift drops in, the bow is untied and flies apart, the ribbons
 * unravel, the lid pops off, a bunny peeks out in a burst of light, and the birthday
 * title blooms before the scroll story is revealed underneath.
 */
export default function RibbonUnlock({onReveal, onDone}) {
  const root = useRef(null);
  const tlRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const el = root.current;
    const q = gsap.utils.selector(el);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const burst = (x, y) => window.ammuTriggerMagicalBurst?.(x, y);
    const boxTop = () => {
      const r = q('.ru-lid')[0]?.getBoundingClientRect();
      return r ? [r.left + r.width / 2, r.top + r.height / 2] : [innerWidth / 2, innerHeight / 2];
    };
    const finish = () => { if (!doneRef.current) { doneRef.current = true; onDone?.(); } };

    if (reduced) {
      const tl = gsap.timeline({onComplete: finish});
      tl.set(q('.ru-title-wrap'), {autoAlpha: 1})
        .to(q('.ru-gift'), {autoAlpha: 0, duration: 0.3})
        .add(() => onReveal?.(), '+=1.2')
        .to(el, {autoAlpha: 0, duration: 0.4});
      tlRef.current = tl;
      return () => tl.kill();
    }

    const curls = q('.ru-curl');
    curls.forEach(p => { const len = p.getTotalLength(); gsap.set(p, {strokeDasharray: len, strokeDashoffset: len}); });

    const tl = gsap.timeline({onComplete: finish});
    tlRef.current = tl;
    tl.from(el, {autoAlpha: 0, duration: 0.45})
      .from(q('.ru-glow'), {scale: 0.3, autoAlpha: 0, duration: 1.2, ease: 'power2.out'}, 0)
      .from(q('.ru-gift'), {y: -innerHeight * 0.9, rotation: -12, duration: 1.05, ease: 'bounce.out'}, 0.2)
      .to(q('.ru-gift'), {scaleY: 0.9, scaleX: 1.08, transformOrigin: '50% 100%', duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.inOut'}, 1.05)
      .from(q('.ru-hint'), {autoAlpha: 0, y: 14, duration: 0.5}, 1.1)
      // little wiggle of excitement
      .to(q('.ru-gift'), {keyframes: {rotation: [0, -6, 6, -4, 4, 0]}, transformOrigin: '50% 100%', duration: 0.7, ease: 'none'}, 1.45)
      // untie: loops tighten, knot spins, loops flip
      .to(q('.ru-hint'), {autoAlpha: 0, y: -10, duration: 0.3}, 2.1)
      .to(q('.ru-loop'), {scale: 0.82, svgOrigin: '300 250', duration: 0.25, ease: 'power2.in'}, 2.1)
      .to(q('.ru-knot'), {rotation: 540, svgOrigin: '300 250', duration: 0.75, ease: 'power3.inOut'}, 2.2)
      .to(q('.ru-loop-l'), {scaleX: -0.4, svgOrigin: '300 250', duration: 0.35, yoyo: true, repeat: 1, ease: 'sine.inOut'}, 2.25)
      .to(q('.ru-loop-r'), {scaleX: -0.4, svgOrigin: '300 250', duration: 0.35, yoyo: true, repeat: 1, ease: 'sine.inOut'}, 2.32)
      // bow flies apart, tails slip away, curls unravel
      .to(q('.ru-loop-l'), {x: -340, y: -300, rotation: -260, svgOrigin: '300 250', autoAlpha: 0, duration: 1, ease: 'power3.out'}, 2.95)
      .to(q('.ru-loop-r'), {x: 340, y: -280, rotation: 240, svgOrigin: '300 250', autoAlpha: 0, duration: 1, ease: 'power3.out'}, 2.95)
      .to(q('.ru-knot'), {y: -380, scale: 0.4, autoAlpha: 0, svgOrigin: '300 250', duration: 0.9, ease: 'power3.in'}, 2.95)
      .to(q('.ru-tail'), {y: 260, rotation: (i) => (i ? 40 : -40), svgOrigin: '300 255', autoAlpha: 0, duration: 0.9, ease: 'power2.in'}, 2.95)
      .to(curls, {strokeDashoffset: 0, duration: 0.55, stagger: 0.05, ease: 'power2.out'}, 2.95)
      .to(curls, {strokeDashoffset: (i, t) => -t.getTotalLength(), duration: 0.7, stagger: 0.05, ease: 'power2.in'}, 3.45)
      .to(q('.ru-band-v'), {scaleY: 0, svgOrigin: '300 520', duration: 0.6, ease: 'power3.in'}, 3.05)
      .to(q('.ru-band-lid'), {scaleX: 0, svgOrigin: '300 280', duration: 0.5, ease: 'power3.in'}, 3.1)
      // lid anticipation then pop!
      .to(q('.ru-lid'), {y: 14, duration: 0.18, ease: 'power2.in'}, 3.6)
      .to(q('.ru-lid'), {y: -720, rotation: -38, svgOrigin: '300 280', duration: 0.95, ease: 'power3.out'}, 3.78)
      .add(() => { const [x, y] = boxTop(); burst(x, y + 40); setTimeout(() => burst(x - 120, y + 60), 160); setTimeout(() => burst(x + 120, y + 60), 300); }, 3.8)
      .fromTo(q('.ru-rays'), {scale: 0, autoAlpha: 0}, {scale: 1, autoAlpha: 1, duration: 0.9, ease: 'expo.out'}, 3.8)
      .to(q('.ru-rays'), {rotation: 140, duration: 4, ease: 'none'}, 3.8)
      .fromTo(q('.ru-bunny'), {y: 140}, {y: 0, duration: 0.8, ease: 'back.out(2.2)'}, 4.0)
      .to(q('.ru-bunny-ear'), {rotation: (i) => (i ? 16 : -16), svgOrigin: (i) => (i ? '330 300' : '270 300'), duration: 0.22, yoyo: true, repeat: 3, ease: 'sine.inOut'}, 4.5)
      .fromTo(q('.ru-confetti i'), {y: 0, x: 0, autoAlpha: 1, rotation: 0},
        {y: () => gsap.utils.random(-innerHeight * 0.55, -innerHeight * 0.2), x: () => gsap.utils.random(-innerWidth * 0.45, innerWidth * 0.45),
          rotation: () => gsap.utils.random(-540, 540), duration: 1.4, ease: 'power3.out', stagger: 0.004}, 3.82)
      .to(q('.ru-confetti i'), {y: '+=' + innerHeight * 0.9, autoAlpha: 0, duration: 2.2, ease: 'power1.in', stagger: 0.004}, 5.2)
      // flash + birthday title
      .to(q('.ru-flash'), {autoAlpha: 0.9, duration: 0.25, ease: 'power2.in'}, 4.9)
      .to(q('.ru-gift'), {scale: 0.6, y: 140, autoAlpha: 0, duration: 0.6}, 5.0)
      .to(q('.ru-flash'), {autoAlpha: 0, duration: 0.9, ease: 'power2.out'}, 5.15)
      .set(q('.ru-title-wrap'), {autoAlpha: 1}, 5.1)
      .from(q('.ru-title .ch'), {yPercent: 120, rotationX: -95, autoAlpha: 0, transformOrigin: '50% 50% -20px', stagger: 0.03, duration: 0.8, ease: 'back.out(2)'}, 5.15)
      .from(q('.ru-sub, .ru-kicker'), {autoAlpha: 0, y: 20, filter: 'blur(8px)', stagger: 0.15, duration: 0.7}, 5.6)
      .add(() => burst(innerWidth / 2, innerHeight * 0.42), 5.5)
      // hand over to the story
      .add(() => onReveal?.(), 7.4)
      .to(el, {scale: 1.12, autoAlpha: 0, filter: 'blur(10px)', duration: 1, ease: 'power2.inOut'}, 7.5);
    return () => tl.kill();
  }, [onReveal, onDone]);

  const skip = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (tl.time() < 7.3) tl.seek(7.3);
  };

  const title1 = 'HAPPIEST BIRTHDAYYYYY';
  const title2 = 'AMMUUUUUUU! 💗';
  const chars = s => Array.from(s).map((c, i) => <span key={i} className="ch">{c === ' ' ? ' ' : c}</span>);
  const confetti = Array.from({length: 70}, (_, i) => (
    <i key={i} style={{background: ['#ff6fa5', '#ffd27a', '#c9a7ff', '#8fd8ff', '#ffb3cf', '#fff'][i % 6], borderRadius: i % 3 ? '2px' : '50%'}} />
  ));

  return (
    <div ref={root} className="ru-overlay" role="dialog" aria-label="Untying your birthday ribbon">
      <div className="ru-velvet" />
      <div className="ru-glow" />
      <div className="ru-rays" />
      <div className="ru-stage">
        <svg className="ru-gift" viewBox="0 0 600 600" aria-hidden="true">
          <defs>
            <linearGradient id="ruBox" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd6e5" /><stop offset=".55" stopColor="#ff9cc2" /><stop offset="1" stopColor="#f07aa8" /></linearGradient>
            <linearGradient id="ruLid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe3ee" /><stop offset="1" stopColor="#ffaed0" /></linearGradient>
            <linearGradient id="ruRibbon" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#c9325f" /><stop offset=".5" stopColor="#ff5d95" /><stop offset="1" stopColor="#c9325f" /></linearGradient>
            <radialGradient id="ruInside" cx="50%" cy="0%" r="90%"><stop offset="0" stopColor="#fff6c9" /><stop offset="1" stopColor="#ff9cc2" /></radialGradient>
          </defs>
          <ellipse cx="300" cy="530" rx="190" ry="18" fill="rgba(60,10,40,.35)" />
          {/* bunny waiting inside */}
          <g className="ru-bunny-clip">
            <clipPath id="ruClip"><rect x="140" y="120" width="320" height="185" /></clipPath>
            <g clipPath="url(#ruClip)">
              <g className="ru-bunny">
                <g className="ru-bunny-ear"><ellipse cx="270" cy="250" rx="16" ry="38" fill="#fff" stroke="#e7a3bf" strokeWidth="3" /><ellipse cx="270" cy="252" rx="7" ry="26" fill="#ffb3cd" /></g>
                <g className="ru-bunny-ear"><ellipse cx="330" cy="250" rx="16" ry="38" fill="#fff" stroke="#e7a3bf" strokeWidth="3" /><ellipse cx="330" cy="252" rx="7" ry="26" fill="#ffb3cd" /></g>
                <ellipse cx="300" cy="300" rx="48" ry="40" fill="#fff" stroke="#e7a3bf" strokeWidth="3" />
                <path d="M278 296 q6 -8 12 0 M310 296 q6 -8 12 0" fill="none" stroke="#4b2236" strokeWidth="4" strokeLinecap="round" />
                <ellipse cx="268" cy="308" rx="9" ry="5" fill="#ff9cbf" /><ellipse cx="332" cy="308" rx="9" ry="5" fill="#ff9cbf" />
                <path d="M294 304 q6 -4 12 0 q-6 7 -12 0z" fill="#ff6fa5" />
              </g>
            </g>
          </g>
          {/* box body */}
          <rect x="160" y="300" width="280" height="225" rx="18" fill="url(#ruBox)" />
          <rect x="160" y="300" width="280" height="22" fill="rgba(120,20,60,.15)" />
          <rect className="ru-band-v" x="282" y="300" width="36" height="225" fill="url(#ruRibbon)" />
          <g fill="#fff" opacity=".55"><circle cx="205" cy="360" r="5" /><circle cx="395" cy="410" r="6" /><circle cx="225" cy="470" r="4" /><circle cx="370" cy="340" r="4" /><path d="M215 420 l4 9 l9 1 l-7 6 l2 9 l-8 -5 l-8 5 l2 -9 l-7 -6 l9 -1z" /></g>
          {/* lid */}
          <g className="ru-lid">
            <rect x="140" y="252" width="320" height="56" rx="14" fill="url(#ruLid)" />
            <rect className="ru-band-lid" x="140" y="266" width="320" height="26" fill="url(#ruRibbon)" />
            <rect x="282" y="252" width="36" height="56" fill="url(#ruRibbon)" />
          </g>
          {/* unravelling curls */}
          <g fill="none" stroke="#ff5d95" strokeWidth="10" strokeLinecap="round">
            <path className="ru-curl" d="M300 250 C 250 200, 180 230, 200 170 S 120 120, 60 160" />
            <path className="ru-curl" d="M300 250 C 350 200, 420 230, 400 170 S 480 120, 540 160" />
            <path className="ru-curl" d="M300 252 C 280 320, 210 330, 170 400 S 120 470, 80 520" stroke="#c9a7ff" />
            <path className="ru-curl" d="M300 252 C 320 320, 390 330, 430 400 S 480 470, 520 520" stroke="#ffd27a" />
          </g>
          {/* the bow */}
          <g className="ru-bow">
            <path className="ru-tail" d="M296 254 C 285 300, 262 318, 246 352 L 268 360 C 280 330, 300 300, 304 258Z" fill="#d93c6f" />
            <path className="ru-tail" d="M304 254 C 315 300, 338 318, 354 352 L 332 360 C 320 330, 300 300, 296 258Z" fill="#d93c6f" />
            <path className="ru-loop ru-loop-l" d="M300 250 C 250 175, 172 190, 196 244 C 210 276, 262 268, 300 250Z" fill="url(#ruRibbon)" stroke="#b02a57" strokeWidth="3" />
            <path className="ru-loop ru-loop-r" d="M300 250 C 350 175, 428 190, 404 244 C 390 276, 338 268, 300 250Z" fill="url(#ruRibbon)" stroke="#b02a57" strokeWidth="3" />
            <g className="ru-knot"><circle cx="300" cy="250" r="20" fill="#e8457f" stroke="#b02a57" strokeWidth="3" /><path d="M290 244 q10 -8 20 0" stroke="#ffb3cf" strokeWidth="3" fill="none" strokeLinecap="round" /></g>
          </g>
        </svg>
        <div className="ru-confetti" aria-hidden="true">{confetti}</div>
        <p className="ru-hint">Untying your ribbon, Pottiiiiiiii… 🎀</p>
      </div>
      <div className="ru-title-wrap">
        <span className="ru-kicker">✨ THE MOMENT IS FINALLY HERE ✨</span>
        <h1 className="ru-title"><span className="ru-line">{chars(title1)}</span><span className="ru-line em">{chars(title2)}</span></h1>
        <p className="ru-sub">Your little universe is open. Scroll slowly, it was made for you 💗</p>
      </div>
      <div className="ru-flash" />
      <button type="button" className="ru-skip" onClick={skip}>Skip ✨</button>
    </div>
  );
}
