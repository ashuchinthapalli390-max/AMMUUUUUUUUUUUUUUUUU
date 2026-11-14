import React, { useState, useEffect } from 'react';

const CHAPTERS = [
  { id: 'home', name: '01 · Our Little Universe' },
  { id: 'journey', name: '02 · Our Journey' },
  { id: 'memories', name: '03 · Photographs & Memories' },
  { id: 'magazine', name: '04 · The Birthday Magazine' },
  { id: 'bestie-id', name: '05 · Bestie ID Card' },
  { id: 'letters', name: '06 · Letters From Ashu' },
  { id: 'playlist', name: '07 · Birthday Playlist' },
  { id: 'movies', name: '08 · Our Cinema Archive' },
  { id: 'midnight', name: '09 · The Midnight Universe' },
  { id: 'games', name: '10 · Cute Games' },
  { id: 'little-things', name: '11 · Tiny Beautiful Things' },
  { id: 'certificates', name: '12 · Certificate Gallery' },
  { id: 'wishes', name: '13 · Three Birthday Wishes' },
  { id: 'cake', name: '14 · 3D Birthday Cake' },
  { id: 'gifts', name: '15 · Two Special Gifts' },
  { id: 'pranks', name: '16 · Dream Gift Showroom' },
  { id: 'memberships', name: '17 · Lifetime Vouchers' },
  { id: 'finale', name: '18 · After Everything, Still Us' },
];

export default function AdminPreviewToolbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);

  // Check admin session server-side
  useEffect(() => {
    fetch('/api/admin/session', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) {
          setIsAdmin(true);
        }
      })
      .catch(() => {});
  }, []);

  if (!isAdmin) return null;

  const handleSelectChapter = (e) => {
    const chapterId = e.target.value;
    if (!chapterId) return;

    // Use global chapter navigation or scroll
    if (window.showChapter) {
      window.showChapter(chapterId);
    } else {
      const el = document.getElementById(chapterId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReloadScene = () => {
    window.location.reload();
  };

  const handleSimulateUnlock = () => {
    if (window.ammuSimulateMidnightUnlock) {
      window.ammuSimulateMidnightUnlock();
    } else {
      const gate = document.getElementById('gate');
      if (gate) {
        gate.style.transition = 'all 1.2s ease';
        gate.style.opacity = '0';
        setTimeout(() => {
          gate.hidden = true;
          const exp = document.getElementById('experience');
          if (exp) exp.hidden = false;
        }, 1200);
      }
    }
  };

  const handleToggleAudio = () => {
    const audios = document.querySelectorAll('audio');
    audios.forEach((a) => {
      a.muted = !audioMuted;
    });
    setAudioMuted(!audioMuted);
  };

  const handleExitPreview = () => {
    window.location.href = '/admin';
  };

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        aria-label="Expand Admin Preview Toolbar"
        style={{
          position: 'fixed',
          bottom: '18px',
          left: '18px',
          zIndex: 9999999,
          background: 'linear-gradient(135deg, #781d45, #aa3363)',
          color: '#FFF',
          border: '1.5px solid #FFC0CB',
          borderRadius: '30px',
          padding: '8px 16px',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
        }}
      >
        👑 Admin Preview
      </button>
    );
  }

  return (
    <div
      role="region"
      aria-label="Private Admin Preview Toolbar"
      style={{
        position: 'fixed',
        bottom: '18px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999999,
        background: 'rgba(35, 10, 24, 0.94)',
        backdropFilter: 'blur(10px)',
        border: '1.5px solid rgba(255, 192, 203, 0.45)',
        borderRadius: '30px',
        padding: '8px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
        color: '#FFF',
        fontSize: '13px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#FFD3E2' }}>
        <span>👑</span>
        <span>Ashu’s Preview</span>
      </div>

      {/* JUMP TO CHAPTER DROPDOWN */}
      <select
        onChange={handleSelectChapter}
        defaultValue=""
        aria-label="Jump to Chapter"
        style={{
          background: 'rgba(255, 255, 255, 0.12)',
          color: '#FFF',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '16px',
          padding: '5px 10px',
          fontSize: '12px',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <option value="" disabled style={{ background: '#351025' }}>Select Chapter ▾</option>
        {CHAPTERS.map((ch) => (
          <option key={ch.id} value={ch.id} style={{ background: '#351025', color: '#FFF' }}>
            {ch.name}
          </option>
        ))}
      </select>

      {/* RELOAD SCENE */}
      <button
        type="button"
        onClick={handleReloadScene}
        style={{
          background: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          color: '#FFE4EF',
          borderRadius: '16px',
          padding: '4px 10px',
          fontSize: '12px',
          cursor: 'pointer',
        }}
      >
        Reload ↻
      </button>

      {/* SIMULATE UNLOCK */}
      <button
        type="button"
        onClick={handleSimulateUnlock}
        style={{
          background: 'linear-gradient(135deg, #A83866, #791E42)',
          border: '1px solid #FFC0CB',
          color: '#FFF',
          borderRadius: '16px',
          padding: '4px 12px',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Simulate Unlock ✨
      </button>

      {/* AUDIO TOGGLE */}
      <button
        type="button"
        onClick={handleToggleAudio}
        aria-label="Toggle preview audio"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#FFF',
          fontSize: '14px',
          cursor: 'pointer',
          padding: '2px',
        }}
      >
        {audioMuted ? '🔇' : '🔊'}
      </button>

      {/* MINIMIZE */}
      <button
        type="button"
        onClick={() => setMinimized(true)}
        aria-label="Minimize preview toolbar"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#D4A5B8',
          fontSize: '13px',
          cursor: 'pointer',
          padding: '2px',
        }}
      >
        ▾
      </button>

      {/* EXIT PREVIEW */}
      <button
        type="button"
        onClick={handleExitPreview}
        style={{
          background: 'rgba(255, 100, 130, 0.25)',
          border: '1px solid rgba(255, 100, 130, 0.4)',
          color: '#FFCCD9',
          borderRadius: '16px',
          padding: '4px 10px',
          fontSize: '12px',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Exit Preview ✕
      </button>
    </div>
  );
}
