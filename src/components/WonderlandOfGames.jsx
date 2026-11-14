import React, { useState, useEffect, useRef } from 'react';

// Approved photos from public/assets/photos/
const AMMU_PHOTOS = [
  '/assets/photos/ammu_01.jpg',
  '/assets/photos/ammu_02.jpg',
  '/assets/photos/ammu_03.jpg',
  '/assets/photos/ammu_04.jpg',
  '/assets/photos/ammu_05.jpg',
  '/assets/photos/ammu_06.jpg',
  '/assets/photos/ammu_07.jpg',
  '/assets/photos/ammu_10.jpg',
];

export default function WonderlandOfGames() {
  const [activeTab, setActiveTab] = useState('butterflies');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Soft Web Audio synthesizers (zero external assets)
  const playSound = (type = 'chime') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'chime') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.36);
      } else if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.13);
      } else if (type === 'win') {
        osc.type = 'sine';
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.1);
        osc.frequency.setValueAtTime(659.25, now + 0.2);
        osc.frequency.setValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start();
        osc.stop(now + 0.65);
      }
    } catch {}
  };

  return (
    <div className="wonderland-games-container" style={{ width: '100%' }}>
      {/* HEADER CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '13px', color: '#9E4E73', fontWeight: 600 }}>
          🎮 Select any of the 8 interactive games designed for Ammu:
        </div>
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          style={{
            background: soundEnabled ? '#FFF0F5' : '#EFE8EB',
            border: '1px solid #EAA4BE',
            borderRadius: '20px',
            padding: '6px 14px',
            fontSize: '12px',
            color: '#70193E',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {soundEnabled ? '🔊 Sound: ON' : '🔈 Sound: OFF'}
        </button>
      </div>

      {/* GAME TABS (8 GAMES) */}
      <div className="game-tabs" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '25px' }}>
        <button className={activeTab === 'butterflies' ? 'active' : ''} onClick={() => { setActiveTab('butterflies'); playSound('pop'); }}>
          🦋 Catch The Butterflies
        </button>
        <button className={activeTab === 'memory' ? 'active' : ''} onClick={() => { setActiveTab('memory'); playSound('pop'); }}>
          ✿ Our Memory Match
        </button>
        <button className={activeTab === 'stars' ? 'active' : ''} onClick={() => { setActiveTab('stars'); playSound('pop'); }}>
          ⭐ The Midnight Star Hunt
        </button>
        <button className={activeTab === 'puzzle' ? 'active' : ''} onClick={() => { setActiveTab('puzzle'); playSound('pop'); }}>
          🧩 Cute Photo Puzzle
        </button>
        <button className={activeTab === 'quiz' ? 'active' : ''} onClick={() => { setActiveTab('quiz'); playSound('pop'); }}>
          🎬 Marvel & Movie Quiz
        </button>
        <button className={activeTab === 'garden' ? 'active' : ''} onClick={() => { setActiveTab('garden'); playSound('pop'); }}>
          🌸 The Flower Garden
        </button>
        <button className={activeTab === 'envelopes' ? 'active' : ''} onClick={() => { setActiveTab('envelopes'); playSound('pop'); }}>
          💌 Secret Envelope Hunt
        </button>
        <button className={activeTab === 'cake' ? 'active' : ''} onClick={() => { setActiveTab('cake'); playSound('pop'); }}>
          🎂 Cake Decorator
        </button>
      </div>

      {/* GAME VIEWPORT */}
      <div id="game-board" className="game-board" style={{ minHeight: '440px', position: 'relative' }}>
        {activeTab === 'butterflies' && <GameButterflies playSound={playSound} />}
        {activeTab === 'memory' && <GameMemoryMatch playSound={playSound} />}
        {activeTab === 'stars' && <GameMidnightStars playSound={playSound} />}
        {activeTab === 'puzzle' && <GamePhotoPuzzle playSound={playSound} />}
        {activeTab === 'quiz' && <GameMarvelQuiz playSound={playSound} />}
        {activeTab === 'garden' && <GameFlowerGarden playSound={playSound} />}
        {activeTab === 'envelopes' && <GameEnvelopeHunt playSound={playSound} />}
        {activeTab === 'cake' && <GameCakeDecorator playSound={playSound} />}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// GAME 1: CATCH THE BUTTERFLIES
