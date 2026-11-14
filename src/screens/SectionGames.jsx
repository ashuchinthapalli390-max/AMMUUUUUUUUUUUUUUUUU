import React from "react";
import WonderlandOfGames from "../components/WonderlandOfGames.jsx";

export default function SectionGames() {
  return (
    <section id={"games"} className={"section games-section blush"}>
      <div className={"wrap"}>
        <div className={"section-top"}>
          <span className={"eyebrow"}>{"BESTIE GAMES & LITTLE CHALLENGES"}</span>
          <h2>{"A Little Wonderland Of Games For "}<em>{"Pottiiiiiiii 🎮💗"}</em></h2>
          <p>
            {"Eight cute challenges just for you. Win hearts, guess our memories, and become the official birthday champion."}
          </p>
        </div>

        {/* 8 Playable Mini-Games */}
        <WonderlandOfGames />

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
    </section>
  );
}
