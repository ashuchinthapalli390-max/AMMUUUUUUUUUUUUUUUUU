import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

const TENGLISH_DIALOGUES = [
  "Aiyooo Potti, antha kopama na meeda? 😭",
  "Sorryyyy cheppana... inkosaari cheyyane! 🥺",
  "Nee kopam lo kooda entha cute ga unnavo thelusa? 💗",
  "Okay okay, inkoka debba kotti santhoshapadu! 🤕",
  "Nenu broke ayina sare neekosam chocolates thestha! 🍫",
  "Intha kopam chupisthe nenu ekkadiki povali? 🙈",
  "Chempa erraga aypoyindi choosava? Hehehe 🥹",
  "Nee kopam taggithe naaku oka smile isthava? ✨",
  "Iron Man helmet pettukunta... ippudu kottu choodam! 🦾",
  "Ayyababoi, Potti cheyyi entha strong oo! 💥",
  "Sorry Madam garu! Mee Ashu thappu aypoyindi! 🙇‍♂️",
  "Nuvvu kottina sare nenu nee silly bestie ne! 💗",
  "Chocolates istha kopam vadileseyyy pleaseee! 🧁",
  "Inka kopam thaggaledha? Sare inkosaari kottuko! 🙈",
  "Last slap idhe na? Kopam antha poyinda? 🌸",
  "Hoorayyy! Naa cute Pottiiii cool aypoyindi! 🥳💗"
];

const EXPRESSIONS = [
  { name: 'shocked', emoji: '😲', eyeScale: 1.3, mouthCurve: 0, eyebrowTilt: 0.2 },
  { name: 'blink', emoji: '🥺', eyeScale: 0.2, mouthCurve: -0.2, eyebrowTilt: -0.1 },
  { name: 'pout', emoji: '😤', eyeScale: 0.9, mouthCurve: -0.4, eyebrowTilt: 0.3 },
  { name: 'tilted', emoji: '🤕', eyeScale: 1.0, mouthCurve: -0.1, eyebrowTilt: 0.15 },
  { name: 'confused', emoji: '😵‍💫', eyeScale: 1.1, mouthCurve: 0.1, eyebrowTilt: -0.25 },
  { name: 'holdingCheeks', emoji: '🙈', eyeScale: 0.8, mouthCurve: -0.3, eyebrowTilt: 0.1 },
  { name: 'puppyEyes', emoji: '🥺', eyeScale: 1.4, mouthCurve: -0.2, eyebrowTilt: -0.2 },
  { name: 'guiltySmile', emoji: '😅', eyeScale: 0.7, mouthCurve: 0.4, eyebrowTilt: 0.1 },
  { name: 'namaste', emoji: '🙏', eyeScale: 0.9, mouthCurve: 0, eyebrowTilt: -0.15 },
  { name: 'sorrySign', emoji: '📜', eyeScale: 1.1, mouthCurve: -0.2, eyebrowTilt: -0.2 },
  { name: 'flowerOffer', emoji: '🌸', eyeScale: 1.2, mouthCurve: 0.5, eyebrowTilt: 0 },
  { name: 'chocolates', emoji: '🍫', eyeScale: 1.1, mouthCurve: 0.4, eyebrowTilt: 0 },
  { name: 'salute', emoji: '🫡', eyeScale: 1.0, mouthCurve: 0.2, eyebrowTilt: 0.1 },
  { name: 'tongueOut', emoji: '😜', eyeScale: 1.0, mouthCurve: 0.6, eyebrowTilt: 0.3 },
  { name: 'dizzyStars', emoji: '💫', eyeScale: 0.8, mouthCurve: -0.3, eyebrowTilt: 0.2 },
  { name: 'happyRelief', emoji: '🥹', eyeScale: 1.3, mouthCurve: 0.6, eyebrowTilt: 0 }
];

