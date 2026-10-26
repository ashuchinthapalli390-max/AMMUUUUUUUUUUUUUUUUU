import React from "react";
export default function SectionLetters(){
  return (
<section id={"letters"} className={"section letters-section"}><div className={"wrap"}><div className={"section-top"}><span className={"eyebrow"}>{"HANDWRITTEN WITH LOVE"}</span><h2>{"Little Letters "}<em>{"For You"}</em></h2><p>{"Open one whenever the world feels a little too loud, or when you simply want to smile."}</p></div><div className={"letter-layout"}><div className={"letter-list"} id={"letter-list"}></div><div className={"letter-sheet"} id={"letter-detail"}><div className={"letter-top"}>{"a little note for Ammuu ♡"}</div><h3>{"From Ashu 💗"}</h3><p id={"letter-body"}>{"Click an envelope and unfold a little letter."}</p><p className={"letter-sign"}>{"With love,"}<br /><strong>{"Ashuuuuuuuuuuu"}</strong></p><div className={"letter-actions"}><button className={"btn btn-outline"} id={"letter-next"}>{"Read Next Letter →"}</button></div></div></div></div></section>
);
}
