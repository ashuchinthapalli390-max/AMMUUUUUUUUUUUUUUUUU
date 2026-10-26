import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

// 4 ethereal background butterflies with animated fluttering wings and organic curved flight paths
const BUTTERFLY_CONFIGS = [
  { id: 1, baseColor: '#F8BBD0', accentColor: '#C9B6EB', scale: 0.85, speed: 1.1, wingSpeed: '0.24s' },
  { id: 2, baseColor: '#F4A6C1', accentColor: '#FFF8F1', scale: 0.75, speed: 0.9, wingSpeed: '0.28s' },
  { id: 3, baseColor: '#E9C987', accentColor: '#F8BBD0', scale: 0.8, speed: 1.25, wingSpeed: '0.22s' },
  { id: 4, baseColor: '#C9B6EB', accentColor: '#E888AC', scale: 0.7, speed: 0.85, wingSpeed: '0.3s' },
];

export default function AmbientButterflies({ mousePosRef }) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef(null);
  const butterfliesRef = useRef([]);

  useEffect(() => {
    if (reducedMotion) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    butterfliesRef.current = BUTTERFLY_CONFIGS.map((cfg, idx) => ({
      ...cfg,
      x: (w * 0.15) + (Math.random() * w * 0.7),
      y: (h * 0.15) + (Math.random() * h * 0.7),
      targetX: Math.random() * w,
      targetY: Math.random() * h,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      angle: 0,
      el: null,
      noiseOffset: idx * 100,
    }));

    let animId = 0;
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const mouse = mousePosRef?.current || { x: -1000, y: -1000 };
      const curW = window.innerWidth;
      const curH = window.innerHeight;

      butterfliesRef.current.forEach((b) => {
        b.noiseOffset += dt * 0.8;

        // Smooth steering toward target point
        const dx = b.targetX - b.x;
        const dy = b.targetY - b.y;
        const distToTarget = Math.hypot(dx, dy);

        if (distToTarget < 120) {
          // Pick new wandering target away from exact center
          b.targetX = Math.random() < 0.5 ? curW * 0.15 + Math.random() * curW * 0.3 : curW * 0.55 + Math.random() * curW * 0.35;
          b.targetY = curH * 0.1 + Math.random() * curH * 0.8;
        }

        // Steer force
        const steerX = (dx / (distToTarget || 1)) * 0.55 * b.speed;
        const steerY = (dy / (distToTarget || 1)) * 0.55 * b.speed;

        b.vx += steerX * dt * 60;
        b.vy += steerY * dt * 60;

        // Repel from cursor if mouse gets too close (< 140px)
        const mx = b.x - mouse.x;
        const my = b.y - mouse.y;
        const distToMouse = Math.hypot(mx, my);
        if (distToMouse < 140 && distToMouse > 0) {
          const repelStrength = (140 - distToMouse) / 140;
          b.vx += (mx / distToMouse) * repelStrength * 3.5;
          b.vy += (my / distToMouse) * repelStrength * 3.5;
        }

        // Clamp speed
        const speed = Math.hypot(b.vx, b.vy);
        const maxSpeed = 2.4 * b.speed;
        if (speed > maxSpeed) {
          b.vx = (b.vx / speed) * maxSpeed;
          b.vy = (b.vy / speed) * maxSpeed;
        }

        // Position update
        b.x += b.vx;
        b.y += b.vy;

        // Boundary wrap
        if (b.x < -50) b.x = curW + 40;
        if (b.x > curW + 50) b.x = -40;
        if (b.y < -50) b.y = curH + 40;
        if (b.y > curH + 50) b.y = -40;

        // Heading rotation (pointing in flight direction)
        const targetAngle = Math.atan2(b.vy, b.vx) + Math.PI / 2;
        b.angle += (targetAngle - b.angle) * 0.08;

        if (b.el) {
          b.el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) rotate(${b.angle}rad) scale(${b.scale})`;
        }
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [reducedMotion, mousePosRef]);

  if (reducedMotion) return null;

  return (
    <div ref={containerRef} className="ammu-ambient-butterfly-container" aria-hidden="true">
      {BUTTERFLY_CONFIGS.map((cfg, idx) => (
        <div
          key={cfg.id}
          ref={(el) => {
            if (butterfliesRef.current[idx]) {
              butterfliesRef.current[idx].el = el;
            }
          }}
          className="ammu-ambient-butterfly"
        >
          <svg viewBox="-20 -20 40 40" width="34" height="34" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id={`ab-wing-grad-${cfg.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF8F1" />
                <stop offset="45%" stopColor={cfg.baseColor} />
                <stop offset="100%" stopColor={cfg.accentColor} />
              </linearGradient>
            </defs>
            {/* Wing Flapping Keyframe Animations */}
            <g>
              {/* Left Wings */}
              <g style={{ animation: `ammuLeftWingFlap ${cfg.wingSpeed} ease-in-out infinite alternate`, transformOrigin: '0px 0px' }}>
                {/* Forewing */}
                <path
                  d="M0,-2 C-8,-16 -22,-14 -18,-2 C-14,4 -4,3 0,0 Z"
                  fill={`url(#ab-wing-grad-${cfg.id})`}
                  opacity="0.92"
                />
                {/* Hindwing */}
                <path
                  d="M0,0 C-10,3 -16,10 -11,15 C-6,17 0,8 0,2 Z"
                  fill={cfg.baseColor}
                  opacity="0.85"
                />
              </g>

              {/* Right Wings */}
              <g style={{ animation: `ammuRightWingFlap ${cfg.wingSpeed} ease-in-out infinite alternate`, transformOrigin: '0px 0px' }}>
                {/* Forewing */}
                <path
                  d="M0,-2 C8,-16 22,-14 18,-2 C14,4 4,3 0,0 Z"
                  fill={`url(#ab-wing-grad-${cfg.id})`}
                  opacity="0.92"
                />
                {/* Hindwing */}
                <path
                  d="M0,0 C10,3 16,10 11,15 C6,17 0,8 0,2 Z"
                  fill={cfg.baseColor}
                  opacity="0.85"
                />
              </g>

              {/* Center Body */}
              <ellipse cx="0" cy="0" rx="1.8" ry="7" fill="#B96587" />
              {/* Antennae */}
              <path d="M-1,-5 Q-4,-10 -6,-12" stroke="#E888AC" strokeWidth="1" fill="none" />
              <path d="M1,-5 Q4,-10 6,-12" stroke="#E888AC" strokeWidth="1" fill="none" />
              <circle cx="-6" cy="-12" r="1.1" fill="#E9C987" />
              <circle cx="6" cy="-12" r="1.1" fill="#E9C987" />
            </g>
          </svg>
        </div>
      ))}
      <style>{`
        @keyframes ammuLeftWingFlap {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0.18); }
        }
        @keyframes ammuRightWingFlap {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0.18); }
        }
      `}</style>
    </div>
  );
}
