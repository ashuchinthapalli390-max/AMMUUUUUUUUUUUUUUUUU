import React from "react";

export default function SectionOther2() {
  return (
    <header className="site-nav slim-dedication-nav" role="banner">
      <span className="nav-edge-flower left" aria-hidden="true">✿</span>
      <h1 className="header-dedication-title">To My Dear Lovelyy Pottiiiiiiiiiiiiiiiiiiii 💗</h1>
      <span className="nav-edge-flower right" aria-hidden="true">✿</span>

      {/* Hidden legacy anchor/button handles for headless JS compatibility */}
      <span id="music-toggle" hidden aria-hidden="true" />
      <span id="replay-intro" hidden aria-hidden="true" />
      <span id="mobile-menu" hidden aria-hidden="true" />
    </header>
  );
}
