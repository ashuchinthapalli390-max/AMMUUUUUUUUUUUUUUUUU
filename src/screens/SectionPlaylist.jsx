import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const DEFAULT_TRACKS = [
  {
    id: "samjhawan",
    title: "Samjhawan",
    artist: "Arijit Singh & Shreya Ghoshal",
    src: "/assets/music/01-samjhawan.mp3",
    cover: "/assets/music/covers/official-samjhawan.webp",
    caption: "A quiet little feeling",
    number: 1
  },
  {
    id: "baarish",
    title: "Baarish",
    artist: "Ash King & Shashaa Tirupati",
    src: "/assets/music/02-baarish.mp3",
    cover: "/assets/music/covers/02-baarish.webp",
    caption: "A sky full of memories",
    number: 2
  },
  {
    id: "tum-hi-ho",
    title: "Tum Hi Ho",
    artist: "Arijit Singh",
    src: "/assets/music/03-tum-hi-ho.mp3",
    cover: "/assets/music/covers/official-tum-hi-ho.webp",
    caption: "An unforgettable melody",
    number: 3
  },
  {
    id: "gehra-hua",
    title: "Gehra Hua",
    artist: "Arijit Singh",
    src: "/assets/music/04-gehra-hua.mp3",
    cover: "/assets/music/covers/official-gehra-hua.webp",
    caption: "In a world of little moments",
    number: 4
  },
  {
    id: "channa-mereya",
    title: "Channa Mereya",
    artist: "Arijit Singh",
    src: "/assets/music/05-channa-mereya.mp3",
    cover: "/assets/music/covers/05-channa-mereya.webp",
    caption: "For all the stories we keep",
    number: 5
  },
  {
    id: "ye-tune-kya-kiya",
    title: "Ye Tune Kya Kiya",
    artist: "Pritam · Javed Bashir",
    src: "/assets/music/06-ye-tune-kya-kiya.mp3",
    cover: "/assets/music/covers/official-ye-tune-kya-kiya.webp",
    caption: "Another favourite chapter",
    number: 6
  }
];

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SectionPlaylist() {
  const [songs, setSongs] = useState(DEFAULT_TRACKS);
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [repeatMode, setRepeatMode] = useState('all'); // 'all' or 'one'
  const [error, setError] = useState('');
  const audioRef = useRef(null);

  // Exact Organic Ink-Spread Canvas Refs & State (Reference image: ink_mask.jpg)
  const coverCardRef = useRef(null);
  const inkCanvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const targetScaleRef = useRef(0);
  const currentScaleRef = useRef(0);
  const pointerPosRef = useRef({ x: 200, y: 260 });
  const songImageRef = useRef(null);

  // Load and prepare the organic ink splatter mask texture
  useEffect(() => {
    const maskImg = new Image();
    maskImg.crossOrigin = 'anonymous';
    maskImg.src = '/assets/effects/ink_mask.jpg';
    maskImg.onload = () => {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = maskImg.naturalWidth || 800;
      offCanvas.height = maskImg.naturalHeight || 800;
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

      offCtx.drawImage(maskImg, 0, 0, offCanvas.width, offCanvas.height);
      try {
        const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
        const data = imgData.data;

        // Convert black ink wash on white paper to transparent alpha mask
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lightness = 0.299 * r + 0.587 * g + 0.114 * b;
          const alpha = Math.max(0, Math.min(255, Math.round((245 - lightness) * 1.55)));
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = alpha;
        }
        offCtx.putImageData(imgData, 0, 0);
        maskCanvasRef.current = offCanvas;
      } catch (err) {
        console.warn('Ink mask processing error:', err);
      }
    };
  }, []);

  // Sync playlist tracks from bootstrap config if available
  useEffect(() => {
    const sync = () => {
      const tracks = window.ammuBirthdayConfig?.playlist;
      if (Array.isArray(tracks) && tracks.length >= 6) {
        setSongs(tracks);
      }
    };
    document.addEventListener('ammu:ready', sync);
    sync();
    return () => document.removeEventListener('ammu:ready', sync);
  }, []);

  const currentSong = songs[selected] || songs[0];

  // Notify header button & global listeners of audio play state
  const notifyState = useCallback((isPlaying) => {
    window.dispatchEvent(new CustomEvent('ammu:music-state', {
      detail: { playing: isPlaying, track: currentSong }
    }));
  }, [currentSong]);

  // Audio element source change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const wasPlaying = playing;
    audio.src = currentSong.src;
    audio.load();
    setCurrentTime(0);
    setError('');
    if (wasPlaying) {
      audio.play().then(() => {
        setPlaying(true);
        notifyState(true);
      }).catch((e) => {
        console.warn('Playback error:', e);
        setPlaying(false);
        notifyState(false);
        setError('Click play to start song 💗');
      });
    }
  }, [selected, songs]);

  // Volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      notifyState(false);
    } else {
      audio.play().then(() => {
        setPlaying(true);
        setError('');
        notifyState(true);
      }).catch(() => {
        setPlaying(false);
        notifyState(false);
        setError('Audio blocked or unavailable. Click again to play 💗');
      });
    }
  }, [playing, notifyState]);

  // Connect global toggle button from navbar
  useEffect(() => {
    window.ammuToggleMusic = togglePlay;
    const handleToggleEvent = () => togglePlay();
    document.addEventListener('ammu:toggle-music', handleToggleEvent);
    return () => {
      delete window.ammuToggleMusic;
      document.removeEventListener('ammu:toggle-music', handleToggleEvent);
    };
  }, [togglePlay]);

  // Scrub / Seek handler
  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Next / Previous track
  const handleNext = () => {
    setSelected((prev) => (prev + 1) % songs.length);
  };

  const handlePrev = () => {
    setSelected((prev) => (prev - 1 + songs.length) % songs.length);
  };

  // Track end
  const handleEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      handleNext();
    }
  };

  // Preload song cover image whenever selected song changes
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentSong.cover || '/assets/photos/original_black.jpg';
    songImageRef.current = img;
  }, [currentSong]);

  // Animation frame loop for smooth organic ink blossoming
  useEffect(() => {
    let animId;
    const canvas = inkCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animId = requestAnimationFrame(render);
      const mask = maskCanvasRef.current;
      const songImg = songImageRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // Smooth lerp toward target scale
      currentScaleRef.current += (targetScaleRef.current - currentScaleRef.current) * 0.12;
      const scale = currentScaleRef.current;

      if (scale <= 0.005) {
        ctx.clearRect(0, 0, w, h);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      if (mask && songImg && songImg.complete && songImg.naturalWidth > 0) {
        ctx.save();

        // 1. Draw current song cover image
        ctx.drawImage(songImg, 0, 0, w, h);

        // 2. Mask with dendritic ink splatter centered at pointer
        ctx.globalCompositeOperation = 'destination-in';
        const maskSize = Math.max(w, h) * scale * 1.8;
        const px = pointerPosRef.current.x;
        const py = pointerPosRef.current.y;
        ctx.drawImage(mask, px - maskSize / 2, py - maskSize / 2, maskSize, maskSize);

        // 3. Draw subtle song label badge on top of revealed cover
        ctx.globalCompositeOperation = 'source-over';
        if (scale > 0.35) {
          const badgeAlpha = Math.min(1, (scale - 0.35) * 2.2);
          ctx.save();
          ctx.globalAlpha = badgeAlpha;
          ctx.fillStyle = 'rgba(57, 19, 37, 0.85)';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(w * 0.08, h - 56, w * 0.84, 40, 10);
          } else {
            ctx.rect(w * 0.08, h - 56, w * 0.84, 40);
          }
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 15px Georgia, serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`♫ ${currentSong.title}`, w / 2, h - 36);
          ctx.restore();
        }

        ctx.restore();
      }
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [currentSong]);

  const updatePointer = (e) => {
    const card = coverCardRef.current;
    const canvas = inkCanvasRef.current;
    if (!card || !canvas) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    pointerPosRef.current = { x, y };
  };

  const handlePointerEnter = (e) => {
    targetScaleRef.current = 1.6;
    updatePointer(e);
  };

  const handlePointerMove = (e) => {
    targetScaleRef.current = Math.min(2.4, targetScaleRef.current + 0.08);
    updatePointer(e);
  };

  const handlePointerLeave = () => {
    targetScaleRef.current = 0;
  };

  return (
    <section id="playlist" className="section ivory playlist-chapter">
      <div className="wrap playlist-v5">
        <div className="section-top">
          <span className="eyebrow">FOR MY LOVELYYYY POTTIIIIIIII</span>
          <h2>A Beautiful <em>Playlist For You ♡</em></h2>
          <p>Every tune is a memory of laughter, quiet talks, and little moments. Enjoy the songs we share.</p>
        </div>

        <div className="playlist-studio">
          {/* Vinyl CD & Album Cover with Exact Organic Ink Splatter Reveal */}
          <div className="v8-album-scene">
            <div className={`v8-cd ${playing ? 'spinning' : ''}`} aria-hidden="true">
              <span>{currentSong.title}<br />♡</span>
            </div>

            <motion.div
              className="playlist-cover v8-album-front ink-spread-card"
              ref={coverCardRef}
              onPointerEnter={handlePointerEnter}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              layout
            >
              <img
                src="/assets/photos/original_black.jpg"
                alt="Ammu in black dress and sunglasses"
                className="base-black-dress-photo"
              />
              <canvas
                ref={inkCanvasRef}
                width={400}
                height={520}
                className="ink-spread-canvas"
                aria-label="Organic ink splatter reveal"
              />
              <div className="playlist-cover-caption">
                FOR AMMUUUUU <span>♫ FROM ASHU</span>
              </div>
            </motion.div>
          </div>

          {/* Player controls & Tracklist */}
          <div className="playlist-tracks">
            <span className="eyebrow">THE ASHU COLLECTION • 6 SPECIAL SONGS</span>
            <h3>{currentSong.title}</h3>
            <p>{currentSong.artist} • <em>{currentSong.caption || 'Our Little Universe'}</em></p>

            <audio
              ref={audioRef}
              preload="metadata"
              onTimeUpdate={() => {
                if (audioRef.current) {
                  setCurrentTime(audioRef.current.currentTime);
                }
              }}
              onLoadedMetadata={() => {
                if (audioRef.current) {
                  setDuration(audioRef.current.duration);
                }
              }}
              onEnded={handleEnded}
              onError={() => {
                if (playing) {
                  setError('Audio streaming unavailable. Please check your connection.');
                  setPlaying(false);
                  notifyState(false);
                }
              }}
            />

            {/* Seek / Scrubber Bar */}
            <div className="playlist-scrubber-wrap">
              <input
                type="range"
                className="playlist-scrubber"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                aria-label="Seek track position"
              />
              <div className="playlist-time-row">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Playback Controls */}
            <div className="playlist-controls">
              <button onClick={handlePrev} type="button" aria-label="Previous track">
                ⏮
              </button>
              <button
                onClick={togglePlay}
                type="button"
                className="play-btn"
                aria-label={playing ? 'Pause playlist' : 'Play playlist'}
              >
                {playing ? '❚❚' : '▶'}
              </button>
              <button onClick={handleNext} type="button" aria-label="Next track">
                ⏭
              </button>
            </div>

            {/* Extra Controls: Volume and Repeat */}
            <div className="playlist-extra-bar">
              <div className="playlist-volume-wrap">
                <span title="Volume">{volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}</span>
                <input
                  type="range"
                  className="playlist-volume-slider"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  aria-label="Volume slider"
                />
              </div>

              <button
                type="button"
                className={`playlist-repeat-btn ${repeatMode === 'one' ? 'active' : ''}`}
                onClick={() => setRepeatMode((prev) => (prev === 'all' ? 'one' : 'all'))}
                title={repeatMode === 'one' ? 'Repeat Current Song' : 'Repeat All Songs'}
              >
                {repeatMode === 'one' ? '🔂 Repeat One' : '🔁 Loop All'}
              </button>
            </div>

            {error && <p role="status" className="playlist-error">{error}</p>}

            {/* 6 Track Selection List */}
            <div className="playlist-songlist" data-allow-scroll="true">
              {songs.map((t, i) => (
                <button
                  key={t.id || i}
                  type="button"
                  className={i === selected ? 'is-playing' : ''}
                  onClick={() => {
                    setSelected(i);
                    if (!playing) {
                      setTimeout(() => {
                        audioRef.current?.play().then(() => {
                          setPlaying(true);
                          notifyState(true);
                        }).catch(() => {});
                      }, 50);
                    }
                  }}
                >
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <b>{t.title}</b>
                  <small>{t.artist}</small>
                  <span>{i === selected ? (playing ? '❚❚' : '▶') : '♪'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