export default function SlapAshuGame({ onClose }) {
  const mountRef = useRef(null);
  const characterRef = useRef(null);
  const propsRef = useRef({ sign: null, flower: null, chocolate: null, stars: null, crown: null });
  const animState = useRef({
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    rotZ: 0,
    rotX: 0,
    wobbleVel: 0,
    slapImpulse: 0,
    blinkTimer: 0,
    idleTimer: 0,
  });

  const [slapCount, setSlapCount] = useState(0);
  const [angerMeter, setAngerMeter] = useState(100);
  const [currentDialogue, setCurrentDialogue] = useState(TENGLISH_DIALOGUES[0]);
  const [currentExpression, setCurrentExpression] = useState(EXPRESSIONS[0]);
  const [impactBursts, setImpactBursts] = useState([]);
  const [unlockedMilestone, setUnlockedMilestone] = useState(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // Setup Three.js Chibi Ashu Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    let hasGl = false;
    try {
      const testCanvas = document.createElement('canvas');
      hasGl = !!(window.WebGLRenderingContext && (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
    } catch {
      hasGl = false;
    }

    if (!hasGl) {
      setWebGlSupported(false);
      return;
    }

    const width = container.clientWidth || 360;
    const height = 340;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.2);
    camera.lookAt(0, 0.8, 0);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setWebGlSupported(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Warm Ambient and Directional Lights
    const hemiLight = new THREE.HemisphereLight(0xfff3f6, 0x82445b, 1.8);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight.position.set(2, 5, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const softPinkLight = new THREE.PointLight(0xffa8c2, 1.5, 8);
    softPinkLight.position.set(-2, 2, 2);
    scene.add(softPinkLight);

    // Group for complete Chibi character
    const chibi = new THREE.Group();
    characterRef.current = chibi;
    scene.add(chibi);

    // Materials
    const skinMat = new THREE.MeshToonMaterial({ color: 0xffe2cf });
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xff8fa3, transparent: true, opacity: 0.65 });
    const hairMat = new THREE.MeshToonMaterial({ color: 0x241416 });
    const hoodieMat = new THREE.MeshToonMaterial({ color: 0x7b2348 });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x1f1418 });
    const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.7, roughness: 0.3 });

    // Head
    const headGeom = new THREE.SphereGeometry(0.85, 32, 32);
    headGeom.scale(1, 0.94, 0.95);
    const head = new THREE.Mesh(headGeom, skinMat);
    head.position.y = 1.35;
    head.castShadow = true;
    chibi.add(head);

    // Hair Cap & Cute Stylized Tufts
    const hairGeom = new THREE.SphereGeometry(0.88, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.58);
    const hairCap = new THREE.Mesh(hairGeom, hairMat);
    hairCap.position.set(0, 0.1, -0.04);
    head.add(hairCap);

    // Hair Tufts (front bangs)
    for (let i = -2; i <= 2; i++) {
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.38, 8), hairMat);
      tuft.position.set(i * 0.22, 0.64, 0.65 - Math.abs(i) * 0.08);
      tuft.rotation.x = Math.PI * 0.85;
      tuft.rotation.z = i * -0.15;
      head.add(tuft);
    }

    // Cheeks (Blushing pink circles)
    const cheekGeom = new THREE.SphereGeometry(0.16, 16, 16);
    cheekGeom.scale(1, 0.6, 0.3);
    const leftCheek = new THREE.Mesh(cheekGeom, blushMat);
    leftCheek.position.set(-0.48, -0.12, 0.66);
    head.add(leftCheek);

    const rightCheek = new THREE.Mesh(cheekGeom, blushMat);
    rightCheek.position.set(0.48, -0.12, 0.66);
    head.add(rightCheek);

    // Eyes Group
    const eyesGroup = new THREE.Group();
    head.add(eyesGroup);

    const createEye = (x) => {
      const eyeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), eyeWhiteMat);
      eyeMesh.scale.set(0.8, 1.2, 0.3);
      eyeMesh.position.set(x, 0.04, 0.76);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), pupilMat);
      pupil.scale.set(0.9, 1.1, 0.2);
      pupil.position.set(0, 0, 0.08);
      eyeMesh.add(pupil);

      const shine1 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), shineMat);
      shine1.position.set(0.04, 0.05, 0.14);
      eyeMesh.add(shine1);

      const shine2 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), shineMat);
      shine2.position.set(-0.03, -0.04, 0.14);
      eyeMesh.add(shine2);

      return eyeMesh;
    };

    const leftEye = createEye(-0.3);
    const rightEye = createEye(0.3);
    eyesGroup.add(leftEye);
    eyesGroup.add(rightEye);

    // Mouth
    const mouthGeom = new THREE.TorusGeometry(0.08, 0.025, 8, 16, Math.PI);
    const mouth = new THREE.Mesh(mouthGeom, hairMat);
    mouth.position.set(0, -0.26, 0.78);
    mouth.rotation.x = Math.PI;
    head.add(mouth);

    // Body (Cute Burgundy Hoodie)
    const bodyGeom = new THREE.CylinderGeometry(0.48, 0.62, 0.85, 24);
    const body = new THREE.Mesh(bodyGeom, hoodieMat);
    body.position.y = 0.45;
    body.castShadow = true;
    chibi.add(body);

    // Heart Badge on Hoodie
    const badge = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffa4be }));
    badge.scale.set(1, 0.8, 0.2);
    badge.position.set(0.22, 0.15, 0.52);
    body.add(badge);

    // Hands
    const handGeom = new THREE.SphereGeometry(0.16, 14, 14);
    const leftHand = new THREE.Mesh(handGeom, skinMat);
    leftHand.position.set(-0.62, 0.4, 0.2);
    chibi.add(leftHand);

    const rightHand = new THREE.Mesh(handGeom, skinMat);
    rightHand.position.set(0.62, 0.4, 0.2);
    chibi.add(rightHand);

    // --- PROPS ---
    // 1. "Sorry Potti 🥺" miniature sign
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 256;
    signCanvas.height = 128;
    const sctx = signCanvas.getContext('2d');
    sctx.fillStyle = '#fff4f7';
    sctx.fillRect(0, 0, 256, 128);
    sctx.strokeStyle = '#c44872';
    sctx.lineWidth = 8;
    sctx.strokeRect(4, 4, 248, 120);
    sctx.fillStyle = '#781d45';
    sctx.font = 'bold 30px Georgia';
    sctx.textAlign = 'center';
    sctx.fillText('Sorry Potti 🥺', 128, 55);
    sctx.font = '22px sans-serif';
    sctx.fillStyle = '#c44872';
    sctx.fillText('♡ From Ashu ♡', 128, 95);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide }));
    signMesh.position.set(0, 0.55, 0.85);
    signMesh.visible = false;
    chibi.add(signMesh);
    propsRef.current.sign = signMesh;

    // 2. Virtual Chocolate Bar
    const chocoGroup = new THREE.Group();
    const chocoBar = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.55, 0.08), new THREE.MeshStandardMaterial({ color: 0x4a2412, roughness: 0.6 }));
    const wrapper = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.32, 0.09), new THREE.MeshStandardMaterial({ color: 0xd6336c, metalness: 0.4 }));
    wrapper.position.y = -0.12;
    chocoGroup.add(chocoBar);
    chocoGroup.add(wrapper);
    chocoGroup.position.set(0.55, 0.55, 0.6);
    chocoGroup.rotation.z = -0.25;
    chocoGroup.visible = false;
    chibi.add(chocoGroup);
    propsRef.current.chocolate = chocoGroup;

    // 3. Flower Bouquet
    const flowerGroup = new THREE.Group();
    for (let f = 0; f < 5; f++) {
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), new THREE.MeshToonMaterial({ color: f % 2 === 0 ? 0xff70a6 : 0xff9770 }));
      const angle = (f / 5) * Math.PI * 2;
      petal.position.set(Math.cos(angle) * 0.16, Math.sin(angle) * 0.16, 0);
      flowerGroup.add(petal);
    }
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffd166 }));
    flowerGroup.add(center);
    flowerGroup.position.set(-0.55, 0.55, 0.6);
    flowerGroup.visible = false;
    chibi.add(flowerGroup);
    propsRef.current.flower = flowerGroup;

    // 4. Dizzy Stars Group
    const starsGroup = new THREE.Group();
    for (let s = 0; s < 4; s++) {
      const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.12), goldMat);
      star.position.set(Math.cos(s * 1.57) * 0.9, 0, Math.sin(s * 1.57) * 0.9);
      starsGroup.add(star);
    }
    starsGroup.position.set(0, 2.45, 0);
    starsGroup.visible = false;
    chibi.add(starsGroup);
    propsRef.current.stars = starsGroup;

    // 5. Crown
    const crownGeom = new THREE.CylinderGeometry(0.35, 0.28, 0.22, 5);
    const crown = new THREE.Mesh(crownGeom, goldMat);
    crown.position.set(0, 2.3, 0);
    crown.visible = false;
    chibi.add(crown);
    propsRef.current.crown = crown;

    // Mini Stage Pedestal
    const stageGeom = new THREE.CylinderGeometry(1.6, 1.8, 0.25, 32);
    const stageMat = new THREE.MeshStandardMaterial({ color: 0xffeef5, roughness: 0.5 });
    const stage = new THREE.Mesh(stageGeom, stageMat);
    stage.position.y = -0.12;
    stage.receiveShadow = true;
    scene.add(stage);

    // Animation Loop
    let reqId;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const st = animState.current;

      st.idleTimer += delta;

      // Spring physics for wobble / squash-and-stretch
      st.scaleX += (1 - st.scaleX) * 0.18;
      st.scaleY += (1 - st.scaleY) * 0.18;
      st.scaleZ += (1 - st.scaleZ) * 0.18;
      st.rotZ += (0 - st.rotZ) * 0.15;
      st.rotX += (0 - st.rotX) * 0.15;

      // Gentle breathing idle
      const breath = Math.sin(st.idleTimer * 2.8) * 0.02;
      chibi.scale.set(st.scaleX, st.scaleY + breath, st.scaleZ);
      chibi.rotation.z = st.rotZ;
      chibi.rotation.x = st.rotX;

      // Rotate dizzy stars if visible
      if (propsRef.current.stars?.visible) {
        propsRef.current.stars.rotation.y += delta * 4;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 360;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  // Update Props based on Milestones
  useEffect(() => {
    const props = propsRef.current;

    if (slapCount >= 30) {
      if (props.crown) props.crown.visible = true;
      if (props.flower) props.flower.visible = true;
      if (props.chocolate) props.chocolate.visible = true;
      if (props.stars) props.stars.visible = true;
      setUnlockedMilestone('Crown Unlocked: Official Potti Punching Bag 🏆');
    } else if (slapCount >= 20) {
      if (props.flower) props.flower.visible = true;
      if (props.chocolate) props.chocolate.visible = true;
      if (props.stars) props.stars.visible = true;
      setUnlockedMilestone('Flower Bouquet Unlocked 💐');
    } else if (slapCount >= 10) {
      if (props.chocolate) props.chocolate.visible = true;
      if (props.stars) props.stars.visible = true;
      setUnlockedMilestone('Chocolates Offered 🍫');
    } else if (slapCount >= 5) {
      if (props.sign) props.sign.visible = true;
      setUnlockedMilestone('Sorry Sign Raised 🥺');
    }
  }, [slapCount]);

  // Handle Harmless Slap (Unlimited Playful Taps)
  const handleSlap = useCallback(() => {
    const nextCount = slapCount + 1;
    setSlapCount(nextCount);

    // Decrease Anger Meter (10% per slap down to 0%)
    setAngerMeter((prev) => Math.max(0, prev - 10));

    // Next dialogue & expression
    const diagIdx = nextCount % TENGLISH_DIALOGUES.length;
    const exprIdx = nextCount % EXPRESSIONS.length;
    setCurrentDialogue(TENGLISH_DIALOGUES[diagIdx]);
    setCurrentExpression(EXPRESSIONS[exprIdx]);

    // Squash and stretch physics impulse
    const st = animState.current;
    const dir = nextCount % 2 === 0 ? 1 : -1;
    st.scaleX = 1.35;
    st.scaleY = 0.65;
    st.scaleZ = 1.25;
    st.rotZ = dir * 0.42;
    st.rotX = -0.15;

    // Visual comic slap impact burst (limit to last 3 to avoid memory buildup)
    const burstId = Date.now() + Math.random();
    const burstTexts = ['💥 SLAP!', '💫 POUF!', '✨ OUCH!', '💗 TEASE!', '🌸 BONK!'];
    const chosenText = burstTexts[nextCount % burstTexts.length];
    setImpactBursts((prev) => [...prev.slice(-2), { id: burstId, text: chosenText, dir }]);
    setTimeout(() => {
      setImpactBursts((prev) => prev.filter((b) => b.id !== burstId));
    }, 850);
  }, [slapCount]);

  // Play Again / Reset
  const handleReset = () => {
    setSlapCount(0);
    setAngerMeter(100);
    setCurrentDialogue(TENGLISH_DIALOGUES[0]);
    setCurrentExpression(EXPRESSIONS[0]);
    setUnlockedMilestone(null);
    const props = propsRef.current;
    if (props.sign) props.sign.visible = false;
    if (props.flower) props.flower.visible = false;
    if (props.chocolate) props.chocolate.visible = false;
    if (props.stars) props.stars.visible = false;
    if (props.crown) props.crown.visible = false;
  };

  // Anger Meter status label and color
  const getMeterColor = () => {
    if (angerMeter > 60) return 'linear-gradient(90deg, #ff4d6d, #e63946)';
    if (angerMeter > 30) return 'linear-gradient(90deg, #f77f00, #fcbf49)';
    if (angerMeter > 0) return 'linear-gradient(90deg, #ffb703, #90be6d)';
    return 'linear-gradient(90deg, #43aa8b, #57cc99)';
  };

  const getMeterStatus = () => {
    if (angerMeter > 75) return 'VERY ANGRY 😤';
    if (angerMeter > 50) return 'STILL POUTING 🥺';
    if (angerMeter > 25) return 'CALMING DOWN 🥰';
    if (angerMeter > 0) return 'ALMOST HAPPY 🌸';
    return 'COMPLETELY COOL & HAPPY! 💗';
  };

  return (
    <div className="slap-ashu-card" style={{ width: '100%', maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '16px' }}>
        <span className="eyebrow" style={{ color: '#C04D76', fontWeight: 700, letterSpacing: '2px', fontSize: '11px' }}>
          ✿ SPECIAL 3D MINI-GAME FOR AMMUUUU ✿
        </span>
        <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(22px, 3.2vw, 32px)', color: '#781D45', margin: '6px 0' }}>
          Angry With Ashu? Give Him A Little Slap! 😭💗
        </h3>
        <p style={{ fontSize: '14px', color: '#8A4A68', fontStyle: 'italic', margin: 0 }}>
          Pottiiiiiiii, kopam thagge varaku nee Ashu ni tease cheyyi!
        </p>
      </div>

      {/* ANGER METER */}
      <div className="slap-anger-meter-box" style={{ background: '#FFF6F9', border: '1px solid #ECC9D6', borderRadius: '16px', padding: '12px 18px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
          <span style={{ color: '#781D45' }}>Potti's Kopam Meter:</span>
          <span style={{ color: angerMeter === 0 ? '#2D8A68' : '#B83256', fontWeight: 700 }}>
            {getMeterStatus()} ({angerMeter}%)
          </span>
        </div>
        <div style={{ width: '100%', height: '14px', background: '#F0D5DF', borderRadius: '10px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
          <div
            style={{
              width: `${angerMeter}%`,
              height: '100%',
              background: getMeterColor(),
              transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1), background 0.4s',
              borderRadius: '10px',
            }}
          />
        </div>
      </div>

      {/* 3D CHIBI ASHU STAGE (WITH INTERACTIVE 2D FALLBACK IF WEBGL IS UNAVAILABLE) */}
      <div
        className="slap-stage-wrapper"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          height: '340px',
          margin: '0 auto',
          borderRadius: '24px',
          background: 'radial-gradient(ellipse at 50% 30%, #FFF8FA, #FCE8F0)',
          border: '2px solid #F3CFDD',
          boxShadow: '0 12px 36px rgba(120, 29, 69, 0.08)',
          overflow: 'hidden',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={handleSlap}
        id="slap-stage-interactive"
        title="Tap or click Ashu to slap! 😤"
      >
        {webGlSupported ? (
          <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
        ) : (
          <div
            className="slap-fallback-stage"
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: '95px',
                transform: `rotate(${slapCount % 2 === 0 ? '12deg' : '-12deg'})`,
                transition: 'transform 0.15s ease',
              }}
            >
              {currentExpression.emoji}
            </div>
            <div style={{ fontSize: '38px', marginTop: '-12px' }}>🧸</div>
            {slapCount >= 5 && <span style={{ fontSize: '12px', background: '#fff', border: '1px solid #ecc9d6', borderRadius: '10px', padding: '2px 8px', color: '#781d45', marginTop: '6px' }}>Sorry Potti 🥺</span>}
            {slapCount >= 10 && <span style={{ fontSize: '24px' }}>🍫</span>}
            {slapCount >= 20 && <span style={{ fontSize: '24px' }}>💐</span>}
            {slapCount >= 30 && <span style={{ fontSize: '28px', marginTop: '-140px' }}>👑</span>}
          </div>
        )}

        {/* Floating Comic Impact Bursts */}
        {impactBursts.map((burst) => (
          <div
            key={burst.id}
            style={{
              position: 'absolute',
              top: '32%',
              left: burst.dir > 0 ? '60%' : '18%',
              transform: `translate(-50%, -50%) rotate(${burst.dir * 12}deg)`,
              color: '#D81159',
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: '28px',
              fontWeight: 800,
              textShadow: '0 2px 8px rgba(255,255,255,0.9), 0 0 15px rgba(216, 17, 89, 0.4)',
              pointerEvents: 'none',
              animation: 'slapComicBurst 0.8s ease-out forwards',
            }}
          >
            {burst.text}
          </div>
        ))}

        {/* Tap Prompt Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(4px)',
            borderRadius: '20px',
            padding: '4px 14px',
            fontSize: '11px',
            color: '#8C3D60',
            fontWeight: 600,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          👋 Click anywhere on Ashu to slap!
        </div>
      </div>

      {/* ANIMATED TENGLISH SPEECH BUBBLE */}
      <div
        className="slap-dialogue-bubble"
        id="slap-speech-bubble"
        style={{
          marginTop: '16px',
          background: '#FFFFFF',
          border: '2px solid #F0C4D5',
          borderRadius: '20px',
          padding: '14px 22px',
          boxShadow: '0 8px 24px rgba(120, 29, 69, 0.06)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '520px',
          width: '92%',
        }}
      >
        <span style={{ fontSize: '26px' }}>{currentExpression.emoji}</span>
        <div style={{ textAlign: 'left', flex: 1 }}>
          <div style={{ fontSize: '10px', color: '#A85A7E', fontWeight: 700, letterSpacing: '1px' }}>
            ASHU SAYS:
          </div>
          <div style={{ fontSize: '15px', color: '#6A193E', fontWeight: 600, marginTop: '2px' }} id="slap-dialogue-text">
            “{currentDialogue}”
          </div>
        </div>
      </div>

      {/* MILESTONE BANNER */}
      {unlockedMilestone && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#C04D76', fontWeight: 700 }} id="slap-milestone-text">
          ✨ Milestone: {unlockedMilestone}
        </div>
      )}

      {/* VICTORY BANNER AT 0% ANGER */}
      {angerMeter === 0 && (
        <div
          className="slap-victory-box"
          id="slap-victory-box"
          style={{
            marginTop: '18px',
            background: 'linear-gradient(135deg, #FFF0F5, #E8F5E9)',
            border: '2px dashed #43AA8B',
            borderRadius: '18px',
            padding: '18px',
            animation: 'giftModalIn 0.5s ease',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '6px' }}>🎉 💐 💗</div>
          <h4 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '22px', color: '#2D8A68', margin: '4px 0' }} id="slap-victory-title">
            YAYYYY! POTTIIII'S KOPAM TAGGINDHI! 💗
          </h4>
          <p style={{ fontSize: '14px', color: '#4B6B58', margin: '4px 0 14px' }}>
            Ashu is completely forgiven! Now you owe him a big cute smile.
          </p>
          <button
            type="button"
            className="btn btn-pink"
            onClick={handleReset}
            id="slap-play-again-victory-btn"
            style={{ padding: '8px 22px', fontSize: '13px', borderRadius: '25px' }}
          >
            Play Again ↻
          </button>
        </div>
      )}

      {/* ACTION CONTROLS */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn btn-pink"
          onClick={handleSlap}
          id="slap-ashu-trigger-btn"
          style={{
            padding: '12px 28px',
            fontSize: '15px',
            borderRadius: '30px',
            boxShadow: '0 8px 20px rgba(196, 72, 114, 0.3)',
          }}
        >
          Slap Ashu 😤 ({slapCount} Slaps)
        </button>

        <button
          type="button"
          className="btn btn-soft"
          onClick={handleReset}
          id="slap-play-again-btn"
          style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '30px' }}
        >
          Play Again ↻
        </button>

        {onClose && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            id="slap-exit-game-btn"
            style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '30px' }}
          >
            Exit Game ✕
          </button>
        )}
      </div>
    </div>
  );
}
