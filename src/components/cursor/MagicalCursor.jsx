import React, { useRef, useEffect } from 'react';
import CursorParticleCanvas from './CursorParticleCanvas';
import MagicalFocalCursor from './MagicalFocalCursor';
import AmbientButterflies from './AmbientButterflies';
import './cursorEffects.css';

export default function MagicalCursor() {
  const mousePosRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Provide global helper so any component or button can trigger a magical burst
    window.ammuTriggerMagicalBurst = (x, y) => {
      document.dispatchEvent(new CustomEvent('ammu:magical-burst', { detail: { x, y } }));
    };

    return () => {
      delete window.ammuTriggerMagicalBurst;
    };
  }, []);

  return (
    <>
      <CursorParticleCanvas mousePosRef={mousePosRef} />
      <MagicalFocalCursor mousePosRef={mousePosRef} />
      <AmbientButterflies mousePosRef={mousePosRef} />
    </>
  );
}
