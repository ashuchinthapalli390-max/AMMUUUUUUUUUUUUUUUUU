import React from "react";
import ThreeGiftBox from "../ThreeGiftBox.jsx";

export default function SectionMemberships() {
  return (
    <section id={"memberships"} className={"section vouchers-section blush"}>
      <div className={"wrap"}>
        <div className={"section-top"}>
          <span className={"eyebrow"}>{"GIFT TWO • THE REAL PROMISES"}</span>
          <h2>{"Forever Is A "}<em>{"Long Time ♡"}</em></h2>
          <p>{"These are the little things I can actually promise you. No price tag needed."}</p>
        </div>
        <div className={"membership-hero"}>
          <div>
            <span>{"LIFETIME MEMBER • AMMUUUUUUU"}</span>
            <h3>{"Ashu's Forever"}<br /><em>{"Support Club"}</em></h3>
            <p>{"Always here to care, listen, help, argue about movies and make up after silly fights."}</p>
            <button id={"support-claim"} className={"btn btn-pink"} type="button">
              {"Accept Membership 💗"}
            </button>
          </div>
          <div className={"membership-seal"}>
            {"FOREVER"}<br />{"♡"}<small>{"NO EXPIRY"}</small>
          </div>
        </div>
        <div className="v5-voucher-gift">
          <ThreeGiftBox mode="voucher" />
          <div className="v5-box-lid">🎀</div>
          <div className="v5-box-base">♡</div>
          <div className="v5-gift-label">{"One by one, the cutest promises are coming..."}</div>
        </div>
        <div id={"voucher-grid"} className={"voucher-grid"}></div>
        <div className="membership-complete-card" id="membership-complete-card" hidden>
          <div className="complete-card-inner">
            <span className="complete-card-badge">{"✿ ALL PROMISES UNLOCKED ✿"}</span>
            <div className="complete-card-icon">{"💗"}</div>
            <h3>{"All These Little Promises Are Yours, Pottiiiiiiii 💗"}</h3>
            <p>{"No prices. No expiry dates. Just a collection of little promises from Ashu."}</p>
            <div className="complete-actions">
              <button type="button" className="btn btn-pink" id="keep-memories-btn">
                {"Keep These Memories Forever ♡"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
