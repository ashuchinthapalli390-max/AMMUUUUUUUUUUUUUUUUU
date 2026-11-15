import React, { useState, Suspense, lazy } from "react";
import WonderlandOfGames from "../components/WonderlandOfGames.jsx";

const SlapAshuGame = lazy(() => import("../components/games/SlapAshuGame.jsx"));

export default function SectionGames() {
  const [isSlapOpen, setIsSlapOpen] = useState(false);
  const [savedScrollY, setSavedScrollY] = useState(0);

  const handleOpenSlap = () => {
    setSavedScrollY(window.scrollY);
    setIsSlapOpen(true);
    document.body.classList.add("modal-open");
  };

  const handleCloseSlap = () => {
    setIsSlapOpen(false);
    document.body.classList.remove("modal-open");
    // Seamlessly restore scroll position
    window.scrollTo({ top: savedScrollY, behavior: "instant" });
  };

  return (
    <section id={"games"} className={"section games-section blush"}>
      <div className={"wrap"}>
        <div className={"section-top"}>
          <span className={"eyebrow"}>{"BESTIE GAMES & LITTLE CHALLENGES"}</span>
          <h2>{"A Little Wonderland Of Games For "}<em>{"Pottiiiiiiii 🎮💗"}</em></h2>
          <p>
            {"Nine cute challenges just for you. Win hearts, guess our memories, tease your Ashu, and become the official birthday champion."}
          </p>
        </div>

        {/* PROMINENT FEATURED SLAP ASHU CARD */}
        <div className="slap-ashu-featured-banner">
          <div className="slap-featured-inner">
            <span className="slap-featured-badge">✿ SPECIAL INTERACTIVE MINI-GAME ✿</span>
            <div className="slap-featured-icon">😤💥</div>
            <h3 className="slap-featured-title">Angry With Ashu? 😭💗</h3>
            <p className="slap-featured-subtitle">
              Pottiiiiiiii, kopam thagge varaku Ashu ni tease cheyyi!
            </p>
            <button
              type="button"
              className="btn btn-pink slap-featured-btn"
              onClick={handleOpenSlap}
              id="open-slap-ashu-btn"
            >
              Slap Ashu 🎀
            </button>
          </div>
        </div>

        {/* 8 Playable Mini-Games */}
        <WonderlandOfGames onOpenSlapAshu={handleOpenSlap} />

        <div className={"certificate-callout"}>
          <span>{"🏆"}</span>
          <div>
            <h3>{"Professional-Style Birthday Certificates"}</h3>
            <p>{"Explore six elegant printable certificate designs signed by Ashu."}</p>
          </div>
          <button className={"btn btn-pink"} id={"download-certificate"}>
            {"Open Certificate Gallery ↗"}
          </button>
        </div>
      </div>

      {/* FULLSCREEN REACT-CONTROLLED SLAP ASHU GAME OVERLAY */}
      {isSlapOpen && (
        <div
          className="slap-ashu-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Angry With Ashu? Give Him A Little Slap!"
        >
          <div className="slap-ashu-modal-backdrop" onClick={handleCloseSlap} />
          <div className="slap-ashu-modal-container">
            <button
              type="button"
              className="slap-modal-exit-btn"
              onClick={handleCloseSlap}
              id="exit-slap-game-btn"
              aria-label="Exit Game ✕"
            >
              Exit Game ✕
            </button>
            <Suspense
              fallback={
                <div className="slap-loading-state">
                  <div className="slap-loading-spinner">🎀</div>
                  <p>Loading Ashu's 3D stage...</p>
                </div>
              }
            >
              <SlapAshuGame onClose={handleCloseSlap} />
            </Suspense>
          </div>
        </div>
      )}
    </section>
  );
}
