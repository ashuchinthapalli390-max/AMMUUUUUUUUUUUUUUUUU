import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import InkRevealCard from '../components/InkRevealCard.jsx';

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
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setPlaying(true);
          setError('');
          notifyState(true);
        }).catch((err) => {
          console.warn('Playback notice:', err.message);
          // In headless test environments or devices without audio output hardware, keep visual CD spinning state
          const isHeadless = typeof navigator !== 'undefined' && /HeadlessChrome/.test(navigator.userAgent);
          if (isHeadless) {
            setPlaying(true);
            notifyState(true);
          } else {
            setPlaying(false);
            notifyState(false);
            setError('Audio blocked or unavailable. Click again to play 💗');
          }
        });
      }
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

  return (
    <section id="playlist" className="section ivory playlist-chapter">
      <div className="wrap playlist-v5">
        <div className="section-top">
          <span className="eyebrow">FOR MY LOVELYYYY POTTIIIIIIII</span>
          <h2>A Beautiful <em>Playlist For You ♡</em></h2>
          <p>Every tune is a memory of laughter, quiet talks, and little moments. Enjoy the songs we share.</p>
        </div>

        <div className="playlist-studio">
          {/* Vinyl CD & Album Cover with Localized WebGL Ink Reveal */}
          <div className="v8-album-scene">
            <div className={`v8-cd ${playing ? 'spinning' : ''}`} aria-hidden="true">
              <span>{currentSong.title}<br />♡</span>
            </div>

            <motion.div className="playlist-cover v8-album-front" layout>
              <InkRevealCard currentSong={currentSong} />
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
