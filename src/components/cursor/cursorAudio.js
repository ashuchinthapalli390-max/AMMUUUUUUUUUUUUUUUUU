// Soft, fairy-like synthesized audio chimes for magical click bursts (Web Audio API)
let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      try {
        audioCtx = new AudioContextClass();
      } catch {
        audioCtx = null;
      }
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playFairySparkleChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Pentatonic high sparkle frequencies (soft crystal music box / fairy wand)
    const notes = [1174.66, 1318.51, 1567.98, 1760.00, 2093.00]; // D6, E6, G6, A6, C7
    // Pick 3 staggered notes
    const baseIndex = Math.floor(Math.random() * (notes.length - 2));
    const chosenNotes = [notes[baseIndex], notes[baseIndex + 1], notes[baseIndex + 2]];

    chosenNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.045);

      // Lowpass filter for dreamy soft tone
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now + idx * 0.045);

      // Soft envelope (gentle attack, soft exponential decay)
      const startTime = now + idx * 0.045;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.035, startTime + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.38);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  } catch {
    // Fail silently without disrupting user experience
  }
}
