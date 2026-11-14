import React, { useState, useEffect, useRef } from 'react';

export default function LiveGiftSharing({ giftId = 'gift-1', onClaimSuccess }) {
  const [sharingActive, setSharingActive] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(3000);
  const pollTimerRef = useRef(null);

  useEffect(() => {
    // Check initial sharing status
    fetch(`/api/live-sharing/status?giftId=${giftId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.session) setSessionData(d.session);
      })
      .catch(() => {});
  }, [giftId]);

  // Polling for live session sync
  useEffect(() => {
    if (!sharingActive) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/live-sharing/status?giftId=${giftId}`);
        const data = await res.json();
        if (data.session) {
          setSessionData(data.session);
          if (data.session.claimed && onClaimSuccess) {
            onClaimSuccess();
          }
        }
      } catch {}
      pollTimerRef.current = setTimeout(poll, pollingInterval);
    };

    poll();
    return () => clearTimeout(pollTimerRef.current);
  }, [sharingActive, giftId, pollingInterval, onClaimSuccess]);

  const handleStartSharing = async () => {
    try {
      const res = await fetch('/api/live-sharing/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId, action: 'join' }),
      });
      const data = await res.json();
      if (data.session) {
        setSessionData(data.session);
        setSharingActive(true);
      }
    } catch {
      // Fallback: normal viewing without disruption
      setSharingActive(false);
    }
  };

  const handleLeaveSharing = async () => {
    try {
      await fetch('/api/live-sharing/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId, action: 'leave' }),
      });
    } catch {}
    setSharingActive(false);
  };

  return (
    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {!sharingActive ? (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-soft"
            style={{ fontSize: '13px', padding: '8px 18px' }}
            onClick={() => {}}
          >
            View Alone 👤
          </button>
          <button
            type="button"
            className="btn btn-pink"
            style={{ fontSize: '13px', padding: '8px 18px', background: 'linear-gradient(135deg, #A83866, #791E42)' }}
            onClick={handleStartSharing}
          >
            Share This Little Moment With Ashu 💗
          </button>
        </div>
      ) : (
        <div
          style={{
            background: 'rgba(255, 240, 246, 0.95)',
            border: '1.5px solid #EAA4BE',
            borderRadius: '16px',
            padding: '12px 20px',
            boxShadow: '0 4px 14px rgba(140, 35, 75, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '18px', animation: 'ammuHeartBeat 1.2s infinite' }}>💗</span>
          <div style={{ textAlign: 'left' }}>
            <strong style={{ fontSize: '13px', color: '#681A3C', display: 'block' }}>
              Ammu & Ashu are sharing this little moment 💗
            </strong>
            <small style={{ color: '#96486C' }}>
              {sessionData?.ashuActive ? 'Ashu is watching with you right now!' : 'Invitation sent to Ashu’s Studio...'}
            </small>
          </div>
          <button
            type="button"
            onClick={handleLeaveSharing}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '12px',
              color: '#B34F77',
              cursor: 'pointer',
              marginLeft: '8px',
              textDecoration: 'underline',
            }}
          >
            End Share
          </button>
        </div>
      )}

      <style>{`
        @keyframes ammuHeartBeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.25); }
        }
      `}</style>
    </div>
  );
}