// -------------------------------------------------------------
function GameButterflies({ playSound }) {
  const [caughtCount, setCaughtCount] = useState(0);
  const [compliment, setCompliment] = useState('');
  const [butterflies, setButterflies] = useState([
    { id: 1, x: 20, y: 30, color: '#F8BBD0', emoji: '🦋' },
    { id: 2, x: 70, y: 25, color: '#D7BCE8', emoji: '🦋' },
    { id: 3, x: 40, y: 65, color: '#FFE4CD', emoji: '🦋' },
    { id: 4, x: 80, y: 70, color: '#BEE3F8', emoji: '🦋' },
    { id: 5, x: 15, y: 75, color: '#FFFDF7', emoji: '🦋' },
  ]);

  const compliments = [
    'You caught a blush butterfly! Pottiii, your smile is breathtaking. 🌸',
    'Lavender butterfly caught! Even quiet days with you are fun. ✨',
    'Golden butterfly! You bring so much warmth to the world. ☀️',
    'Sky-blue butterfly! You are one of a kind. 💙',
    'Pure pearl butterfly! Pottiiii, you are the official champion! 🏆',
  ];

  const handleCatch = (id) => {
    playSound('chime');
    setButterflies((prev) => prev.filter((b) => b.id !== id));
    const nextCount = caughtCount + 1;
    setCaughtCount(nextCount);
    setCompliment(compliments[nextCount - 1] || 'Magical catch! 💗');
    if (nextCount === 5) {
      playSound('win');
    }
  };

  const restart = () => {
    setCaughtCount(0);
    setCompliment('');
    setButterflies([
      { id: 1, x: 20, y: 30, color: '#F8BBD0', emoji: '🦋' },
      { id: 2, x: 70, y: 25, color: '#D7BCE8', emoji: '🦋' },
      { id: 3, x: 40, y: 65, color: '#FFE4CD', emoji: '🦋' },
      { id: 4, x: 80, y: 70, color: '#BEE3F8', emoji: '🦋' },
      { id: 5, x: 15, y: 75, color: '#FFFDF7', emoji: '🦋' },
    ]);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="game-progress">
        <span>GAME 01 · BUTTERFLY FLIGHT</span>
        <span>{caughtCount} / 5 BUTTERFLIES CAUGHT</span>
      </div>
      <h3 style={{ margin: '8px 0' }}>Catch The Magical Butterflies 🦋</h3>
      <p style={{ margin: '0 0 16px', color: '#7E2C51' }}>
        Tap each fluttering butterfly as it drifts across Ammu’s garden.
      </p>

      {caughtCount < 5 ? (
        <div
          style={{
            position: 'relative',
            height: '280px',
            background: 'radial-gradient(circle, #FFF4F8 0%, #FFE9F2 100%)',
            borderRadius: '16px',
            border: '1.5px dashed #E6ADC2',
            overflow: 'hidden',
          }}
        >
          {butterflies.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => handleCatch(b.id)}
              aria-label="Catch this butterfly"
              style={{
                position: 'absolute',
                left: `${b.x}%`,
                top: `${b.y}%`,
                background: 'transparent',
                border: 'none',
                fontSize: '36px',
                cursor: 'pointer',
                animation: 'ammuDrift 3s ease-in-out infinite alternate',
                transform: 'translate(-50%, -50%)',
                padding: '10px',
              }}
            >
              {b.emoji}
            </button>
          ))}
          {compliment && (
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.9)',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                color: '#7B1F47',
                fontWeight: 600,
              }}
            >
              {compliment}
            </div>
          )}
        </div>
      ) : (
        <div className="game-center" style={{ padding: '30px 20px' }}>
          <span style={{ fontSize: '64px' }}>🎉</span>
          <h3 style={{ color: '#7B1F47' }}>All Butterflies Caught! 💗</h3>
          <p style={{ maxWidth: '440px', margin: '0 auto 20px', color: '#551C36' }}>
            Ammuuuu, your reflexes are as quick as your wit! You unlocked the Garden Blessing from Ashu.
          </p>
          <button className="btn btn-pink" onClick={restart}>Play Again ↻</button>
        </div>
      )}

      <style>{`
        @keyframes ammuDrift {
          0% { transform: translate(-50%, -50%) translateY(-10px) rotate(-6deg); }
          100% { transform: translate(-50%, -50%) translateY(10px) rotate(6deg); }
        }
      `}</style>
    </div>
  );
}

