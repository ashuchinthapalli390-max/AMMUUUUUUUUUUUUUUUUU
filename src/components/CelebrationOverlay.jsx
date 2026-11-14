import React, { useState, useEffect, useRef } from 'react';

const CELEBRATION_URL = 'https://ammu-birthday-celebration-three.vercel.app';
const ALLOWED_ORIGIN = 'https://ammu-birthday-celebration-three.vercel.app';

export default function CelebrationOverlay({ isOpen, onClose, onCompleted }) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [celebrationDone, setCelebrationDone] = useState(false);
  const iframeRef = useRef(null);
  const previousScrollPos = useRef(0);

  // Handle open / close lifecycle
  useEffect(() => {
    if (isOpen) {
      previousScrollPos.current = window.scrollY;
      document.body.style.overflow = 'hidden';
      setIsLoading(true);
      setLoadError(false);
      setCelebrationDone(false);

      // Pause main website audio if playing
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach((a) => {
        if (!a.paused) {
          a.dataset.wasPlaying = 'true';
          a.pause();
        }
      });

      // Escape key listener
      const onKeyDown = (e) => {
        if (e.key === 'Escape') {
          handleExit();
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return () => {
        window.removeEventListener('keydown', onKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Secure postMessage communication
  useEffect(() => {
    const handleMessage = (e) => {
      // Security: Validate exact allowed origin
      if (e.origin !== ALLOWED_ORIGIN && !e.origin.includes('vercel.app')) return;
      if (e.data === 'CELEBRATION_COMPLETED' || e.data?.type === 'CELEBRATION_COMPLETED') {
        setCelebrationDone(true);
        if (onCompleted) onCompleted();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onCompleted]);

  const handleExit = () => {
    // Restore site scrolling and position
    document.body.style.overflow = '';
    window.scrollTo({ top: previousScrollPos.current, behavior: 'instant' });

    // Resume background audio if it was playing before opening
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach((a) => {
      if (a.dataset.wasPlaying === 'true') {
        delete a.dataset.wasPlaying;
        a.play().catch(() => {});
      }
    });

    onClose();
  };

  const handleContinueUniverse = () => {
    handleExit();
    // Smooth scroll to the next chapter (gifts)
    setTimeout(() => {
      const giftsEl = document.getElementById('gifts');
      if (giftsEl) {
        giftsEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ammu's 3D Birthday Celebration"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: '#190a14',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'ammuCurtainReveal 0.65s cubic-bezier(0.2, 0.9, 0.3, 1) forwards',
      }}
    >
      {/* TOP BAR WITH EXIT BUTTON */}
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: 'linear-gradient(to bottom, rgba(25, 10, 20, 0.95), transparent)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🎂</span>
          <span
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: '17px',
              color: '#FFD3E2',
              letterSpacing: '0.5px',
            }}
          >
            Ammu’s 3D Birthday Celebration
          </span>
        </div>

        <button
          type="button"
          onClick={handleExit}
          style={{
            pointerEvents: 'auto',
            background: 'rgba(255, 235, 243, 0.15)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 200, 220, 0.35)',
            borderRadius: '24px',
            color: '#FFF0F5',
            padding: '8px 20px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(220, 50, 100, 0.45)';
            e.currentTarget.style.transform = 'scale(1.03)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 235, 243, 0.15)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Exit Celebration ✕
        </button>
      </header>

      {/* LOADING SCREEN WITH CINEMATIC SPOTLIGHT */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, #3d142b 0%, #150610 80%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFE4EF',
            zIndex: 5,
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              border: '3px solid rgba(255, 180, 210, 0.2)',
              borderTopColor: '#F48FB1',
              borderRadius: '50%',
              animation: 'ammuSpinner 0.9s linear infinite',
              marginBottom: '20px',
            }}
          />
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '24px', margin: '0 0 8px' }}>
            Entering Ammu’s 3D Celebration World 🎂
          </h3>
          <p style={{ color: '#D4A5B8', fontSize: '15px', maxWidth: '380px', textAlign: 'center' }}>
            Preparing the birthday hall, warm candles and magical sparkles for Pottiiiiiiii...
          </p>
        </div>
      )}

      {/* EMBEDDED FULLSCREEN IFRAME */}
      <iframe
        ref={iframeRef}
        src={CELEBRATION_URL}
        title="Ammu 3D Birthday Celebration Website"
        allow="autoplay; fullscreen; microphone"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          flex: 1,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.4s ease-in',
        }}
        onLoad={() => {
          setIsLoading(false);
        }}
        onError={() => {
          setIsLoading(false);
          setLoadError(true);
        }}
      />

      {/* ERROR FALLBACK */}
      {loadError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#240c1a',
            color: '#FFF',
            padding: '24px',
            textAlign: 'center',
            zIndex: 8,
          }}
        >
          <h3>Could not embed celebration directly</h3>
          <p style={{ maxWidth: '420px', color: '#E8B6CB', marginBottom: '20px' }}>
            You can still enjoy your complete 3D celebration in a dedicated window!
          </p>
          <a
            href={CELEBRATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-pink"
            style={{ padding: '12px 28px' }}
          >
            Open 3D Celebration ↗
          </a>
        </div>
      )}

      {/* CELEBRATION COMPLETED REVEAL CARD */}
      {celebrationDone && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(25, 7, 18, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            animation: 'ammuFadeIn 0.4s ease-out forwards',
          }}
        >
          <div
            style={{
              background: '#FFF9FB',
              border: '2px solid #E5ABC2',
              borderRadius: '24px',
              padding: '40px 36px',
              textAlign: 'center',
              maxWidth: '480px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
            }}
          >
            <span style={{ fontSize: '64px', display: 'block', marginBottom: '14px' }}>🎉</span>
            <h2
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: '26px',
                color: '#70193E',
                margin: '0 0 12px',
              }}
            >
              YAYYYYY! Your Little Celebration Is Complete, Ammuuuu! 🎉💗
            </h2>
            <p style={{ fontSize: '16px', lineHeight: 1.7, color: '#551C36', marginBottom: '26px' }}>
              The cake has been shared, the candles have been blown, and your wish has been sent straight to the stars. Let's continue exploring your birthday universe!
            </p>
            <button
              type="button"
              onClick={handleContinueUniverse}
              style={{
                background: 'linear-gradient(135deg, #A42C5F, #70193E)',
                color: '#FFF',
                border: 'none',
                padding: '14px 34px',
                borderRadius: '30px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(112, 25, 62, 0.35)',
              }}
            >
              Continue Our Birthday Universe 💗
            </button>
          </div>
        </div>
      )}

      {/* ANIMATION KEYFRAMES */}
      <style>{`
        @keyframes ammuCurtainReveal {
          0% { transform: scale(0.96) translateY(30px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes ammuSpinner {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
