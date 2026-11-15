import React, { useEffect, useRef, useCallback } from 'react';

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 vUv;

void main() {
  vUv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
varying vec2 vUv;

uniform sampler2D u_texA;       // Ammu original photo (upright)
uniform sampler2D u_texB;       // Selected song artwork (upright)
uniform sampler2D u_texMask;    // Real high-contrast organic ink texture
uniform vec2 u_cursor;          // Normalized pointer entry position [0, 1]
uniform float u_radius;         // Full-card cinematic ink reveal radius [0.0, 1.85]
uniform float u_progress;       // Full-card reveal progress [0.0, 1.0]
uniform float u_time;           // Elapsed animation time
uniform vec2 u_resolution;      // Canvas dimensions [width, height]
uniform float u_aspectA;        // Texture A aspect ratio
uniform float u_aspectB;        // Texture B aspect ratio

// 2D Simplex Noise Implementation
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Multi-octave fractal noise for organic dendritic ink contours
float fbm(vec2 p) {
  float total = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 4; i++) {
    total += amp * snoise(p * freq);
    freq *= 2.15;
    amp *= 0.48;
  }
  return total;
}

// Mathematical object-fit: cover mapping without edge smearing or distortion
vec2 getCoverUV(vec2 uv, float texAspect, float screenAspect) {
  vec2 st = uv;
  if (screenAspect > texAspect) {
    float s = texAspect / screenAspect;
    st.y = (uv.y - 0.5) * s + 0.5;
  } else {
    float s = screenAspect / texAspect;
    st.x = (uv.x - 0.5) * s + 0.5;
  }
  return st;
}

void main() {
  float screenAspect = u_resolution.x / u_resolution.y;
  vec2 uvA = getCoverUV(vUv, u_aspectA, screenAspect);
  vec2 uvB = getCoverUV(vUv, u_aspectB, screenAspect);

  vec4 colA = texture2D(u_texA, uvA);
  vec4 colB = texture2D(u_texB, uvB);

  // STATE A & STATE D: Default or fully restored state -> 100% Ammu photograph
  if (u_progress <= 0.0001) {
    gl_FragColor = colA;
    return;
  }

  // STATE C: Fully revealed state -> 100% Selected Song artwork
  if (u_progress >= 0.9999) {
    gl_FragColor = colB;
    return;
  }

  // Screen-aspect-corrected vector from pointer entry position
  vec2 diff = vUv - u_cursor;
  diff.x *= screenAspect;
  float dist = length(diff);

  // Angular harmonics for organic ink tendrils and dendritic branching
  float angle = atan(diff.y, diff.x);
  float spikes = sin(angle * 5.0 + u_time * 0.35) * 0.12
               + sin(angle * 9.0 - u_time * 0.55) * 0.07
               + sin(angle * 17.0 + u_time * 0.75) * 0.035;

  // Multi-frequency noise displacement
  vec2 noiseCoord = vUv * 7.0 + vec2(cos(u_time * 0.12), sin(u_time * 0.12)) * 0.3;
  float n = fbm(noiseCoord);

  // High-contrast ink texture bleed from user reference mask
  // (1.0 - r) represents physical ink concentration
  float inkBleed = (1.0 - texture2D(u_texMask, vUv).r) * 0.32;

  // Organic distortion field
  float distortion = spikes + (n - 0.5) * 0.55 + inkBleed;

  // Effective expansion radius: blooms to 1.85 to reach every corner of the card
  float currentRadius = u_radius;

  float distortedDist = dist - distortion;

  // Crisp, organic anti-aliasing feathering (approx 3-5 pixels)
  float feather = 0.04;
  float mask = 1.0 - smoothstep(currentRadius - feather, currentRadius + feather, distortedDist);
  mask = clamp(mask, 0.0, 1.0);

  // Pure replacement: 0% blend inside revealed ink, narrow AA edge
  gl_FragColor = mix(colA, colB, mask);
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile failed:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vsSource, fsSource) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link failed:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function loadTexture(gl, url, onLoad) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // 1x1 initial fallback pixel while image loads
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0,
    gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([245, 235, 240, 255])
  );

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // CRITICAL: flipY=true ensures images render UPRIGHT (head/face at top, text readable)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (onLoad) {
      const aspect = (img.naturalWidth || 1) / (img.naturalHeight || 1);
      onLoad(texture, aspect);
    }
  };
  img.onerror = () => {
    console.warn('Could not load texture from:', url);
  };
  return texture;
}

