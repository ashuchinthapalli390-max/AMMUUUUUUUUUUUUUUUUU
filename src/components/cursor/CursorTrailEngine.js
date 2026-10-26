// Ultra Cute Magical Cursor Particle Engine for Ammu's Birthday Website
// Complete physics simulation, custom vector rendering (butterflies, hearts, stars, flowers, dust, bows)

export const PALETTE = {
  babyPink: '#F8BBD0',
  blush: '#F4A6C1',
  softRose: '#E888AC',
  lavender: '#C9B6EB',
  ivory: '#FFF8F1',
  warmGold: '#E9C987',
  berryPink: '#B96587',
  pearlWhite: '#FFFFFF',
};

const COLOR_LIST = [
  PALETTE.babyPink,
  PALETTE.blush,
  PALETTE.softRose,
  PALETTE.lavender,
  PALETTE.ivory,
  PALETTE.warmGold,
];

export class Particle {
  constructor() {
    this.active = false;
    this.type = 'dust'; // 'dust' | 'star' | 'heart' | 'flower' | 'petal' | 'butterfly' | 'bow'
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.size = 6;
    this.maxSize = 6;
    this.rotation = 0;
    this.vRot = 0;
    this.life = 1;
    this.maxLife = 1;
    this.color = PALETTE.babyPink;
    this.secondaryColor = PALETTE.ivory;
    this.alpha = 1;
    this.scale = 1;
    this.swayPhase = 0;
    this.swaySpeed = 0;
    this.swayAmp = 0;
    this.wingPhase = 0;
    this.wingSpeed = 0;
    this.bloomProgress = 0;
    this.isClickBurst = false;
    this.gatherTarget = null;
    this.gatherHoldTime = 0;
  }

