import React, { useState, useEffect, useRef } from 'react';

export default function HiddenCompliments() {
  const [activeSurprise, setActiveSurprise] = useState(null);
  const [complimentsList, setComplimentsList] = useState([]);
  const [cursorHeart, setCursorHeart] = useState(null);
  const recentSeen = useRef(new Set());

  // Fetch compliments
  useEffect(() => {
    fetch('/api/compliments')
      .then((r) => r.json())
      .then((d) => {
        if (d.compliments && d.compliments.length) {
          setComplimentsList(d.compliments);
        }
      })
      .catch(() => {});
  }, []);

  // Expose global trigger for compliments so other chapters (scrapbook, magazine, gifts, flowers) can call it
  useEffect(() => {
    window.ammuTriggerCompliment = (category = 'cursor', explicitText = null) => {
      let text = explicitText;
      if (!text) {
        const pool = complimentsList.filter((c) => c.category === category);
        const candidates = pool.filter((c) => !recentSeen.current.has(c.id));
        const chosen = candidates.length > 0
          ? candidates[Math.floor(Math.random() * candidates.length)]
          : pool[Math.floor(Math.random() * pool.length)];

        if (chosen) {
          text = chosen.text;
          recentSeen.current.add(chosen.id);
          if (recentSeen.current.size > 8) {
            recentSeen.current.clear();
          }
        }
      }
      if (text) {
        setActiveSurprise({ text, category });
      }
    };

    return () => {
      delete window.ammuTriggerCompliment;
    };
  }, [complimentsList]);

  // Occasional cursor surprise heart (every 25-45 seconds)
  useEffect(() => {
    let cursorTimer = 0;
    const scheduleCursorSurprise = () => {
      cursorTimer = window.setTimeout(() => {
        if (!cursorHeart && !activeSurprise) {
          const x = Math.min(window.innerWidth - 60, Math.max(60, window.innerWidth * (0.2 + Math.random() * 0.6)));
          const y = Math.min(window.innerHeight - 60, Math.max(80, window.innerHeight * (0.2 + Math.random() * 0.6)));
          setCursorHeart({ x, y });
        }
        scheduleCursorSurprise();
      }, Math.random() * 20000 + 25000);
    };

    scheduleCursorSurprise();
    return () => clearTimeout(cursorTimer);
  }, [cursorHeart, activeSurprise]);

  const handleCursorHeartHover = () => {
    if (!cursorHeart) return;
    setCursorHeart(null);
    if (window.ammuTriggerCompliment) {
      window.ammuTriggerCompliment('cursor');
    }
  };

  const closeSurprise = () => {
    setActiveSurprise(null);
  };

  return (
    <>
      {/* TINY CURSOR SURPRISE GLOWING HEART */}
      {cursorHeart && (
        <div
          role="button"
          tabIndex={0}
          aria-label="A tiny secret heart near the cursor! Hover or click to reveal a surprise."
          onMouseEnter={handleCursorHeartHover}
          onClick={handleCursorHeartHover}
          style={{
            position: 'fixed',
            left: `${cursorHeart.x}px`,
            top: `${cursorHeart.y}px`,
            transform: 'translate(-50%, -50%)',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 9990,
            animation: 'ammuPulseHeart 1s ease-in-out infinite alternate',
            filter: 'drop-shadow(0 0 8px #FF69B4)',
            userSelect: 'none',
          }}
        >
          💖
        </div>
      )}

      {/* DELIGHTFUL SWEET COMPLIMENT TOAST */}
      {activeSurprise && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            maxWidth: '380px',
            background: 'linear-gradient(135deg, #FFF9FA, #FFF2F6)',
            border: '1.5px solid #EAA4BE',
            borderRadius: '18px',
            padding: '18px 22px 16px',
            boxShadow: '0 12px 36px rgba(130, 30, 68, 0.22)',
            zIndex: 99998,
            animation: 'ammuToastSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>✨</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1.5px',
                  color: '#9C335C',
                  textTransform: 'uppercase',
                }}
              >
                Secret Whisper Unlocked
              </span>
            </div>
            <button
              type="button"
              onClick={closeSurprise}
              aria-label="Close surprise note"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#AA4C74',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '2px 6px',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          <p
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: '15px',
              lineHeight: 1.6,
              color: '#551C36',
              margin: '2px 0 0',
              fontStyle: 'italic',
            }}
          >
            “{activeSurprise.text}”
          </p>

          <span style={{ alignSelf: 'flex-end', fontSize: '12px', color: '#B35E82', fontWeight: 600 }}>
            — From Ashu ♡
          </span>
        </div>
      )}

      <style>{`
        @keyframes ammuPulseHeart {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.75; }
          100% { transform: translate(-50%, -50%) scale(1.25); opacity: 1; }
        }
        @keyframes ammuToastSlideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
