import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ParticlePool, triggerClickBurst, triggerHeartGather, PALETTE } from './CursorTrailEngine';
import { playFairySparkleChime } from './cursorAudio';

export default function CursorParticleCanvas({ mousePosRef, focalCursorRef }) {
  const canvasRef = useRef(null);
  const poolRef = useRef(null);
  const liquidSectionRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Allocate particle pool (80 particles max for high 60fps performance)
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    const maxParticles = isMobile ? 35 : 85;
    const pool = new ParticlePool(maxParticles);
    poolRef.current = pool;

    // Handle high DPI display
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse velocity and emission tracking
    let lastX = -100;
    let lastY = -100;
    let lastTime = performance.now();
    let animId = 0;
    let isMoving = false;
    let stopTimer = 0;
    let butterflyCooldown = 0;
    let flowerCooldown = 0;

    // Animation Loop (60 FPS)
    let lastFrameTime = performance.now();
    const renderLoop = (now) => {
      const dt = Math.min(0.045, (now - lastFrameTime) / 1000);
      lastFrameTime = now;

      // Update cooldowns
      butterflyCooldown -= dt;
      flowerCooldown -= dt;

      // Clear Canvas
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Update and Draw Particles
      pool.update(dt);
      pool.draw(ctx);

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    // Pointer movement handler
    const onPointerMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      const now = performance.now();
      const dt = Math.max(8, now - lastTime);

      if (mousePosRef) {
        mousePosRef.current = { x, y };
      }

      // Preserve liquid memory effect for existing scrapbook
      const currentSection = document.querySelector('#experience > section.section.chapter-active');
      if (liquidSectionRef.current && liquidSectionRef.current !== currentSection) {
        liquidSectionRef.current.classList.remove('liquid-hover');
      }
      liquidSectionRef.current = currentSection;
      if (currentSection) {
        const b = currentSection.getBoundingClientRect();
        if (x >= b.left && x <= b.right && y >= b.top && y <= b.bottom) {
          currentSection.style.setProperty('--fluid-x', `${x - b.left}px`);
          currentSection.style.setProperty('--fluid-y', `${y - b.top}px`);
          currentSection.classList.add('liquid-hover');
        } else {
          currentSection.classList.remove('liquid-hover');
        }
      }

      // Calculate movement physics
      const dist = Math.hypot(x - lastX, y - lastY);
      const speed = dist / (dt / 16.6); // pixels per normalized frame

      isMoving = true;
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => {
        isMoving = false;
      }, 110);

      // Distance threshold: emit only if mouse has moved at least 9px
      if (dist >= 9) {
        // Base layer: Fairy Dust (emits on all movement)
        pool.spawn('dust', x + (Math.random() - 0.5) * 8, y + (Math.random() - 0.5) * 8, {
          size: 2.2 + Math.random() * 3.2,
          vx: (Math.random() - 0.5) * 1.0,
          vy: (Math.random() - 0.5) * 1.0 - 0.3,
          color: Math.random() > 0.4 ? PALETTE.babyPink : PALETTE.warmGold,
        });

        // Slow Movement (speed < 4)
        if (speed < 4) {
          // Blooming flowers & tiny sparkles
          if (flowerCooldown <= 0 && Math.random() > 0.6) {
            pool.spawn('flower', x, y, {
              size: 11 + Math.random() * 5,
              maxLife: 1.2,
              vy: -0.4,
              color: PALETTE.softRose
            });
            flowerCooldown = 0.38;
          }
          if (Math.random() > 0.72) {
            pool.spawn('heart', x, y, {
              size: 8 + Math.random() * 5,
              vy: -1.0,
              color: PALETTE.babyPink
            });
          }
          // Occasional gentle butterfly
          if (butterflyCooldown <= 0 && Math.random() > 0.88) {
            pool.spawn('butterfly', x, y - 5, {
              vx: (Math.random() - 0.5) * 1.1,
              vy: -1.4,
              size: 15,
              maxLife: 2.0,
              color: PALETTE.lavender
            });
            butterflyCooldown = 2.2;
          }
        }
        // Normal Movement (4 <= speed < 16)
        else if (speed < 16) {
          // Flowing dust, stars, hearts, petals
          if (Math.random() > 0.45) {
            pool.spawn('star', x, y, {
              size: 6 + Math.random() * 5,
              vx: (Math.random() - 0.5) * 1.4,
              vy: (Math.random() - 0.5) * 1.4 - 0.4,
              color: PALETTE.warmGold
            });
          }
          if (Math.random() > 0.6) {
            pool.spawn('heart', x, y, {
              size: 9 + Math.random() * 5,
              vy: -1.2,
              color: PALETTE.blush
            });
          }
          if (Math.random() > 0.65) {
            pool.spawn('petal', x, y, {
              size: 6 + Math.random() * 4,
              vx: (Math.random() - 0.5) * 1.8,
              vy: 0.5 + Math.random() * 0.8,
              color: PALETTE.softRose
            });
          }
          if (butterflyCooldown <= 0 && Math.random() > 0.92) {
            pool.spawn('butterfly', x, y, {
              vx: (Math.random() - 0.5) * 1.6,
              vy: -1.6,
              size: 16,
              maxLife: 2.1,
              color: PALETTE.babyPink
            });
            butterflyCooldown = 2.5;
          }
        }
        // Fast Movement (speed >= 16)
        else {
          // Extended trail stretching along movement direction
          const dirX = (x - lastX) / (dist || 1);
          const dirY = (y - lastY) / (dist || 1);

          for (let k = 0; k < 2; k++) {
            pool.spawn('dust', x - dirX * (k * 10), y - dirY * (k * 10), {
              size: 3 + Math.random() * 3,
              vx: -dirX * 0.8 + (Math.random() - 0.5) * 1.2,
              vy: -dirY * 0.8 + (Math.random() - 0.5) * 1.2,
              color: PALETTE.ivory,
              maxLife: 0.6
            });
          }
          // Wide petal scatter
          if (Math.random() > 0.4) {
            pool.spawn('petal', x, y, {
              size: 7 + Math.random() * 5,
              vx: (Math.random() - 0.5) * 3.5,
              vy: (Math.random() - 0.5) * 3.5,
              color: PALETTE.softRose
            });
          }
          if (Math.random() > 0.5) {
            pool.spawn('star', x, y, {
              size: 8,
              vx: -dirX * 1.5 + (Math.random() - 0.5) * 2,
              vy: -dirY * 1.5 + (Math.random() - 0.5) * 2,
              color: PALETTE.warmGold
            });
          }
        }

        lastX = x;
        lastY = y;
        lastTime = now;
      }
    };

    // Pointer Click Burst Handler
    const onPointerDown = (e) => {
      // Avoid interrupting typing in inputs
      if (e.target.closest('input, textarea, select, [contenteditable="true"]')) {
        return;
      }

      const x = e.clientX;
      const y = e.clientY;

      // Trigger full multi-stage celebration burst
      triggerClickBurst(pool, x, y);

      // Play subtle fairy chime sound
      playFairySparkleChime();
    };

    // Special Double-Click Heart Gathering Effect
    let lastClickTime = 0;
    let lastClickX = 0;
    let lastClickY = 0;

    const onDblClick = (e) => {
      if (e.target.closest('input, textarea, select, button, a, [role="button"], [contenteditable="true"]')) {
        return;
      }
      triggerHeartGather(pool, e.clientX, e.clientY);
      playFairySparkleChime();
    };

    // Chapter transition peripheral bloom celebration
    const onChapterChange = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      for (let k = 0; k < 8; k++) {
        const x = k % 2 === 0 ? 40 + Math.random() * 140 : w - 40 - Math.random() * 140;
        const y = 120 + Math.random() * (h - 220);
        setTimeout(() => {
          pool.spawn('flower', x, y, { size: 13, color: PALETTE.softRose });
          pool.spawn('heart', x, y, { size: 10, color: PALETTE.babyPink });
          pool.spawn('star', x, y, { size: 8, color: PALETTE.warmGold });
        }, k * 90);
      }
    };

    // Global custom event for element celebrations (check-in, gift claim, etc.)
    const onMagicalBurstEvent = (e) => {
      const detail = e.detail || {};
      const x = detail.x ?? window.innerWidth / 2;
      const y = detail.y ?? window.innerHeight / 2;
      triggerClickBurst(pool, x, y);
      playFairySparkleChime();
    };

    // Page Visibility change: pause/clear
    const onVisibilityChange = () => {
      if (document.hidden) {
        pool.clear();
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('dblclick', onDblClick, { passive: true });
    document.addEventListener('ammu:chapter-change', onChapterChange);
    document.addEventListener('ammu:magical-burst', onMagicalBurstEvent);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('dblclick', onDblClick);
      document.removeEventListener('ammu:chapter-change', onChapterChange);
      document.removeEventListener('ammu:magical-burst', onMagicalBurstEvent);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      cancelAnimationFrame(animId);
      clearTimeout(stopTimer);
      pool.clear();
      liquidSectionRef.current?.classList.remove('liquid-hover');
    };
  }, [reducedMotion, mousePosRef, focalCursorRef]);

  if (reducedMotion) return null;

  return <canvas ref={canvasRef} id="ammu-magical-cursor-canvas" aria-hidden="true" />;
}
