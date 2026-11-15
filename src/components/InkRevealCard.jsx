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

uniform sampler2D u_texA;       // Ammu original photo
uniform sampler2D u_texB;       // Current song artwork
uniform vec2 u_cursor;          // Normalized pointer coords [0, 1]
uniform float u_radius;         // Localized reveal radius (0.0 to ~0.15)
uniform float u_time;           // Elapsed animation time
uniform vec2 u_resolution;      // Canvas dimensions [width, height]
uniform float u_aspectA;        // Texture A aspect ratio
uniform float u_aspectB;        // Texture B aspect ratio

// Simplex 2D noise implementation
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

// Object-fit: cover mapping
vec2 getCoverUV(vec2 uv, float texAspect, float screenAspect) {
  vec2 st = uv;
  if (screenAspect > texAspect) {
    float scale = screenAspect / texAspect;
    st.y = (st.y - 0.5) * scale + 0.5;
  } else {
    float scale = texAspect / screenAspect;
    st.x = (st.x - 0.5) * scale + 0.5;
  }
  return clamp(st, 0.0, 1.0);
}

void main() {
  float screenAspect = u_resolution.x / u_resolution.y;
  vec2 uvA = getCoverUV(vUv, u_aspectA, screenAspect);
  vec2 uvB = getCoverUV(vUv, u_aspectB, screenAspect);

  vec4 colA = texture2D(u_texA, uvA);
  vec4 colB = texture2D(u_texB, uvB);

  // State 1 & State 5: If radius is zero, render 100% Ammu's photograph
  if (u_radius <= 0.0001) {
    gl_FragColor = colA;
    return;
  }

  // Calculate distance in screen-aspect-corrected coordinates (perfect circle in screen pixels)
  vec2 diff = vUv - u_cursor;
  diff.x *= screenAspect;
  float dist = length(diff);

  // Multi-harmonic angular spikes for fine outward ink fingers
  float angle = atan(diff.y, diff.x);
  float spikes = sin(angle * 6.0 + u_time * 0.5) * 0.065
               + sin(angle * 11.0 - u_time * 0.7) * 0.04
               + sin(angle * 19.0 + u_time * 1.1) * 0.025;

  // Organic noise displacement field
  vec2 noiseCoord = vUv * 9.0 + vec2(cos(u_time * 0.18), sin(u_time * 0.18)) * 0.4;
  float n = fbm(noiseCoord);

  // Tiny delicate ink droplets
  float speckles = max(0.0, snoise(vUv * 30.0 + u_time * 0.1) - 0.68) * 0.14;

  // Distort the distance field organically around current cursor position
  float displacement = (spikes * 0.45 + n * 0.35 + speckles) * u_radius;
  float distortedDist = dist - displacement;

  // Controlled narrow anti-aliasing feathering (approx 3-5 pixels)
  float feather = 4.0 / u_resolution.y;
  float mask = 1.0 - smoothstep(u_radius - feather, u_radius, distortedDist);

  // Outside mask: 100% Texture A (Ammu Photo)
  // Inside mask: 100% Texture B (Song Poster)
  // Pure opaque composite with narrow anti-aliased edge
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
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
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

export default function InkRevealCard({ currentSong }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // WebGL & Texture state refs
  const glRef = useRef(null);
  const programRef = useRef(null);
  const texARef = useRef(null);
  const texBRef = useRef(null);
  const aspectARef = useRef(0.77);
  const aspectBRef = useRef(1.0);

  // Localized Pointer Physics & Restoration Refs
  const targetPointer = useRef({ x: 0.5, y: 0.5 });
  const currentPointer = useRef({ x: 0.5, y: 0.5 });
  const targetRadius = useRef(0.0);
  const currentRadius = useRef(0.0);
  const isHovered = useRef(false);

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

    // Quad geometry covering the canvas
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

    // Load Texture A (Ammu's original photograph)
    texARef.current = loadTexture(gl, '/assets/photos/original_black.jpg', (tex, aspect) => {
      aspectARef.current = aspect;
    });

    // Resize canvas to match display size
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
    const uCursor = gl.getUniformLocation(program, 'u_cursor');
    const uRadius = gl.getUniformLocation(program, 'u_radius');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uAspectA = gl.getUniformLocation(program, 'u_aspectA');
    const uAspectB = gl.getUniformLocation(program, 'u_aspectB');

    let animId;
    let startTime = performance.now();

    // 60FPS Render Loop
    const render = (now) => {
      animId = requestAnimationFrame(render);
      const elapsed = (now - startTime) * 0.001;

      // Smooth pointer position interpolation (State 3: Cursor moves)
      const pLerp = 0.22;
      currentPointer.current.x += (targetPointer.current.x - currentPointer.current.x) * pLerp;
      currentPointer.current.y += (targetPointer.current.y - currentPointer.current.y) * pLerp;

      // Smooth radius interpolation (State 2 & State 5: Open & Automatic restoration)
      const rLerp = targetRadius.current > currentRadius.current ? 0.16 : 0.12;
      currentRadius.current += (targetRadius.current - currentRadius.current) * rLerp;
      if (currentRadius.current < 0.0002) {
        currentRadius.current = 0.0;
      }

      gl.useProgram(program);

      // Bind Texture A (unit 0)
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texARef.current);
      gl.uniform1i(uTexA, 0);

      // Bind Texture B (unit 1)
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texBRef.current || texARef.current);
      gl.uniform1i(uTexB, 1);

      // Uniforms
      gl.uniform2f(uCursor, currentPointer.current.x, currentPointer.current.y);
      gl.uniform1f(uRadius, currentRadius.current);
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
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    };
  }, []);

  // Update Texture B whenever selected song changes
  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;

    const coverUrl = currentSong?.cover || '/assets/photos/original_black.jpg';
    if (texBRef.current) {
      gl.deleteTexture(texBRef.current);
    }

    texBRef.current = loadTexture(gl, coverUrl, (tex, aspect) => {
      aspectBRef.current = aspect;
    });
  }, [currentSong]);

  // Pointer event handlers
  const updatePointer = useCallback((clientX, clientY) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    // Invert Y to match GL coordinate system (top = 1.0, bottom = 0.0)
    const y = Math.max(0, Math.min(1, 1.0 - (clientY - rect.top) / rect.height));

    targetPointer.current = { x, y };
  }, []);

  const handlePointerEnter = useCallback((e) => {
    isHovered.current = true;
    updatePointer(e.clientX, e.clientY);
    // Instant snap on entry for the first coordinate, then smooth follow
    currentPointer.current = { ...targetPointer.current };
    // Localized reveal radius (~100-140px diameter on desktop)
    targetRadius.current = 0.135;
  }, [updatePointer]);

  const handlePointerMove = useCallback((e) => {
    isHovered.current = true;
    updatePointer(e.clientX, e.clientY);
    targetRadius.current = 0.135;
  }, [updatePointer]);

  const handlePointerLeave = useCallback(() => {
    isHovered.current = false;
    // State 5: Cursor leaves -> shrink radius naturally to zero at last position
    targetRadius.current = 0.0;
  }, []);

  // Touch device support
  const handleTouchStart = useCallback((e) => {
    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      handlePointerEnter(touch);
    }
  }, [handlePointerEnter]);

  const handleTouchMove = useCallback((e) => {
    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      handlePointerMove(touch);
    }
  }, [handlePointerMove]);

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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
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
        cursor: 'crosshair',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        aria-label="Ammu's photo with interactive localized ink reveal of current song poster"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '18px',
        }}
      />

      {/* Album Card Lower Caption */}
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
