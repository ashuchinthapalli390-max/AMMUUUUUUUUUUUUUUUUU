import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export default function MagicalFocalCursor({ mousePosRef }) {
  const reducedMotion = useReducedMotion();
  const cursorRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isFinePointer = useRef(false);

  useEffect(() => {
    const fineMatch = window.matchMedia('(pointer: fine)');
    isFinePointer.current = fineMatch.matches;
    const sync = () => { isFinePointer.current = fineMatch.matches; };
    fineMatch.addEventListener('change', sync);
    return () => fineMatch.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let animId = 0;

    const onPointerMove = (e) => {
      if (!isFinePointer.current) return;
      targetX = e.clientX;
      targetY = e.clientY;
      setIsVisible(true);

      // Check if hovering over clickable element
      const target = e.target;
      const isClickable = !!(
        target &&
        (target.closest('button, a, [role="button"], input[type="submit"], input[type="button"], .btn, .card, .gallery-card, .polaroid, .icon-btn, .ad-day, .chapter-page-dots button'))
      );
      setIsHovering(isClickable);
    };

    const onPointerLeave = () => {
      setIsVisible(false);
      setIsHovering(false);
    };

    // Smooth spring physics follower (lerp)
    const springLoop = () => {
      currentX += (targetX - currentX) * 0.28;
      currentY += (targetY - currentY) * 0.28;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        cursorRef.current.style.opacity = isVisible ? '1' : '0';
      }

      animId = requestAnimationFrame(springLoop);
    };

    animId = requestAnimationFrame(springLoop);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
    window.addEventListener('blur', onPointerLeave);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('blur', onPointerLeave);
      cancelAnimationFrame(animId);
    };
  }, [reducedMotion, isVisible]);

  if (reducedMotion) return null;

  return (
    <div
      ref={cursorRef}
      className={`ammu-focal-cursor ${isHovering ? 'is-hovering' : ''}`}
      aria-hidden="true"
    >
      <div className="ammu-cursor-halo" />
      <div className="ammu-cursor-dot" />
    </div>
  );
}