// -------------------------------------------------------------
// GAME 2: OUR MEMORY MATCH (Using Approved Photos)
// -------------------------------------------------------------
function GameMemoryMatch({ playSound }) {
  const cardsData = [
    { id: 1, pairId: 'a', img: AMMU_PHOTOS[0] },
    { id: 2, pairId: 'a', img: AMMU_PHOTOS[0] },
    { id: 3, pairId: 'b', img: AMMU_PHOTOS[1] },
    { id: 4, pairId: 'b', img: AMMU_PHOTOS[1] },
    { id: 5, pairId: 'c', img: AMMU_PHOTOS[2] },
    { id: 6, pairId: 'c', img: AMMU_PHOTOS[2] },
    { id: 7, pairId: 'd', img: AMMU_PHOTOS[3] },
    { id: 8, pairId: 'd', img: AMMU_PHOTOS[3] },
  ];

  const [cards, setCards] = useState(() => cardsData.sort(() => Math.random() - 0.5));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;
    playSound('pop');
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].pairId === cards[second].pairId) {
        playSound('chime');
        setMatched((prev) => {
          const next = [...prev, first, second];
          if (next.length === cards.length) {
            playSound('win');
          }
          return next;
        });
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  const restart = () => {
    setCards([...cardsData].sort(() => Math.random() - 0.5));
    setFlipped([]);
    setMatched([]);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="game-progress">
        <span>GAME 02 · PHOTO MATCH</span>
        <span>{matched.length / 2} / 4 PAIRS FOUND</span>
      </div>
      <h3 style={{ margin: '8px 0' }}>Our Memory Match ✿</h3>
      <p style={{ margin: '0 0 20px', color: '#7E2C51' }}>
        Flip and match the candid photos of Ammu from our collection.
      </p>

      {matched.length === cards.length ? (
        <div className="game-center" style={{ padding: '30px 20px' }}>
          <span style={{ fontSize: '64px' }}>💖</span>
          <h3 style={{ color: '#7B1F47' }}>Perfect Memory! 🎉</h3>
          <p style={{ maxWidth: '440px', margin: '0 auto 20px', color: '#551C36' }}>
            Every photograph is a reminder of how much fun we have together. You remembered them all!
          </p>
          <button className="btn btn-pink" onClick={restart}>Play Again ↻</button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            maxWidth: '460px',
            margin: '0 auto',
          }}
        >
          {cards.map((c, i) => {
            const isRevealed = flipped.includes(i) || matched.includes(i);
            return (
              <button
                key={c.id + '-' + i}
                type="button"
                onClick={() => handleCardClick(i)}
                aria-label={`Photo card ${i + 1}`}
                style={{
                  height: '95px',
                  borderRadius: '12px',
                  border: matched.includes(i) ? '2px solid #8cccaa' : '2px solid #EAA4BE',
                  background: isRevealed ? '#FFF' : 'linear-gradient(135deg, #FADCE6, #F5BFD3)',
                  cursor: 'pointer',
                  padding: '4px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.25s ease',
                  transform: isRevealed ? 'scale(1)' : 'scale(0.98)',
                }}
              >
                {isRevealed ? (
                  <img
                    src={c.img}
                    alt="Memory"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                  />
                ) : (
                  <span style={{ fontSize: '26px', color: '#882A52' }}>🌸</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// GAME 3: THE MIDNIGHT STAR HUNT
// -------------------------------------------------------------
function GameMidnightStars({ playSound }) {
  const [foundStars, setFoundStars] = useState([]);
  const [activeNote, setActiveNote] = useState('');

  const stars = [
    { id: 1, x: 25, y: 30, note: 'Star 1: You’re the friend who makes simple food taste like a feast. 🍕' },
    { id: 2, x: 75, y: 20, note: 'Star 2: Your advice is always surprisingly wise, Pottiiii. 🌟' },
    { id: 3, x: 50, y: 55, note: 'Star 3: Thank you for never giving up on our jokes. 💫' },
    { id: 4, x: 20, y: 75, note: 'Star 4: You make ordinary days feel like holidays. 🎈' },
    { id: 5, x: 80, y: 70, note: 'Star 5: Forever team Ammu and Ashu against all odds! 👑' },
  ];

  const handleStarClick = (star) => {
    playSound('chime');
    if (!foundStars.includes(star.id)) {
      const next = [...foundStars, star.id];
      setFoundStars(next);
      if (next.length === stars.length) {
        playSound('win');
      }
    }
    setActiveNote(star.note);
  };

  const restart = () => {
    setFoundStars([]);
    setActiveNote('');
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="game-progress">
        <span>GAME 03 · MIDNIGHT STAR HUNT</span>
        <span>{foundStars.length} / 5 STARS FOUND</span>
      </div>
      <h3 style={{ margin: '8px 0' }}>The Midnight Star Hunt ⭐</h3>
      <p style={{ margin: '0 0 16px', color: '#7E2C51' }}>
        Click the hidden glowing stars in the midnight sky to read secret notes.
      </p>

      <div
        style={{
          position: 'relative',
          height: '280px',
          background: 'radial-gradient(circle at center, #351336 0%, #15091c 80%)',
          borderRadius: '16px',
          border: '1px solid #75336B',
          overflow: 'hidden',
          marginBottom: '16px',
        }}
      >
        {stars.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => handleStarClick(s)}
            aria-label={`Find star ${s.id}`}
            style={{
              position: 'absolute',
              left: `${s.x}%`,
              top: `${s.y}%`,
              background: 'transparent',
              border: 'none',
              fontSize: foundStars.includes(s.id) ? '32px' : '26px',
              color: foundStars.includes(s.id) ? '#FFD700' : '#FFC0CB',
              cursor: 'pointer',
              filter: 'drop-shadow(0 0 8px #FFD700)',
              animation: 'ammuTwinkle 2s ease-in-out infinite alternate',
            }}
          >
            ★
          </button>
        ))}

        {activeNote && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '20px',
              right: '20px',
              background: 'rgba(25, 8, 26, 0.85)',
              border: '1px solid #EAA4BE',
              color: '#FFF',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '13px',
            }}
          >
            {activeNote}
          </div>
        )}
      </div>

      {foundStars.length === 5 && (
        <button className="btn btn-soft" onClick={restart} style={{ marginTop: '8px' }}>
          Reset Sky ↻
        </button>
      )}

      <style>{`
        @keyframes ammuTwinkle {
          0% { opacity: 0.4; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}

// -------------------------------------------------------------
// GAME 4: THE CUTE PHOTO PUZZLE (Jigsaw Snap-To-Position)
// -------------------------------------------------------------
function GamePhotoPuzzle({ playSound }) {
  // 3x3 Tile puzzle
  const initialTiles = [
    { id: 0, currentPos: 2 },
    { id: 1, currentPos: 0 },
    { id: 2, currentPos: 5 },
    { id: 3, currentPos: 1 },
    { id: 4, currentPos: 4 },
    { id: 5, currentPos: 3 },
  ];

  const [tiles, setTiles] = useState(initialTiles);
  const [selectedIdx, setSelectedIdx] = useState(null);

  const isComplete = tiles.every((t, i) => t.id === i);

  const handleTileClick = (index) => {
    playSound('pop');
    if (selectedIdx === null) {
      setSelectedIdx(index);
    } else {
      // Swap tiles
      const next = [...tiles];
      const temp = next[selectedIdx];
      next[selectedIdx] = next[index];
      next[index] = temp;
      setTiles(next);
      setSelectedIdx(null);

      // Check win
      if (next.every((t, i) => t.id === i)) {
        playSound('win');
      }
    }
  };

  const solve = () => {
    playSound('win');
    setTiles([
      { id: 0, currentPos: 0 },
      { id: 1, currentPos: 1 },
      { id: 2, currentPos: 2 },
      { id: 3, currentPos: 3 },
      { id: 4, currentPos: 4 },
      { id: 5, currentPos: 5 },
    ]);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="game-progress">
        <span>GAME 04 · JIGSAW PUZZLE</span>
        <span>{isComplete ? 'COMPLETED ✓' : 'TAP TWO PIECES TO SWAP'}</span>
      </div>
      <h3 style={{ margin: '8px 0' }}>The Cute Photo Puzzle 🧩</h3>
      <p style={{ margin: '0 0 16px', color: '#7E2C51' }}>
        Rearrange the scrambled segments to assemble Ammu’s portrait.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 100px)',
          gridTemplateRows: 'repeat(2, 100px)',
          gap: '4px',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}
      >
        {tiles.map((t, idx) => (
          <button
            key={t.id}
            type="button"
            onClick={() => handleTileClick(idx)}
            aria-label={`Puzzle tile ${idx + 1}`}
            style={{
              width: '100px',
              height: '100px',
              padding: 0,
              border: selectedIdx === idx ? '3px solid #E52E71' : '1px solid #FFF',
              borderRadius: '6px',
              overflow: 'hidden',
              cursor: 'pointer',
              background: '#F0D4DF',
            }}
          >
            <div
              style={{
                width: '300px',
                height: '200px',
                backgroundImage: `url(${AMMU_PHOTOS[6]})`,
                backgroundSize: '300px 200px',
                backgroundPosition: `${-(t.id % 3) * 100}px ${-Math.floor(t.id / 3) * 100}px`,
              }}
            />
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button className="btn btn-soft" onClick={() => setTiles(initialTiles)}>Scramble ↻</button>
        <button className="btn btn-soft" onClick={solve}>Instant Snap ✨</button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// GAME 5: MARVEL & MOVIE BUDDY QUIZ
// -------------------------------------------------------------
function GameMarvelQuiz({ playSound }) {
  const questions = [
    {
      q: 'Which Avenger built an entire arc reactor in a cave with a box of scraps?',
      options: ['Tony Stark (Iron Man)', 'Steve Rogers', 'Thor', 'Bruce Banner'],
      correct: 0,
      note: 'Iron Man forever! The greatest genius in Marvel history.',
    },
    {
      q: 'When Spider-Man says "With great power comes great...", what comes next?',
      options: ['Awesome pizza', 'Responsibility', 'More chaos', 'Spider webs'],
      correct: 1,
      note: 'Responsibility! And also saving the world before midnight curfew.',
    },
    {
      q: 'What is the absolute best companion for a late night anime and movie session?',
      options: ['Popcorn and ice cream', 'Silently falling asleep', 'Silly commentary', 'All of the above!'],
      correct: 3,
      note: 'All of the above! Especially midnight snacks with Pottiiii.',
    },
  ];

  const [curQ, setCurQ] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleAnswer = (idx) => {
    const isCorrect = idx === questions[curQ].correct;
    if (isCorrect) {
      playSound('chime');
      setScore(score + 1);
      setFeedback('YAYYY Correct! ' + questions[curQ].note);
    } else {
      playSound('pop');
      setFeedback('Hehehe nice guess! Answer: ' + questions[curQ].options[questions[curQ].correct]);
    }

    setTimeout(() => {
      setFeedback('');
      setCurQ(curQ + 1);
      if (curQ + 1 === questions.length) {
        playSound('win');
      }
    }, 1200);
  };

  const restart = () => {
    setCurQ(0);
    setScore(0);
    setFeedback('');
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="game-progress">
        <span>GAME 05 · MARVEL & MOVIE QUIZ</span>
        <span>{curQ < questions.length ? `QUESTION ${curQ + 1} / ${questions.length}` : 'FINISHED'}</span>
      </div>

      {curQ < questions.length ? (
        <div>
          <h3 style={{ margin: '8px 0' }}>{questions[curQ].q}</h3>
          <p style={{ margin: '0 0 16px', color: '#7E2C51' }}>Pick the best answer, superhero partner!</p>

          <div className="game-options" style={{ maxWidth: '500px', margin: '0 auto 16px' }}>
            {questions[curQ].options.map((opt, i) => (
              <button key={opt} type="button" onClick={() => handleAnswer(i)}>
                {opt}
              </button>
            ))}
          </div>

          {feedback && <div style={{ color: '#882A52', fontWeight: 600 }}>{feedback}</div>}
        </div>
      ) : (
        <div className="game-center" style={{ padding: '30px 20px' }}>
          <span style={{ fontSize: '64px' }}>🎬</span>
          <h3 style={{ color: '#7B1F47' }}>Score: {score} / {questions.length}!</h3>
          <p style={{ maxWidth: '440px', margin: '0 auto 20px', color: '#551C36' }}>
            You are officially certified as Ashu’s #1 Marvel & Movie Marathon Partner!
          </p>
          <button className="btn btn-pink" onClick={restart}>Play Again ↻</button>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// GAME 6: THE FLOWER GARDEN
// -------------------------------------------------------------
function GameFlowerGarden({ playSound }) {
  const [plantedSpots, setPlantedSpots] = useState([]);
  const gardenSpots = [0, 1, 2, 3, 4, 5, 6, 7];

  const handlePlant = (spot) => {
    playSound('chime');
    if (!plantedSpots.includes(spot)) {
      const next = [...plantedSpots, spot];
      setPlantedSpots(next);
      if (next.length === gardenSpots.length) {
        playSound('win');
      }
    }
  };

  const flowerTypes = ['🌸', '🌹', '🌷', '🌺', '🌼', '💐', '🌻', '🪻'];

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="game-progress">
        <span>GAME 06 · GARDEN OF BLOOMS</span>
        <span>{plantedSpots.length} / 8 FLOWERS PLANTED</span>
      </div>
      <h3 style={{ margin: '8px 0' }}>The Flower Garden 🌸</h3>
      <p style={{ margin: '0 0 16px', color: '#7E2C51' }}>
        Click the soil plots to plant virtual birthday flowers for Ammu.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          maxWidth: '480px',
          margin: '0 auto 20px',
        }}
      >
        {gardenSpots.map((spot, i) => (
          <button
            key={spot}
            type="button"
            onClick={() => handlePlant(spot)}
            aria-label={`Plant flower ${i + 1}`}
            style={{
              height: '80px',
              borderRadius: '16px',
              border: '2px solid #EAA4BE',
              background: plantedSpots.includes(spot)
                ? 'linear-gradient(135deg, #FFF0F5, #FFE4ED)'
                : '#FAF0E6',
              fontSize: '34px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s ease',
            }}
          >
            {plantedSpots.includes(spot) ? flowerTypes[i] : '🌱'}
          </button>
        ))}
      </div>

      {plantedSpots.length === 8 ? (
        <div style={{ background: '#FFF4F7', padding: '16px', borderRadius: '14px', border: '1px solid #F1BFD3' }}>
          <h4 style={{ margin: '0 0 6px', color: '#7E1D45' }}>A Garden In Full Bloom For Pottiiiiiiii! 🌺</h4>
          <p style={{ margin: 0, fontSize: '14px', color: '#551C36' }}>
            "May your life always blossom with laughter, true friendship, and endless peace."
          </p>
        </div>
      ) : (
        <small style={{ color: '#9E4E73' }}>Tap all soil plots to make the whole garden bloom!</small>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// GAME 7: THE SECRET ENVELOPE HUNT
// -------------------------------------------------------------
function GameEnvelopeHunt({ playSound }) {
  const [foundEnvelopes, setFoundEnvelopes] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState('');

  const envelopes = [
    { id: 1, x: 22, y: 35, msg: 'Letter 1: Remember to always stay as confident as you are today! 💌' },
    { id: 2, x: 68, y: 25, msg: 'Letter 2: Nobody can match your funny eye-rolls and quick smiles. 💌' },
    { id: 3, x: 45, y: 68, msg: 'Letter 3: Wishing you the absolute happiest, brightest upcoming year! 💌' },
    { id: 4, x: 82, y: 72, msg: 'Letter 4: You will always have Ashu in your corner cheering for you. 💌' },
  ];

  const handleEnvelopeClick = (env) => {
    playSound('chime');
    if (!foundEnvelopes.includes(env.id)) {
      const next = [...foundEnvelopes, env.id];
      setFoundEnvelopes(next);
      if (next.length === envelopes.length) {
        playSound('win');
      }
    }
    setSelectedMessage(env.msg);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="game-progress">
        <span>GAME 07 · SECRET ENVELOPE HUNT</span>
        <span>{foundEnvelopes.length} / 4 ENVELOPES UNLOCKED</span>
      </div>
      <h3 style={{ margin: '8px 0' }}>The Secret Envelope Hunt 💌</h3>
      <p style={{ margin: '0 0 16px', color: '#7E2C51' }}>
        Find all 4 hidden envelopes tucked inside the scrapbook scene.
      </p>

      <div
        style={{
          position: 'relative',
          height: '260px',
          background: '#FFF9F5',
          borderRadius: '16px',
          border: '1.5px dashed #E5B4C7',
          overflow: 'hidden',
          marginBottom: '14px',
        }}
      >
        {envelopes.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => handleEnvelopeClick(e)}
            aria-label={`Open envelope ${e.id}`}
            style={{
              position: 'absolute',
              left: `${e.x}%`,
              top: `${e.y}%`,
              background: 'transparent',
              border: 'none',
              fontSize: '32px',
              cursor: 'pointer',
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
            }}
          >
            {foundEnvelopes.includes(e.id) ? '📜' : '✉️'}
          </button>
        ))}

        {selectedMessage && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '16px',
              right: '16px',
              background: '#FFF',
              border: '1px solid #EAA4BE',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#6E1B3E',
              fontWeight: 600,
            }}
          >
            {selectedMessage}
          </div>
        )}
      </div>

      {foundEnvelopes.length === 4 && (
        <div style={{ color: '#882A52', fontWeight: 700, fontSize: '15px' }}>
          🎉 All secret letters found! You are a master explorer!
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// GAME 8: BIRTHDAY CAKE DECORATION (Lightweight & Independent)
// -------------------------------------------------------------
function GameCakeDecorator({ playSound }) {
  const [frosting, setFrosting] = useState('#F8BBD0'); // Pink
  const [candles, setCandles] = useState(3);
  const [topper, setTopper] = useState('Happy Birthday Ammu!');
  const [hasSparkler, setHasSparkler] = useState(false);

  const frostings = [
    { label: 'Pastel Pink', color: '#F8BBD0' },
    { label: 'Lavender Cream', color: '#E1BEE7' },
    { label: 'Warm Vanilla', color: '#FFF9C4' },
    { label: 'Rose Gold', color: '#F48FB1' },
  ];

  const handleSparkler = () => {
    playSound('chime');
    setHasSparkler(!hasSparkler);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="game-progress">
        <span>GAME 08 · DESIGN A CUTIE CAKE</span>
        <span>INDEPENDENT CAKE ARTIST STUDIO</span>
      </div>
      <h3 style={{ margin: '8px 0' }}>Birthday Cake Decoration 🎂</h3>
      <p style={{ margin: '0 0 16px', color: '#7E2C51' }}>
        Customize frosting colors, candles and cake topper messages!
      </p>

      {/* 2D VISUAL CAKE PREVIEW */}
      <div
        style={{
          width: '240px',
          margin: '0 auto 20px',
          background: '#FFF8F6',
          borderRadius: '20px',
          border: '2px solid #EFCAD8',
          padding: '24px 16px 16px',
          boxShadow: '0 8px 24px rgba(120, 30, 60, 0.1)',
        }}
      >
        {/* CANDLES ROW */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '8px' }}>
          {Array.from({ length: candles }).map((_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '14px',
                  animation: 'ammuCandleFlicker 0.6s infinite alternate',
                  filter: 'drop-shadow(0 0 4px #FFA500)',
                }}
              >
                🔥
              </span>
              <div style={{ width: '6px', height: '22px', background: '#FF69B4', borderRadius: '3px' }} />
            </div>
          ))}
        </div>

        {/* TOP TIER */}
        <div
          style={{
            height: '45px',
            width: '140px',
            margin: '0 auto',
            background: frosting,
            borderRadius: '10px 10px 0 0',
            border: '2px solid #FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#651A3C',
          }}
        >
          {topper}
        </div>

        {/* BOTTOM TIER */}
        <div
          style={{
            height: '55px',
            width: '180px',
            margin: '0 auto',
            background: frosting,
            borderRadius: '0 0 12px 12px',
            border: '2px solid #FFF',
            borderTop: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}
        >
          🍓 🌸 🍓
        </div>

        {/* PLATE */}
        <div style={{ width: '210px', height: '10px', background: '#E2E8F0', borderRadius: '6px', margin: '4px auto 0' }} />
      </div>

      {/* CONTROLS */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '14px' }}>
        {frostings.map((f) => (
          <button
            key={f.label}
            type="button"
            onClick={() => { playSound('pop'); setFrosting(f.color); }}
            style={{
              background: f.color,
              border: frosting === f.color ? '2px solid #70193E' : '1px solid #CCC',
              padding: '6px 14px',
              borderRadius: '16px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          className="btn btn-soft"
          onClick={() => { playSound('pop'); setCandles((candles % 5) + 1); }}
        >
          Candles: {candles} 🕯️
        </button>
        <button className="btn btn-pink" onClick={handleSparkler}>
          {hasSparkler ? 'Sparklers: ON ✨' : 'Light Sparkler ✨'}
        </button>
      </div>

      <style>{`
        @keyframes ammuCandleFlicker {
          0% { transform: scale(1); }
          100% { transform: scale(1.2) translateY(-2px); }
        }
      `}</style>
    </div>
  );
}