// All 6 playlist cover URLs to pre-cache
const ALL_COVER_URLS = [
  '/assets/music/covers/official-samjhawan.webp',
  '/assets/music/covers/01-samjhawan.webp',
  '/assets/music/covers/02-baarish.webp',
  '/assets/music/covers/official-tum-hi-ho.webp',
  '/assets/music/covers/official-gehra-hua.webp',
  '/assets/music/covers/05-channa-mereya.webp',
  '/assets/music/covers/official-ye-tune-kya-kiya.webp',
];

export default function InkRevealCard({ currentSong }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // WebGL & Texture state refs
  const glRef = useRef(null);
  const programRef = useRef(null);
  const texARef = useRef(null);
  const texBRef = useRef(null);
  const texMaskRef = useRef(null);
  const textureCacheRef = useRef(new Map());
  const aspectARef = useRef(0.77);
  const aspectBRef = useRef(1.0);

  // Full-card Cinematic Reveal State Machine
  const entryPointRef = useRef({ x: 0.5, y: 0.5 });
  const isHoveredRef = useRef(false);
  const progressRef = useRef(0.0);

  // Transition durations (tuneable within 0.9-1.5s forward, 0.7-1.2s reverse)
  const FORWARD_DURATION = 1.15; // 1.15s forward spread
  const REVERSE_DURATION = 0.85; // 0.85s reverse restoration

  // Initialize WebGL Scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl = canvas.getContext('webgl', { antialias: true, alpha: false, depth: false });
    if (!gl) {
      gl = canvas.getContext('experimental-webgl');
    }
    if (!gl) {
      console.warn('WebGL unavailable for InkRevealCard');
      return;
    }
    glRef.current = gl;

    const program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
    if (!program) return;
    programRef.current = program;

    // Full-screen Quad geometry covering the canvas
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Load Texture A: Ammu's original photograph (upright)
    texARef.current = loadTexture(gl, '/assets/photos/original_black.jpg', (tex, aspect) => {
      aspectARef.current = aspect;
    });

    // Load Texture Mask: Real organic ink bleed reference image
    texMaskRef.current = loadTexture(gl, '/assets/effects/ink_mask.jpg');

    // Pre-cache all 6 song covers for zero-lag instant track switching
    ALL_COVER_URLS.forEach((url) => {
      loadTexture(gl, url, (tex, aspect) => {
        textureCacheRef.current.set(url, { texture: tex, aspect });
      });
    });

    // Resize canvas to match display container
    const resize = () => {
      const container = containerRef.current;
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(rect.width * dpr) || 800;
      const h = Math.round(rect.height * dpr) || 1040;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Uniform locations
    const uTexA = gl.getUniformLocation(program, 'u_texA');
    const uTexB = gl.getUniformLocation(program, 'u_texB');
    const uTexMask = gl.getUniformLocation(program, 'u_texMask');
    const uCursor = gl.getUniformLocation(program, 'u_cursor');
    const uRadius = gl.getUniformLocation(program, 'u_radius');
    const uProgress = gl.getUniformLocation(program, 'u_progress');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uAspectA = gl.getUniformLocation(program, 'u_aspectA');
    const uAspectB = gl.getUniformLocation(program, 'u_aspectB');

    let animId;
    let startTime = performance.now();
    let lastTime = performance.now();

    // 60FPS Continuous Render Loop
    const render = (now) => {
      animId = requestAnimationFrame(render);
      const elapsed = (now - startTime) * 0.001;
      const dt = Math.min((now - lastTime) * 0.001, 0.1);
      lastTime = now;

      // Smooth Full-Card Ink Expansion / Reversal Physics
      if (isHoveredRef.current) {
        // STATE B -> STATE C: Advance towards 100% full song cover reveal
        progressRef.current = Math.min(1.0, progressRef.current + dt / FORWARD_DURATION);
      } else {
        // STATE D -> STATE A: Reverse organically back to 100% Ammu photograph
        progressRef.current = Math.max(0.0, progressRef.current - dt / REVERSE_DURATION);
      }

      // Smoothstep easing for organic ink bloom acceleration and deceleration
      const p = progressRef.current;
      const easedProgress = p * p * (3.0 - 2.0 * p);

      gl.useProgram(program);

      // Bind Texture A (unit 0) - Ammu Photo
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texARef.current);
      gl.uniform1i(uTexA, 0);

      // Bind Texture B (unit 1) - Current Song Artwork
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texBRef.current || texARef.current);
      gl.uniform1i(uTexB, 1);

      // Bind Texture Mask (unit 2) - Organic Ink Texture
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, texMaskRef.current);
      gl.uniform1i(uTexMask, 2);

      // Set Uniforms
      gl.uniform2f(uCursor, entryPointRef.current.x, entryPointRef.current.y);
      gl.uniform1f(uRadius, easedProgress * 1.85);
      gl.uniform1f(uProgress, easedProgress);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uAspectA, aspectARef.current);
      gl.uniform1f(uAspectB, aspectBRef.current);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      if (texARef.current) gl.deleteTexture(texARef.current);
      if (texBRef.current) gl.deleteTexture(texBRef.current);
      if (texMaskRef.current) gl.deleteTexture(texMaskRef.current);
      textureCacheRef.current.forEach(({ texture }) => {
        try { gl.deleteTexture(texture); } catch {}
      });
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    };
  }, []);

  // Update Texture B whenever selected song changes
  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;

    const coverUrl = currentSong?.cover || '/assets/music/covers/01-samjhawan.webp';

    // Check pre-cache first for instantaneous swap
    const cached = textureCacheRef.current.get(coverUrl);
    if (cached) {
      texBRef.current = cached.texture;
      aspectBRef.current = cached.aspect;
      return;
    }

    // Otherwise load dynamically
    texBRef.current = loadTexture(gl, coverUrl, (tex, aspect) => {
      aspectBRef.current = aspect;
      textureCacheRef.current.set(coverUrl, { texture: tex, aspect });
    });
  }, [currentSong]);

  // Compute normalized coordinates: (0,0) at bottom-left, (1,1) at top-right
  const computeCoords = useCallback((clientX, clientY) => {
    const container = containerRef.current;
    if (!container || clientX === undefined || clientY === undefined || isNaN(clientX) || isNaN(clientY)) {
      return { x: 0.5, y: 0.5 };
    }
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / (rect.width || 1)));
    const y = Math.max(0, Math.min(1, 1.0 - (clientY - rect.top) / (rect.height || 1)));
    return { x: isNaN(x) ? 0.5 : x, y: isNaN(y) ? 0.5 : y };
  }, []);

  // Expose global state bridge for testing, verification & synchronization
  useEffect(() => {
    window.ammuPlaylistInkState = {
      getProgress: () => progressRef.current,
      getHovered: () => isHoveredRef.current,
      getEntryPoint: () => ({ ...entryPointRef.current }),
      setHovered: (hovered, clientX, clientY) => {
        if (hovered) {
          if (clientX !== undefined && clientY !== undefined) {
            entryPointRef.current = computeCoords(clientX, clientY);
          }
          isHoveredRef.current = true;
        } else {
          isHoveredRef.current = false;
        }
      },
      setProgress: (p) => {
        progressRef.current = Math.max(0, Math.min(1, p));
      }
    };
    return () => {
      delete window.ammuPlaylistInkState;
    };
  }, [computeCoords]);

  // Pointer & Mouse event handlers
  const handlePointerEnter = useCallback((e) => {
    const clientX = e?.clientX ?? e?.pageX;
    const clientY = e?.clientY ?? e?.pageY;
    if (clientX !== undefined && clientY !== undefined) {
      const coords = computeCoords(clientX, clientY);
      if (progressRef.current <= 0.05) {
        entryPointRef.current = coords;
      }
    }
    // STATE B: Start forward ink spread
    isHoveredRef.current = true;
  }, [computeCoords]);

  const handlePointerMove = useCallback((e) => {
    // Keep isHovered active; DO NOT restart animation on mouse move
    isHoveredRef.current = true;
  }, []);

  const handlePointerLeave = useCallback(() => {
    // STATE D: Reverse ink spread back to 100% Ammu photograph
    isHoveredRef.current = false;
  }, []);

  // Touch device support
  const handleTouchStart = useCallback((e) => {
    if (e.touches && e.touches[0]) {
      handlePointerEnter(e.touches[0]);
    }
  }, [handlePointerEnter]);

  const handleTouchEnd = useCallback(() => {
    handlePointerLeave();
  }, [handlePointerLeave]);

  return (
    <div
      ref={containerRef}
      className="ink-reveal-container"
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onMouseEnter={handlePointerEnter}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '410px',
        height: '520px',
        margin: '0 auto',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 20px 48px rgba(120, 29, 69, 0.22)',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        aria-label="Ammu's photo with cinematic organic ink reveal of current song poster"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          borderRadius: '18px',
        }}
      />

      {/* Album Card Lower Caption - Preserved Polaroid Styling */}
      <div
        className="playlist-cover-caption"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 6,
          background: 'linear-gradient(transparent, rgba(30, 8, 20, 0.88))',
          padding: '18px 16px 12px',
          fontSize: '11px',
          letterSpacing: '1.5px',
          color: '#ffffff',
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>FOR AMMUUUUU</span>
        <span style={{ color: '#F8BBD0', fontWeight: 600 }}>♫ FROM ASHU</span>
      </div>
    </div>
  );
}
