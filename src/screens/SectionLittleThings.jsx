import React from "react";
export default function SectionLittleThings(){
  return (
<section id={"little-things"} className={"section ivory small-section"}><div className={"wrap"}><div className={"section-top"}><span className={"eyebrow"}>{"A HUNDRED TINY REASONS"}</span><h2>{"Little Things "}<em>{"I Adore"}</em></h2><p>{"Touch the jar, find a little note, and collect as many smiles as you like."}</p></div><div className={"little-layout"}><button id={"reason-jar"} className={"jar"} aria-label={"Pick a note from the jar"}><span>{"♡"}</span><b>{"Pick a Note"}</b></button><div className={"reason-message"} id={"reason-message"}>{"“Even the smallest moments become special when they're shared with you.”"}</div><div className={"tiny-actions"}><button className={"btn btn-pink"} id={"hug-btn"}>{"Tap For A Virtual Hug 🫂"}</button><button className={"btn btn-outline"} id={"annoy-btn"}>{"Annoy Ashu 😈"}</button><button className={"btn btn-outline"} id={"seahorse-btn"}>{"The Seahorse Story 🐚"}</button></div></div></div></section>
);
}
