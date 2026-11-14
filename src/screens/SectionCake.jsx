import React from "react";

export default function SectionCake() {
  const handleOpenCelebration = () => {
    if (window.ammuOpenCelebration) {
      window.ammuOpenCelebration();
    }
  };

  return (
    <section id={"cake"} className={"section cake-section"}>
      <div className={"wrap"}>
        {/* GRAND CELEBRATION HERO BANNER */}
        <div className={"section-top inverse"} style={{ marginBottom: "28px" }}>
          <span className={"eyebrow light"}>{"THE MAIN EVENT • 3D BIRTHDAY EXPERIENCE"}</span>
          <h2>{"A Grand Little Celebration For Our Birthday Girl "}<em>{"🎂"}</em></h2>
          <p style={{ maxWidth: "640px", margin: "10px auto 22px" }}>
            {"A beautiful birthday world is waiting for you, Pottiiiiiiii. Step inside the grand hall to make your wish, light the candles, and share the first slice."}
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              id={"btn-visit-celebration"}
              type="button"
              className={"btn btn-pink"}
              onClick={handleOpenCelebration}
              style={{
                fontSize: "17px",
                padding: "15px 36px",
                boxShadow: "0 8px 24px rgba(235, 78, 138, 0.45)",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px"
              }}
            >
              {"Visit Your Birthday Celebration 💗"}
            </button>
          </div>
        </div>

        {/* 3D CAKE STUDIO & FALLBACK CANVAS FOR INTEGRITY */}
        <div className={"cake-studio"}>
          <aside className={"cake-left"}>
            <span className={"eyebrow light"}>{"YOUR CELEBRATION"}</span>
            <h3>{"Cutie Cake "}<em>{"Studio"}</em></h3>
            <ol className={"cake-steps"} id={"cake-steps"}>
              <li className={"active"}>{"01 · Choose & Decorate"}</li>
              <li>{"02 · Make A Wish"}</li>
              <li>{"03 · Light Candles"}</li>
              <li>{"04 · Blow Them Out"}</li>
              <li>{"05 · Cut Two Lines"}</li>
              <li>{"06 · Serve First Slice"}</li>
            </ol>
            <div className={"cake-actions"}>
              <button id={"cake-prev"} className={"btn btn-soft"}>{"← Back"}</button>
              <button id={"cake-next"} className={"btn btn-pink"}>{"Let's Begin →"}</button>
            </div>
            <p className={"tiny"} id={"cake-status"}>{"A real-time interactive 3D cake, made for Pottiiiiiiii."}</p>
          </aside>

          <div className={"cake-viewport"}>
            <div className={"cake-canvas"} id={"cake-canvas"} aria-label={"3D cake interactive area"}>
              <div className={"cake-fallback"} id={"cake-fallback"}>
                <div className={"cake-fallback-photo"}>{"♡"}</div>
                <div className={"cake-fallback-tier"}>{"Happy Birthday"}<br />{"Ammuuu ♡"}</div>
                <div className={"cake-fallback-bottom"}></div>
                <div className={"cake-fallback-plate"}></div>
                <p>{"Loading interactive 3D cake..."}</p>
              </div>
            </div>
            <div className={"cake-stage-badge"} id={"cake-stage-badge"}>{"STAGE 01 · DESIGN YOUR CAKE"}</div>
            <div className={"cake-orbit-help"}>{"↔ Drag to rotate · Scroll to zoom · Tap cake to place the cut"}</div>
            <div className={"cake-cut-meter"} id={"cake-cut-meter"} hidden={true}>
              <div id={"cake-cut-progress"}></div>
            </div>
            <div className={"cake-knife-msg"} id={"cake-knife-msg"} hidden={true}>
              {"Drag across the cake to make your first cut 🔪"}
            </div>
          </div>

          <aside className={"cake-right"}>
            <span className={"eyebrow light"}>{"MAKE IT YOURS"}</span>
            <h3 id={"cake-panel-title"}>{"Choose Your Sweet Style"}</h3>
            <div id={"cake-panel"}></div>
          </aside>
        </div>

        <div className={"cake-after"} id={"cake-after"} hidden={true}>
          <h3>{"YAYYYYY POTTTIIIIII! 🎉"}</h3>
          <p>{"Birthday cake officially cut. Ashu better get at least one slice!"}</p>
          <button className={"btn btn-pink"} id={"cake-to-gifts"}>{"Let's Open Your Gifts 🎁"}</button>
          <button className={"btn btn-soft"} id={"cake-replay"}>{"Cut Again ↻"}</button>
        </div>
      </div>
    </section>
  );
}