  init(type, x, y, options = {}) {
    this.active = true;
    this.type = type;
    this.x = x;
    this.y = y;
    this.vx = options.vx ?? (Math.random() - 0.5) * 1.5;
    this.vy = options.vy ?? (Math.random() - 0.5) * 1.5;
    this.ax = options.ax ?? 0;
    this.ay = options.ay ?? 0;
    this.rotation = options.rotation ?? Math.random() * Math.PI * 2;
    this.vRot = options.vRot ?? (Math.random() - 0.5) * 0.08;
    this.maxLife = options.maxLife ?? 1.2;
    this.life = this.maxLife;
    this.size = options.size ?? 8;
    this.maxSize = this.size;
    this.color = options.color ?? COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)];
    this.secondaryColor = options.secondaryColor ?? (Math.random() > 0.5 ? PALETTE.ivory : PALETTE.warmGold);
    this.alpha = 1;
    this.scale = options.scale ?? 1;
    this.swayPhase = Math.random() * Math.PI * 2;
    this.swaySpeed = 2 + Math.random() * 4;
    this.swayAmp = options.swayAmp ?? (10 + Math.random() * 20);
    this.wingPhase = Math.random() * Math.PI * 2;
    this.wingSpeed = 16 + Math.random() * 10;
    this.bloomProgress = 0;
    this.isClickBurst = !!options.isClickBurst;
    this.gatherTarget = options.gatherTarget ?? null;
    this.gatherHoldTime = options.gatherHoldTime ?? 0;

    // Type-specific baseline adjustments
    if (type === 'butterfly') {
      this.size = options.size ?? (14 + Math.random() * 8);
      this.maxLife = options.maxLife ?? (1.8 + Math.random() * 1.2);
      this.life = this.maxLife;
      this.ay = -0.015; // gentle upward lift
    } else if (type === 'heart') {
      this.size = options.size ?? (10 + Math.random() * 8);
      this.maxLife = options.maxLife ?? (1.3 + Math.random() * 0.9);
      this.life = this.maxLife;
      this.vy = (this.vy < 0 ? this.vy : -this.vy) * 0.7 - 0.6; // gentle upward float
      this.ay = -0.02;
    } else if (type === 'star') {
      this.size = options.size ?? (6 + Math.random() * 8);
      this.maxLife = options.maxLife ?? (0.7 + Math.random() * 0.6);
      this.life = this.maxLife;
    } else if (type === 'flower') {
      this.size = options.size ?? (11 + Math.random() * 7);
      this.maxLife = options.maxLife ?? (1.4 + Math.random() * 0.8);
      this.life = this.maxLife;
      this.ay = -0.01;
    } else if (type === 'petal') {
      this.size = options.size ?? (6 + Math.random() * 5);
      this.maxLife = options.maxLife ?? (1.1 + Math.random() * 0.7);
      this.life = this.maxLife;
      this.ay = 0.03; // gentle falling petal
    } else if (type === 'bow') {
      this.size = options.size ?? (12 + Math.random() * 6);
      this.maxLife = options.maxLife ?? (1.5 + Math.random() * 0.8);
      this.life = this.maxLife;
      this.ay = -0.01;
    } else {
      // fairy dust
      this.size = options.size ?? (2.5 + Math.random() * 4);
      this.maxLife = options.maxLife ?? (0.6 + Math.random() * 0.6);
      this.life = this.maxLife;
    }
  }

  update(dt) {
    if (!this.active) return;

    this.life -= dt;
    if (this.life <= 0) {
      this.active = false;
      return;
    }

    const progress = 1 - (this.life / this.maxLife); // 0 -> 1

    // Handle double-click gathering target
    if (this.gatherTarget) {
      const dx = this.gatherTarget.x - this.x;
      const dy = this.gatherTarget.y - this.y;
      this.x += dx * 0.14;
      this.y += dy * 0.14;
      this.alpha = Math.min(1, progress * 4);
      this.gatherHoldTime -= dt;
      if (this.gatherHoldTime <= 0) {
        // Burst out
        this.gatherTarget = null;
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
      }
      return;
    }

    // Velocity & Acceleration
    this.vx += this.ax;
    this.vy += this.ay;
    this.x += this.vx;
    this.y += this.vy;

    // Drag / damping
    this.vx *= 0.985;
    this.vy *= 0.985;

    // Rotation
    this.rotation += this.vRot;

    // Natural sinusoidal sway
    this.swayPhase += this.swaySpeed * dt;
    if (this.type === 'butterfly' || this.type === 'heart' || this.type === 'petal') {
      this.x += Math.sin(this.swayPhase) * (this.swayAmp * dt);
    }

    // Wing flapping
    this.wingPhase += this.wingSpeed * dt;

    // Bloom progress for flowers
    if (this.type === 'flower') {
      this.bloomProgress = Math.min(1, progress / 0.35);
    }

    // Opacity / Fade curve
    if (progress < 0.15) {
      this.alpha = progress / 0.15; // smooth fade in
    } else {
      this.alpha = Math.max(0, 1 - Math.pow((progress - 0.15) / 0.85, 1.3)); // smooth quadratic fade out
    }
  }

  draw(ctx) {
    if (!this.active || this.alpha <= 0.005) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));

    switch (this.type) {
      case 'butterfly':
        this.drawButterfly(ctx);
        break;
      case 'heart':
        this.drawHeart(ctx);
        break;
      case 'star':
        this.drawStar(ctx);
        break;
      case 'flower':
        this.drawFlower(ctx);
        break;
      case 'petal':
        this.drawPetal(ctx);
        break;
      case 'bow':
        this.drawBow(ctx);
        break;
      case 'dust':
      default:
        this.drawDust(ctx);
        break;
    }

    ctx.restore();
  }

  // A. Animated Butterfly Vector Drawing (Two fluttering wings with soft gradient)
  drawButterfly(ctx) {
    const s = this.size;
    const flap = Math.cos(this.wingPhase); // -1 to 1 (realistic wing fold)

    // Body
    ctx.fillStyle = PALETTE.berryPink;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.14, s * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Antennae
    ctx.strokeStyle = PALETTE.softRose;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-s * 0.08, -s * 0.4);
    ctx.quadraticCurveTo(-s * 0.25, -s * 0.75, -s * 0.4, -s * 0.8);
    ctx.moveTo(s * 0.08, -s * 0.4);
    ctx.quadraticCurveTo(s * 0.25, -s * 0.75, s * 0.4, -s * 0.8);
    ctx.stroke();

    // Tiny pearl tips on antennae
    ctx.fillStyle = PALETTE.warmGold;
    ctx.beginPath();
    ctx.arc(-s * 0.4, -s * 0.8, s * 0.08, 0, Math.PI * 2);
    ctx.arc(s * 0.4, -s * 0.8, s * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Draw Left and Right Wings with flap scale
    const drawWings = (side) => {
      ctx.save();
      ctx.scale(side * flap, 1);

      // Top Forewing
      const grad = ctx.createRadialGradient(s * 0.3, -s * 0.3, s * 0.1, s * 0.4, -s * 0.3, s * 0.9);
      grad.addColorStop(0, PALETTE.ivory);
      grad.addColorStop(0.4, this.color);
      grad.addColorStop(1, PALETTE.lavender);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.15);
      ctx.bezierCurveTo(s * 0.4, -s * 0.9, s * 1.1, -s * 0.7, s * 0.9, -s * 0.1);
      ctx.bezierCurveTo(s * 0.7, s * 0.2, s * 0.2, s * 0.05, 0, 0);
      ctx.fill();

      // Lower Hindwing
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(s * 0.5, 0.1, s * 0.85, s * 0.4, s * 0.6, s * 0.7);
      ctx.bezierCurveTo(s * 0.3, s * 0.8, 0, s * 0.35, 0, s * 0.1);
      ctx.fill();

      // Delicate inner shimmer spot
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.arc(s * 0.45, -s * 0.35, s * 0.12, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    drawWings(1);  // Right wing
    drawWings(-1); // Left wing
  }

  // B. Floating Pink Heart Vector Drawing
  drawHeart(ctx) {
    const s = this.size;
    ctx.save();
    ctx.scale(s / 12, s / 12);

    ctx.fillStyle = this.color;
    ctx.shadowColor = PALETTE.softRose;
    ctx.shadowBlur = 6;

    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.bezierCurveTo(-6, -10, -12, -4, -12, 2);
    ctx.bezierCurveTo(-12, 7, -6, 12, 0, 16);
    ctx.bezierCurveTo(6, 12, 12, 7, 12, 2);
    ctx.bezierCurveTo(12, -4, 6, -10, 0, -2);
    ctx.closePath();
    ctx.fill();

    // Soft heart highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(-4, 0, 2, 4, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // C. Magical Stars (4-point and 5-point glints)
  drawStar(ctx) {
    const s = this.size;
    ctx.save();

    // Soft golden/pink glow
    ctx.shadowColor = this.secondaryColor;
    ctx.shadowBlur = 8;

    // 4-point diamond star
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(0, 0, s, 0);
    ctx.quadraticCurveTo(0, 0, 0, s);
    ctx.quadraticCurveTo(0, 0, -s, 0);
    ctx.quadraticCurveTo(0, 0, 0, -s);
    ctx.fill();

    // Bright center glint
    ctx.fillStyle = PALETTE.pearlWhite;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // D. Blooming Flower (Bud to blossom)
  drawFlower(ctx) {
    const s = this.size * (0.35 + 0.65 * this.bloomProgress);
    const petals = 5;

    ctx.save();
    ctx.shadowColor = PALETTE.softRose;
    ctx.shadowBlur = 4;

    // 5 petals
    for (let i = 0; i < petals; i++) {
      const angle = (i * Math.PI * 2) / petals;
      ctx.save();
      ctx.rotate(angle);
      ctx.translate(0, -s * 0.5);

      const grad = ctx.createRadialGradient(0, 0, s * 0.1, 0, 0, s * 0.6);
      grad.addColorStop(0, PALETTE.ivory);
      grad.addColorStop(0.7, this.color);
      grad.addColorStop(1, PALETTE.softRose);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.35, s * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Center flower core
    ctx.fillStyle = PALETTE.warmGold;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.24, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Single floating sakura petal
  drawPetal(ctx) {
    const s = this.size;
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = PALETTE.babyPink;
    ctx.shadowBlur = 3;

    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.6, -s * 0.5, s * 0.6, s * 0.5, 0, s);
    ctx.bezierCurveTo(-s * 0.6, s * 0.5, -s * 0.6, -s * 0.5, 0, -s);
    ctx.fill();
    ctx.restore();
  }

  // F. Tiny Cute Ribbon / Bow 🎀
  drawBow(ctx) {
    const s = this.size;
    ctx.save();
    ctx.scale(s / 14, s / 14);

    ctx.fillStyle = this.color;
    ctx.shadowColor = PALETTE.softRose;
    ctx.shadowBlur = 5;

    // Left loop
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-10, -8, -12, 6, 0, 0);
    ctx.fill();

    // Right loop
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(10, -8, 12, 6, 0, 0);
    ctx.fill();

    // Center knot
    ctx.fillStyle = PALETTE.berryPink;
    ctx.beginPath();
    ctx.arc(0, 0, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Ribbon tails
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-1, 2);
    ctx.quadraticCurveTo(-6, 8, -8, 12);
    ctx.moveTo(1, 2);
    ctx.quadraticCurveTo(6, 8, 8, 12);
    ctx.stroke();

    ctx.restore();
  }

  // E. Fairy Dust (Soft glowing speck)
  drawDust(ctx) {
    const r = Math.max(1, this.size);
    ctx.save();

    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    grad.addColorStop(0, PALETTE.pearlWhite);
    grad.addColorStop(0.4, this.color);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

export class ParticlePool {
  constructor(maxSize = 100) {
    this.pool = Array.from({ length: maxSize }, () => new Particle());
  }

  spawn(type, x, y, options) {
    const p = this.pool.find(item => !item.active);
    if (p) {
      p.init(type, x, y, options);
      return p;
    }
    // If pool is saturated, replace oldest
    let oldest = this.pool[0];
    let minLife = Infinity;
    for (const item of this.pool) {
      if (item.life < minLife) {
        minLife = item.life;
        oldest = item;
      }
    }
    if (oldest) {
      oldest.init(type, x, y, options);
      return oldest;
    }
    return null;
  }

  update(dt) {
    for (const p of this.pool) {
      if (p.active) p.update(dt);
    }
  }

  draw(ctx) {
    for (const p of this.pool) {
      if (p.active) p.draw(ctx);
    }
  }

  clear() {
    for (const p of this.pool) p.active = false;
  }
}

// Click Burst Orchestrator
export function triggerClickBurst(pool, x, y) {
  // Stage 1: Central Glowing Flower
  pool.spawn('flower', x, y, {
    size: 16,
    maxLife: 1.2,
    vx: (Math.random() - 0.5) * 0.4,
    vy: -0.8,
    color: PALETTE.blush,
    isClickBurst: true
  });

  // Stage 2: Starburst (8 stars in radial direction)
  const starCount = 8;
  for (let i = 0; i < starCount; i++) {
    const angle = (i * Math.PI * 2) / starCount + (Math.random() - 0.5) * 0.3;
    const speed = 2.2 + Math.random() * 2.8;
    pool.spawn('star', x, y, {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 7 + Math.random() * 5,
      maxLife: 0.8 + Math.random() * 0.4,
      color: i % 2 === 0 ? PALETTE.warmGold : PALETTE.ivory,
      isClickBurst: true
    });
  }

  // Stage 3: Butterfly Release (2 butterflies taking flight)
  [-1, 1].forEach((dir) => {
    pool.spawn('butterfly', x + dir * 10, y - 5, {
      vx: dir * (1.2 + Math.random() * 1.5),
      vy: -2.2 - Math.random() * 1.2,
      size: 17 + Math.random() * 5,
      maxLife: 2.2,
      color: dir === -1 ? PALETTE.babyPink : PALETTE.lavender,
      isClickBurst: true
    });
  });

  // Stage 4: Floating Hearts (4 hearts rising)
  for (let i = 0; i < 4; i++) {
    pool.spawn('heart', x + (Math.random() - 0.5) * 24, y + (Math.random() - 0.5) * 15, {
      vx: (Math.random() - 0.5) * 1.8,
      vy: -1.6 - Math.random() * 1.4,
      size: 10 + Math.random() * 6,
      maxLife: 1.4 + Math.random() * 0.6,
      color: i % 2 === 0 ? PALETTE.softRose : PALETTE.babyPink,
      isClickBurst: true
    });
  }

  // Stage 5: Fairy Dust Cloud (12 glitter specks)
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.0 + Math.random() * 2.5;
    pool.spawn('dust', x, y, {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2.5 + Math.random() * 3,
      maxLife: 0.7 + Math.random() * 0.5,
      color: COLOR_LIST[i % COLOR_LIST.length],
      isClickBurst: true
    });
  }

  // Stage 6: Occasional Tiny Bow
  if (Math.random() > 0.45) {
    pool.spawn('bow', x, y - 10, {
      vx: (Math.random() - 0.5) * 1.2,
      vy: -1.4,
      size: 14,
      maxLife: 1.5,
      color: PALETTE.softRose,
      isClickBurst: true
    });
  }
}

// Double-Click Heart Gathering Effect
export function triggerHeartGather(pool, cx, cy) {
  const count = 22;
  const radius = 55;

  for (let i = 0; i < count; i++) {
    // Parametric heart shape target points:
    // x = 16 sin^3(t)
    // y = -(13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t))
    const t = (i * Math.PI * 2) / count;
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    const targetX = cx + hx * 2.6;
    const targetY = cy + hy * 2.6;

    // Start positions in a wider circle
    const startAngle = Math.random() * Math.PI * 2;
    const startDist = radius * (1.2 + Math.random() * 0.8);
    const startX = cx + Math.cos(startAngle) * startDist;
    const startY = cy + Math.sin(startAngle) * startDist;

    pool.spawn(i % 3 === 0 ? 'heart' : i % 3 === 1 ? 'star' : 'dust', startX, startY, {
      size: 8,
      maxLife: 2.0,
      gatherTarget: { x: targetX, y: targetY },
      gatherHoldTime: 0.45,
      color: i % 2 === 0 ? PALETTE.softRose : PALETTE.babyPink,
      isClickBurst: true
    });
  }

  // Release 2 butterflies from the gathered heart center after brief hold
  setTimeout(() => {
    pool.spawn('butterfly', cx - 12, cy, {
      vx: -1.6,
      vy: -2.4,
      size: 18,
      maxLife: 2.4,
      color: PALETTE.lavender,
      isClickBurst: true
    });
    pool.spawn('butterfly', cx + 12, cy, {
      vx: 1.6,
      vy: -2.4,
      size: 18,
      maxLife: 2.4,
      color: PALETTE.warmGold,
      isClickBurst: true
    });
  }, 450);
}
