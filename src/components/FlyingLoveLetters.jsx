import React, { useState, useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

const BUTTERFLY_THEMES = {
  'blush-pink': { base: '#F8BBD0', accent: '#C9B6EB', body: '#B96587', glow: '#F4A6C1' },
  'lavender': { base: '#D7BCE8', accent: '#F3D1F4', body: '#8A569C', glow: '#C084FC' },
  'pearl-white': { base: '#FFFDF7', accent: '#FCEEF3', body: '#C5A880', glow: '#FFF176' },
  'rose-gold': { base: '#F4A6C1', accent: '#FFE4CD', body: '#B8697F', glow: '#FFB6C1' },
  'soft-blue': { base: '#BEE3F8', accent: '#E0F2FE', body: '#4A7A96', glow: '#93C5FD' },
};

export default function FlyingLoveLetters() {
  const reducedMotion = useReducedMotion();
  const [activeNote, setActiveNote] = useState(null);
  const [butterflyState, setButterflyState] = useState(null);
  const [notesList, setNotesList] = useState([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animFrameRef = useRef(0);
  const butterflyRef = useRef(null);

  // Fetch flying notes from API
  useEffect(() => {
    fetch('/api/flying-notes')
      .then((r) => r.json())
      .then((d) => {
        if (d.notes && d.notes.length) setNotesList(d.notes);
      })
      .catch(() => {});
  }, []);

  // Track cursor position
  useEffect(() => {
    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  // Spawn butterflies at intervals
  useEffect(() => {
    if (reducedMotion) return;

    let spawnTimer = 0;
    const scheduleNextSpawn = () => {
      // Spawn every 18 to 35 seconds
      const delay = Math.random() * 17000 + 18000;
      spawnTimer = window.setTimeout(() => {
        if (!butterflyRef.current && !activeNote) {
          spawnButterfly();
        }
        scheduleNextSpawn();
      }, delay);
    };

    // First spawn after 6 seconds for delightful immediate discovery
    const initialTimer = window.setTimeout(() => {
      spawnButterfly();
      scheduleNextSpawn();
    }, 6000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(spawnTimer);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [reducedMotion, notesList, activeNote]);

  const spawnButterfly = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Pick a note
    const pool = notesList.length > 0 ? notesList : [
      { id: '1', message: "You're mine, only mine... my favourite little chaos! 💗", butterflyColor: 'blush-pink' },
      { id: '2', message: "Your smile deserves its own little universe.", butterflyColor: 'pearl-white' },
      { id: '3', message: "You're one of the loveliest people I've ever known, Pottiiiiiiii.", butterflyColor: 'rose-gold' },
      { id: '4', message: "Some people become memories. You make every memory better.", butterflyColor: 'soft-blue' },
      { id: '5', message: "Your tiny reactions are cuter than a thousand butterflies.", butterflyColor: 'lavender' }
    ];
    const chosenNote = pool[Math.floor(Math.random() * pool.length)];
    const colorKey = chosenNote.butterflyColor || 'blush-pink';
    const theme = BUTTERFLY_THEMES[colorKey] || BUTTERFLY_THEMES['blush-pink'];

    // Start offscreen (left or right edge)
    const fromLeft = Math.random() < 0.5;
    const startX = fromLeft ? -60 : w + 60;
    const startY = Math.random() * (h * 0.6) + h * 0.15;
    const targetX = fromLeft ? w + 120 : -120;
    const targetY = Math.random() * (h * 0.5) + h * 0.2;

    const b = {
      note: chosenNote,
      theme,
      x: startX,
      y: startY,
      targetX,
      targetY,
      vx: fromLeft ? 1.6 : -1.6,
      vy: (Math.random() - 0.5) * 0.8,
      speed: 1.1,
      angle: 0,
      scale: 1,
      isLanded: false,
      fluttersLeft: 900,
    };

    butterflyRef.current = b;
    setButterflyState({ ...b });

    let lastTime = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.04, (now - lastTime) / 1000);
      lastTime = now;

      if (!butterflyRef.current) return;
      const cur = butterflyRef.current;

      if (cur.isLanded) {
        // Paused on ground / landing spot
        return;
      }

      cur.fluttersLeft--;

      // Gentle steering towards target with soft wave
      const dx = cur.targetX - cur.x;
      const dy = cur.targetY - cur.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 40 || cur.fluttersLeft <= 0) {
        // Butterfly flew away
        butterflyRef.current = null;
        setButterflyState(null);
        return;
      }

      // Smooth sine wave flutter
      const wave = Math.sin(now * 0.004) * 0.8;
      cur.vy += wave * dt * 30;

      // Cursor interaction: gently circle near cursor if within 180px
      const mx = mouseRef.current.x - cur.x;
      const my = mouseRef.current.y - cur.y;
      const mouseDist = Math.hypot(mx, my);
      if (mouseDist < 180 && mouseDist > 20) {
        // Soft attraction orbit
        cur.vx += (mx / mouseDist) * 0.35;
        cur.vy += (my / mouseDist) * 0.35;
      } else {
        cur.vx += (dx / dist) * 0.5;
        cur.vy += (dy / dist) * 0.5;
      }

      // Speed clamp
      const curSpeed = Math.hypot(cur.vx, cur.vy);
      const maxSpeed = 2.2 * cur.speed;
      if (curSpeed > maxSpeed) {
        cur.vx = (cur.vx / curSpeed) * maxSpeed;
        cur.vy = (cur.vy / curSpeed) * maxSpeed;
      }

      cur.x += cur.vx;
      cur.y += cur.vy;
      cur.angle = Math.atan2(cur.vy, cur.vx) + Math.PI / 2;

      setButterflyState({ ...cur });
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  };

  const handleButterflyClick = (e) => {
    e.stopPropagation();
    if (!butterflyRef.current || activeNote) return;

    const cur = butterflyRef.current;
    cur.isLanded = true;
    cur.vx = 0;
    cur.vy = 0;

    // Trigger letter reveal
    setActiveNote(cur.note);

    // Audio chime if Web Audio available
    playEnvelopeChime();
  };

  const closeNote = () => {
    setActiveNote(null);
    // Butterfly flutters away smoothly
    if (butterflyRef.current) {
      butterflyRef.current.isLanded = false;
      butterflyRef.current.targetX = window.innerWidth + 150;
      butterflyRef.current.targetY = -80;
      butterflyRef.current.speed = 2.0;
    }
    setTimeout(() => {
      butterflyRef.current = null;
      setButterflyState(null);
    }, 1500);
  };

  const playEnvelopeChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  return (
    <>
      {/* FLYING BUTTERFLY CARRYING MINIATURE ENVELOPE */}
      {butterflyState && !activeNote && (
        <div
          role="button"
          tabIndex={0}
          aria-label="A tiny butterfly carrying a love letter for Ammu. Click to open!"
          onClick={handleButterflyClick}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleButterflyClick(e)}
          style={{
            position: 'fixed',
            left: `${butterflyState.x}px`,
            top: `${butterflyState.y}px`,
            transform: `translate(-50%, -50%) rotate(${butterflyState.angle * 0.4}rad)`,
            cursor: 'pointer',
            zIndex: 9998,
            transition: 'transform 0.08s linear',
            filter: 'drop-shadow(0 6px 12px rgba(139, 44, 82, 0.25))',
            userSelect: 'none',
          }}
        >
          {/* Animated Butterfly SVG */}
          <svg viewBox="-24 -24 48 48" width="46" height="46" style={{ overflow: 'visible', display: 'block' }}>
            <defs>
              <linearGradient id="bf-wing-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFDF7" />
                <stop offset="50%" stopColor={butterflyState.theme.base} />
                <stop offset="100%" stopColor={butterflyState.theme.accent} />
              </linearGradient>
            </defs>

            {/* Left Wings */}
            <g style={{ animation: 'ammuWingFlapLeft 0.22s ease-in-out infinite alternate', transformOrigin: '0px 0px' }}>
              <path d="M0,-3 C-10,-20 -28,-16 -22,-2 C-17,6 -6,4 0,0 Z" fill="url(#bf-wing-grad)" opacity="0.94" />
              <path d="M0,0 C-12,4 -20,13 -14,19 C-8,21 0,10 0,3 Z" fill={butterflyState.theme.base} opacity="0.88" />
            </g>

            {/* Right Wings */}
            <g style={{ animation: 'ammuWingFlapRight 0.22s ease-in-out infinite alternate', transformOrigin: '0px 0px' }}>
              <path d="M0,-3 C10,-20 28,-16 22,-2 C17,6 6,4 0,0 Z" fill="url(#bf-wing-grad)" opacity="0.94" />
              <path d="M0,0 C12,4 20,13 14,19 C8,21 0,10 0,3 Z" fill={butterflyState.theme.base} opacity="0.88" />
            </g>

            {/* Butterfly Body */}
            <ellipse cx="0" cy="0" rx="2.2" ry="8" fill={butterflyState.theme.body} />
            <path d="M-1,-6 Q-5,-12 -8,-14" stroke={butterflyState.theme.body} strokeWidth="1.2" fill="none" />
            <path d="M1,-6 Q5,-12 8,-14" stroke={butterflyState.theme.body} strokeWidth="1.2" fill="none" />
            <circle cx="-8" cy="-14" r="1.3" fill="#D4AF37" />
            <circle cx="8" cy="-14" r="1.3" fill="#D4AF37" />
          </svg>

          {/* Miniature Hanging Folded Paper Envelope */}
          <div
            style={{
              position: 'absolute',
              top: '26px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '28px',
              height: '19px',
              background: '#FFF9F6',
              border: '1px solid #E6B5C7',
              borderRadius: '3px',
              boxShadow: '0 4px 8px rgba(110, 32, 64, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'ammuEnvelopeDangle 1.2s ease-in-out infinite alternate',
              transformOrigin: 'top center',
            }}
          >
            {/* Wax Heart Seal */}
            <span
              style={{
                fontSize: '11px',
                color: '#C23565',
                filter: `drop-shadow(0 0 3px ${butterflyState.theme.glow})`,
                lineHeight: 1,
              }}
            >
              ♥
            </span>
            {/* Small ribbon bow */}
            <div
              style={{
                position: 'absolute',
                top: '-4px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '6px',
                height: '4px',
                borderBottom: '2px solid #E6B5C7',
              }}
            />
          </div>
        </div>
      )}

      {/* UNFOLDED LETTER CARD MODAL */}
      {activeNote && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Little note from Ashu"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(38, 14, 25, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'ammuFadeIn 0.3s ease-out forwards',
          }}
          onClick={closeNote}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '460px',
              width: '100%',
              background: '#FFFDF9',
              borderRadius: '20px',
              border: '2px solid #F1D4E0',
              padding: '36px 32px 30px',
              boxShadow: '0 20px 50px rgba(85, 20, 48, 0.3)',
              textAlign: 'center',
              animation: 'ammuCardUnfold 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              backgroundImage: 'radial-gradient(#FAECEF 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Floral Corner Accents */}
            <span style={{ position: 'absolute', top: '12px', left: '16px', fontSize: '18px', opacity: 0.75 }}>🌸</span>
            <span style={{ position: 'absolute', top: '12px', right: '16px', fontSize: '18px', opacity: 0.75 }}>🌸</span>
            <span style={{ position: 'absolute', bottom: '12px', left: '16px', fontSize: '18px', opacity: 0.75 }}>🌸</span>
            <span style={{ position: 'absolute', bottom: '12px', right: '16px', fontSize: '18px', opacity: 0.75 }}>🌸</span>

            {/* Close Button */}
            <button
              type="button"
              onClick={closeNote}
              aria-label="Close letter"
              style={{
                position: 'absolute',
                top: '14px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                color: '#9C4468',
                cursor: 'pointer',
                padding: '4px 8px',
                lineHeight: 1,
              }}
            >
              ✕
            </button>

            {/* Wax Seal Header */}
            <div
              style={{
                width: '42px',
                height: '42px',
                background: 'linear-gradient(135deg, #C23565, #851C40)',
                borderRadius: '50%',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                fontSize: '20px',
                boxShadow: '0 4px 12px rgba(133, 28, 64, 0.35)',
              }}
            >
              ♥
            </div>

            <div style={{ fontSize: '12px', letterSpacing: '2px', color: '#B35E82', textTransform: 'uppercase', fontWeight: 'bold' }}>
              A Little Note Carried By Butterfly
            </div>

            <h3
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: '24px',
                color: '#631E3C',
                margin: '12px 0 16px',
                fontWeight: 600,
              }}
            >
              For Our Little Chaos 🦋
            </h3>

            {/* Handwritten Message */}
            <p
              style={{
                fontFamily: 'DM Sans, Georgia, sans-serif',
                fontSize: '17px',
                lineHeight: 1.7,
                color: '#4B172E',
                margin: '0 0 24px',
                padding: '0 10px',
                minHeight: '60px',
              }}
            >
              {activeNote.message}
            </p>

            {/* Signature */}
            <div
              style={{
                borderTop: '1px dashed #EFC7D7',
                paddingTop: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '14px',
                color: '#9C4468',
              }}
            >
              <span style={{ fontStyle: 'italic' }}>With love & soft smiles,</span>
              <strong style={{ fontFamily: 'Fraunces, serif', fontSize: '16px', color: '#7E1D45' }}>
                From Ashu ♡
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* WING FLAP & UNLOCKED ANIMATIONS */}
      <style>{`
        @keyframes ammuWingFlapLeft {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0.16); }
        }
        @keyframes ammuWingFlapRight {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0.16); }
        }
        @keyframes ammuEnvelopeDangle {
          0% { transform: translateX(-50%) rotate(-6deg); }
          100% { transform: translateX(-50%) rotate(6deg); }
        }
        @keyframes ammuFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ammuCardUnfold {
          0% { transform: scale(0.6) rotate(-4deg); opacity: 0; }
          70% { transform: scale(1.03) rotate(1deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </>
  );
}
