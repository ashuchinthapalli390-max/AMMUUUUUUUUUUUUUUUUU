import React from "react";
import LiveGiftSharing from "../components/LiveGiftSharing.jsx";

export default function SectionGifts() {
  return (
    <section id={"gifts"} className={"section ivory gift-section"}>
      <div className={"wrap"}>
        <div className={"section-top"}>
          <span className={"eyebrow"}>{"TWO SURPRISES • FROM ASHU"}</span>
          <h2>{"Two Little Surprises, "}<em>{"Just For You 💗"}</em></h2>
          <p>{"One to make you laugh, and one to remind you that Ashu is always on your side."}</p>
        </div>
        <div className={"gift-trio gift-duo"} id={"gifts-grid"}>
          <button className={"gift-box-card gift-card-left"} data-gift={"pranks"} type="button">
            <div className={"gift-graphic"}>{"🎁"}</div>
            <span>{"GIFT NO. 01"}</span>
            <h3>{"The Millionaire Dreams"}</h3>
            <p>{"Some extremely expensive gifts that only exist in Ashu's imagination."}</p>
            <b>{"Open This Gift →"}</b>
          </button>
          <button className={"gift-box-card gift-card-right"} data-gift={"memberships"} type="button">
            <div className={"gift-graphic"}>{"💌"}</div>
            <span>{"GIFT NO. 02"}</span>
            <h3>{"Forever Little Promises"}</h3>
            <p>{"Lifetime membership, cute vouchers and endless promises from Ashu."}</p>
            <b>{"Open This Gift →"}</b>
          </button>
        </div>

        {/* Live Shared Moment with Ashu */}
        <LiveGiftSharing giftId="gifts-duo" />
      </div>
    </section>
  );
}
