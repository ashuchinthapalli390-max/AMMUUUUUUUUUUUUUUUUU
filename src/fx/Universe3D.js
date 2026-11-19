// A scroll-driven 3D birthday universe rendered behind the whole experience.
// The camera flies forward through floating hearts, balloons, gifts, stars,
// drifting petals and sparkles as the page scrolls. Pure Three.js, no React state.
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

const DEPTH = 190;          // how far the camera travels from top to bottom of the page
const START_Z = 14;

const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[(Math.random() * arr.length) | 0];
const side = () => (Math.random() < 0.5 ? -1 : 1);

function heartShape(s = 1) {
  const h = new THREE.Shape();
  h.moveTo(0, -0.9 * s);
  h.bezierCurveTo(-0.15 * s, -0.72 * s, -1.05 * s, -0.25 * s, -1.05 * s, 0.32 * s);
  h.bezierCurveTo(-1.05 * s, 0.82 * s, -0.55 * s, 1.05 * s, -0.25 * s, 1.0 * s);
  h.bezierCurveTo(-0.08 * s, 0.97 * s, 0, 0.82 * s, 0, 0.7 * s);
  h.bezierCurveTo(0, 0.82 * s, 0.08 * s, 0.97 * s, 0.25 * s, 1.0 * s);
  h.bezierCurveTo(0.55 * s, 1.05 * s, 1.05 * s, 0.82 * s, 1.05 * s, 0.32 * s);
  h.bezierCurveTo(1.05 * s, -0.25 * s, 0.15 * s, -0.72 * s, 0, -0.9 * s);
  return h;
}

function starShape(outer = 1, inner = 0.45, points = 5) {
  const s = new THREE.Shape();
  for (let i = 0; i <= points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
  }
  return s;
}

function petalShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.5);
  s.bezierCurveTo(0.42, -0.25, 0.38, 0.32, 0.07, 0.5);
  s.lineTo(0, 0.38);
  s.lineTo(-0.07, 0.5);
  s.bezierCurveTo(-0.38, 0.32, -0.42, -0.25, 0, -0.5);
  return s;
}

function sparkleTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.25, 'rgba(255,235,245,0.9)');
  grd.addColorStop(1, 'rgba(255,200,225,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  // tiny four-point glint
  g.fillStyle = 'rgba(255,255,255,0.85)';
  g.fillRect(31, 4, 2, 56);
  g.fillRect(4, 31, 56, 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export const PALETTES = {
  home:            {sky: ['#fff4f7', '#ffd6e5'], fog: '#ffdce8', dark: false},
  journey:         {sky: ['#fff7ee', '#ffdcd0'], fog: '#ffe2d8', dark: false},
  memories:        {sky: ['#fbf1ff', '#efd3f4'], fog: '#f2dbf5', dark: false},
  magazine:        {sky: ['#fff9ef', '#ffe5d6'], fog: '#ffe9dc', dark: false},
  'bestie-id':     {sky: ['#fff0f6', '#fbcfe1'], fog: '#fcd8e7', dark: false},
  letters:         {sky: ['#fff5f2', '#f8d3dc'], fog: '#f9dbe2', dark: false},
  playlist:        {sky: ['#f7f0ff', '#e2d5ff'], fog: '#e7dcff', dark: false},
  wishes:          {sky: ['#fff1f8', '#ffd2e8'], fog: '#ffdaec', dark: false},
  cake:            {sky: ['#3d1f36', '#1a0d1b'], fog: '#2a1527', dark: true},
  gifts:           {sky: ['#fff6ee', '#ffd8c9'], fog: '#ffe0d3', dark: false},
  movies:          {sky: ['#f5f1ff', '#d9d1f6'], fog: '#e0d9f8', dark: false},
  midnight:        {sky: ['#2a1840', '#0c0819'], fog: '#18102a', dark: true},
  games:           {sky: ['#fff1f5', '#ffd0dd'], fog: '#ffd9e3', dark: false},
  'little-things': {sky: ['#f1fff8', '#ffe0ec'], fog: '#fbe6ee', dark: false},
  certificates:    {sky: ['#fffaf1', '#f6e2c8'], fog: '#f7e6d0', dark: false},
  finale:          {sky: ['#30182a', '#100710'], fog: '#1e0f1c', dark: true}
};

export default class Universe3D {
  constructor(canvas, {reduced = false} = {}) {
    this.canvas = canvas;
    this.reduced = reduced;
    this.mobile = window.innerWidth < 760;
    this.progress = 0;
    this.smoothProgress = 0;
    this.velocity = 0;
    this.mouse = new THREE.Vector2();
    this.mouseSmooth = new THREE.Vector2();
    this.running = false;
    this.clock = new THREE.Clock();
    this.darkness = 0;          // 0 = pastel day, 1 = night sky
    this.targetDarkness = 0;
    this.fogTarget = new THREE.Color(PALETTES.home.fog);
    this.bursts = [];
    this._init();
  }

  _init() {
    const renderer = new THREE.WebGLRenderer({canvas: this.canvas, antialias: !this.mobile, alpha: true, powerPreference: 'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.mobile ? 1.25 : 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(PALETTES.home.fog, 16, 62);
    this.scene = scene;

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 140);
    camera.position.set(0, 0, START_Z);
    this.camera = camera;

    this.hemi = new THREE.HemisphereLight(0xfff0f6, 0xd9b8ff, 1.1);
    scene.add(this.hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(6, 10, 8);
    scene.add(key);
    // a pink glow that travels with the camera
    this.glow = new THREE.PointLight(0xff8fbf, 40, 30, 1.6);
    scene.add(this.glow);

    this.objects = [];
    this._buildHearts();
    this._buildBalloons();
    this._buildGifts();
    this._buildStars();
    this._buildRings();
    this._buildPetals();
    this._buildSparkles();

    this._onResize = this._onResize.bind(this);
    this._onPointer = this._onPointer.bind(this);
    this._onVisibility = this._onVisibility.bind(this);
    window.addEventListener('resize', this._onResize);
    window.addEventListener('pointermove', this._onPointer, {passive: true});
    document.addEventListener('visibilitychange', this._onVisibility);
  }

  // ---------- builders ----------
  _zAlong(i, n) {
    // distribute objects along the whole flight path, with jitter
    return START_Z - 6 - (i / n) * (DEPTH + 10) + rand(-4, 4);
  }

  _addFloating(mesh, opts) {
    mesh.userData = {
      base: mesh.position.clone(),
      spin: new THREE.Vector3(rand(-0.4, 0.4), rand(-0.6, 0.6), rand(-0.25, 0.25)),
      bob: rand(0.3, 0.9),
      bobSpeed: rand(0.5, 1.2),
      phase: rand(0, Math.PI * 2),
      ...opts
    };
    this.scene.add(mesh);
    this.objects.push(mesh);
  }

  _buildHearts() {
    const geo = new THREE.ExtrudeGeometry(heartShape(1), {depth: 0.45, bevelEnabled: true, bevelThickness: 0.22, bevelSize: 0.18, bevelSegments: 6, curveSegments: 22});
    geo.center();
    const colors = ['#ff6fa5', '#ff9cc2', '#f7457f', '#ffb3cf', '#e85d9a', '#ff86b0'];
    const mats = colors.map(c => new THREE.MeshPhysicalMaterial({color: c, roughness: 0.22, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.6, sheenColor: new THREE.Color('#ffd6e7')}));
    const n = this.mobile ? 20 : 34;
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(geo, pick(mats));
      const s = rand(0.45, 1.25);
      m.scale.setScalar(s);
      m.position.set(side() * rand(4.2, 13), rand(-6.5, 6.5), this._zAlong(i, n));
      m.rotation.set(rand(-0.4, 0.4), rand(-0.8, 0.8), rand(-0.3, 0.3));
      this._addFloating(m, {kind: 'heart', beat: Math.random() < 0.5});
    }
  }

  _buildBalloons() {
    const colors = ['#ff8fb8', '#c9a7ff', '#ffd27a', '#8fd8ff', '#ff9e9e', '#ffffff'];
    const body = new THREE.SphereGeometry(1, 32, 24);
    body.scale(1, 1.18, 1);
    const knot = new THREE.ConeGeometry(0.16, 0.24, 12);
    const n = this.mobile ? 8 : 14;
    for (let i = 0; i < n; i++) {
      const color = pick(colors);
      const mat = new THREE.MeshPhysicalMaterial({color, roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, transmission: 0.08, thickness: 0.5});
      const g = new THREE.Group();
      const b = new THREE.Mesh(body, mat);
      const k = new THREE.Mesh(knot, mat);
      k.position.y = -1.25;
      k.rotation.x = Math.PI;
      const pts = [];
      for (let j = 0; j < 14; j++) pts.push(new THREE.Vector3(Math.sin(j * 0.9) * 0.12, -1.35 - j * 0.24, 0));
      const string = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({color: '#b77a96', transparent: true, opacity: 0.7}));
      g.add(b, k, string);
      const s = rand(0.55, 1.05);
      g.scale.setScalar(s);
      g.position.set(side() * rand(5, 14), rand(-5, 5), this._zAlong(i, n));
      this._addFloating(g, {kind: 'balloon', spin: new THREE.Vector3(0, rand(-0.2, 0.2), 0), bob: rand(0.6, 1.2)});
    }
  }

  _buildGifts() {
    const n = this.mobile ? 5 : 9;
    const boxColors = ['#ff9cc2', '#c9a7ff', '#fff1f6', '#ffcf8a', '#9fdcff'];
    const ribbonColors = ['#e8457f', '#ffffff', '#b96bff', '#ff6fa5'];
    const box = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    const band = new THREE.BoxGeometry(1.44, 1.44, 0.26);
    const lid = new THREE.BoxGeometry(1.56, 0.32, 1.56);
    const bow = new THREE.TorusGeometry(0.28, 0.1, 12, 28);
    for (let i = 0; i < n; i++) {
      const bm = new THREE.MeshPhysicalMaterial({color: pick(boxColors), roughness: 0.35, clearcoat: 0.6});
      const rm = new THREE.MeshPhysicalMaterial({color: pick(ribbonColors), roughness: 0.25, metalness: 0.15, clearcoat: 1});
      const g = new THREE.Group();
      g.add(new THREE.Mesh(box, bm));
      const b1 = new THREE.Mesh(band, rm); g.add(b1);
      const b2 = new THREE.Mesh(band, rm); b2.rotation.y = Math.PI / 2; g.add(b2);
      const l = new THREE.Mesh(lid, bm); l.position.y = 0.72; g.add(l);
      const bowL = new THREE.Mesh(bow, rm); bowL.position.set(-0.24, 1.05, 0); bowL.rotation.set(0, 0, 0.6); g.add(bowL);
      const bowR = new THREE.Mesh(bow, rm); bowR.position.set(0.24, 1.05, 0); bowR.rotation.set(0, 0, -0.6); g.add(bowR);
      const s = rand(0.55, 0.95);
      g.scale.setScalar(s);
      g.position.set(side() * rand(5.5, 12), rand(-5, 5), this._zAlong(i + 0.5, n));
      g.rotation.set(rand(-0.4, 0.4), rand(0, Math.PI), rand(-0.3, 0.3));
      this._addFloating(g, {kind: 'gift'});
    }
  }

  _buildStars() {
    const geo = new THREE.ExtrudeGeometry(starShape(1, 0.46), {depth: 0.25, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 3});
    geo.center();
    this.starMat = new THREE.MeshStandardMaterial({color: '#ffd36e', metalness: 0.75, roughness: 0.22, emissive: '#ffb347', emissiveIntensity: 0.25});
    const n = this.mobile ? 18 : 32;
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(geo, this.starMat);
      m.scale.setScalar(rand(0.22, 0.55));
      m.position.set(side() * rand(3, 15), rand(-7, 7), this._zAlong(i, n));
      this._addFloating(m, {kind: 'star', spin: new THREE.Vector3(0, rand(0.6, 1.4) * side(), rand(-0.3, 0.3))});
    }
  }

  _buildRings() {
    // big pastel "planet rings" the camera flies through every few chapters
    const n = 6;
    this.rings = [];
    for (let i = 0; i < n; i++) {
      const g = new THREE.Group();
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(9.5, 0.06, 10, 160),
        new THREE.MeshBasicMaterial({color: pick(['#ff9cc2', '#c9a7ff', '#ffd27a']), transparent: true, opacity: 0.55, fog: true})
      );
      g.add(torus);
      // tiny beads around the ring
      const beadGeo = new THREE.SphereGeometry(0.14, 10, 8);
      const beadMat = new THREE.MeshStandardMaterial({color: '#ffffff', emissive: '#ffc2dc', emissiveIntensity: 0.6});
      for (let j = 0; j < 22; j++) {
        const a = (j / 22) * Math.PI * 2;
        const bead = new THREE.Mesh(beadGeo, beadMat);
        bead.position.set(Math.cos(a) * 9.5, Math.sin(a) * 9.5, 0);
        g.add(bead);
      }
      g.position.set(0, 0, START_Z - 25 - i * (DEPTH / n));
      g.rotation.set(rand(-0.25, 0.25), rand(-0.25, 0.25), rand(0, Math.PI));
      g.userData = {spinZ: rand(0.05, 0.12) * side()};
      this.scene.add(g);
      this.rings.push(g);
    }
  }

  _buildPetals() {
    const n = this.mobile ? 110 : 240;
    const geo = new THREE.ShapeGeometry(petalShape(), 6);
    const mat = new THREE.MeshStandardMaterial({color: '#ffb6cf', roughness: 0.6, side: THREE.DoubleSide, transparent: true, opacity: 0.92});
    const mesh = new THREE.InstancedMesh(geo, mat, n);
    mesh.frustumCulled = false;
    const petalColors = ['#ffb6cf', '#ffc9dc', '#ff9cbf', '#fff0f5', '#f7a8d0', '#e9b8ff'];
    const color = new THREE.Color();
    this.petalData = [];
    for (let i = 0; i < n; i++) {
      color.set(pick(petalColors));
      mesh.setColorAt(i, color);
      this.petalData.push({
        x: rand(-16, 16), y: rand(-9, 9), dz: rand(-45, 4),
        fall: rand(0.35, 0.9), sway: rand(0.4, 1.4), swayPhase: rand(0, 6.28),
        rx: rand(0, 6.28), ry: rand(0, 6.28), rz: rand(0, 6.28),
        vr: new THREE.Vector3(rand(-1.5, 1.5), rand(-1.5, 1.5), rand(-1, 1)),
        s: rand(0.18, 0.42)
      });
    }
    this.petals = mesh;
    this.dummy = new THREE.Object3D();
    this.scene.add(mesh);
  }

  _buildSparkles() {
    const n = this.mobile ? 700 : 1600;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = rand(-22, 22);
      pos[i * 3 + 1] = rand(-13, 13);
      pos[i * 3 + 2] = rand(START_Z - DEPTH - 30, START_Z + 4);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.sparkleMat = new THREE.PointsMaterial({
      size: 0.32, map: sparkleTexture(), transparent: true, opacity: 0.75,
      depthWrite: false, blending: THREE.AdditiveBlending, color: '#ffffff', sizeAttenuation: true
    });
    this.sparkles = new THREE.Points(geo, this.sparkleMat);
    this.scene.add(this.sparkles);
  }

  // ---------- public API ----------
  setProgress(p) { this.progress = Math.min(1, Math.max(0, p)); }
  setVelocity(v) { this.velocity = v; }

  setPalette(id) {
    const p = PALETTES[id];
    if (!p) return;
    this.fogTarget.set(p.fog);
    this.targetDarkness = p.dark ? 1 : 0;
  }

  // a little 3D heart explosion right in front of the camera (used for celebrations)
  burst() {
    if (this.reduced) return;
    const geo = this.objects.find(o => o.userData.kind === 'heart')?.geometry;
    if (!geo) return;
    const mats = ['#ff6fa5', '#ffd27a', '#c9a7ff', '#ff9cc2'].map(c => new THREE.MeshPhysicalMaterial({color: c, clearcoat: 1, roughness: 0.2, transparent: true}));
    for (let i = 0; i < 26; i++) {
      const m = new THREE.Mesh(geo, pick(mats));
      m.scale.setScalar(rand(0.12, 0.3));
      m.position.copy(this.camera.position).add(new THREE.Vector3(rand(-0.5, 0.5), rand(-0.5, 0.5), -7));
      const v = new THREE.Vector3(rand(-1, 1), rand(-0.6, 1.2), rand(-0.5, 0.6)).normalize().multiplyScalar(rand(4, 9));
      this.scene.add(m);
      this.bursts.push({m, v, life: 0, spin: new THREE.Vector3(rand(-4, 4), rand(-4, 4), rand(-4, 4))});
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    const loop = () => {
      if (!this.running) return;
      this._raf = requestAnimationFrame(loop);
      this._tick();
    };
    loop();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this._raf);
  }

  // ---------- internals ----------
  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    if (this.reduced) this._tick();
  }

  _onPointer(e) {
    this.mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  }

  _onVisibility() {
    if (document.hidden) this.stop();
    else if (this._wantRunning) this.start();
  }

  _tick() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;

    // camera flight
    this.smoothProgress += (this.progress - this.smoothProgress) * (this.reduced ? 1 : 0.075);
    this.mouseSmooth.lerp(this.mouse, 0.05);
    const cz = START_Z - this.smoothProgress * DEPTH;
    const cam = this.camera;
    cam.position.set(
      Math.sin(this.smoothProgress * Math.PI * 3) * 1.6 + this.mouseSmooth.x * 1.3,
      Math.cos(this.smoothProgress * Math.PI * 2) * 0.8 + this.mouseSmooth.y * 0.9,
      cz
    );
    cam.lookAt(this.mouseSmooth.x * 2.4, this.mouseSmooth.y * 1.4, cz - 12);
    cam.rotation.z += Math.sin(this.smoothProgress * Math.PI * 4) * 0.05;
    this.glow.position.set(cam.position.x, cam.position.y + 1, cz - 6);

    const vel = Math.min(3, Math.abs(this.velocity) / 900);
    const spinBoost = 1 + vel * 2.5;

    // floating objects
    for (const o of this.objects) {
      const u = o.userData;
      o.position.y = u.base.y + Math.sin(t * u.bobSpeed + u.phase) * u.bob;
      o.position.x = u.base.x + Math.cos(t * u.bobSpeed * 0.7 + u.phase) * 0.25;
      o.rotation.x += u.spin.x * dt * spinBoost;
      o.rotation.y += u.spin.y * dt * spinBoost;
      o.rotation.z += u.spin.z * dt * 0.5;
      if (u.kind === 'heart' && u.beat) {
        const b = 1 + Math.max(0, Math.sin(t * 3.2 + u.phase)) * 0.08;
        o.scale.setScalar((o.userData.s0 ||= o.scale.x) * b);
      }
      if (u.kind === 'balloon') o.rotation.z = Math.sin(t * 0.8 + u.phase) * 0.12;
    }
    for (const r of this.rings) r.rotation.z += r.userData.spinZ * dt * spinBoost;

    // petals drift around the camera so there are always some in view
    const d = this.dummy;
    for (let i = 0; i < this.petalData.length; i++) {
      const p = this.petalData[i];
      p.y -= p.fall * dt * (1 + vel * 0.6);
      if (p.y < -9) p.y = 9;
      p.rx += p.vr.x * dt; p.ry += p.vr.y * dt; p.rz += p.vr.z * dt;
      let z = cz + p.dz - vel * 2 * Math.sin(i);
      d.position.set(p.x + Math.sin(t * p.sway + p.swayPhase) * 1.2, p.y, z);
      d.rotation.set(p.rx, p.ry, p.rz);
      d.scale.setScalar(p.s);
      d.updateMatrix();
      this.petals.setMatrixAt(i, d.matrix);
    }
    this.petals.instanceMatrix.needsUpdate = true;

    // sparkles twinkle
    this.sparkles.rotation.z = Math.sin(t * 0.05) * 0.1;

    // day <-> night mood
    this.darkness += (this.targetDarkness - this.darkness) * 0.04;
    this.scene.fog.color.lerp(this.fogTarget, 0.04);
    this.sparkleMat.opacity = 0.55 + this.darkness * 0.4 + Math.sin(t * 2) * 0.05;
    this.sparkleMat.size = 0.3 + this.darkness * 0.12;
    this.starMat.emissiveIntensity = 0.25 + this.darkness * 0.9;
    this.hemi.intensity = 1.1 - this.darkness * 0.45;
    this.glow.intensity = 40 + this.darkness * 60;

    // celebration hearts
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.life += dt;
      b.v.y -= 6 * dt;
      b.m.position.addScaledVector(b.v, dt);
      b.m.rotation.x += b.spin.x * dt; b.m.rotation.y += b.spin.y * dt;
      b.m.material.opacity = Math.max(0, 1 - b.life / 2.2);
      if (b.life > 2.2) { this.scene.remove(b.m); this.bursts.splice(i, 1); }
    }

    this.renderer.render(this.scene, cam);
  }

  run() { this._wantRunning = true; if (this.reduced) this._tick(); else this.start(); }
  pause() { this._wantRunning = false; this.stop(); }

  dispose() {
    this.stop();
    window.removeEventListener('resize', this._onResize);
    window.removeEventListener('pointermove', this._onPointer);
    document.removeEventListener('visibilitychange', this._onVisibility);
    this.scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { m.map?.dispose(); m.dispose(); });
    });
    this.renderer.dispose();
  }
}
