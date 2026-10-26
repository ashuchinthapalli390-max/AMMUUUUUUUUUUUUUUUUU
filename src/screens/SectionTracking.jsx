import React from "react";
export default function SectionTracking(){
  return (
<section id={"tracking"} className={"section blush tracking-section"} hidden={true}><div className={"wrap"}><div className={"section-top"}><span className={"eyebrow"}>{"YOUR GIFT REQUEST"}</span><h2>{"Something Sweet "}<em>{"Is On Its Way"}</em></h2></div><div className={"track-layout"}><div className={"tracking-ticket"}><span>{"OFFICIAL POTTI GIFT REQUEST"}</span><h3 id={"tracking-number"}>{"POTTI-XXXX"}</h3><p id={"tracking-message"}>{"Just one more little thing from Ashu..."}</p><ol className={"tracking-steps"} id={"tracking-steps"}></ol><button className={"btn btn-outline"} id={"tracking-refresh"}>{"Refresh Tracking ↻"}</button></div><div className="tracking-verify tracking-friendly"><div className="tracking-gift-icon" aria-hidden="true">🎀</div><h3>Made with love, from Ashu</h3><p>Your selected little gifts and their latest status appear here. Delivery verification is handled privately through Ashu's Studio after your confirmation.</p><p className="tiny">No verification code is needed on this screen. 💗</p></div></div></div></section>
);
}
