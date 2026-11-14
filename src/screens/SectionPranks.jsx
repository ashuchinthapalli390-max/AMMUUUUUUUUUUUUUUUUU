import React from "react";

export default function SectionPranks() {
  return (
    <section id="pranks" className="section ivory prank-section gift-modal-overlay" hidden aria-modal="true" role="dialog" aria-label="Gift One: The Dream Gifts">
      <div className="gift-modal-top-bar">
        <span className="gift-modal-badge">✿ SURPRISE GIFT NO. 01 ✿</span>
        <button type="button" className="close-gift-modal-btn" id="close-pranks-modal" aria-label="Close Gift One">
          <span>Close Gift</span> ✕
        </button>
      </div>
      <div className="wrap">
        <div className="section-top prank-header-top">
          <span className="eyebrow">GIFT ONE • THE LUXURY COLLECTION</span>
          <h2>Dream Gifts <em>For My Pottiiiiiiii ♡</em></h2>
          <p>Open the boxes first. Don't ask Ashu about his bank balance. 😭</p>
        </div>
        <div id="prank-grid" className="prank-grid"></div>
      </div>
    </section>
  );
}
