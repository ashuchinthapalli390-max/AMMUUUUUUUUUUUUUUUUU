import React from "react";
export default function SectionChapterUi(){
  return (
<div id={"chapter-ui"} className={"chapter-ui"} hidden={true}><div className={"chapter-left"}><span className={"chapter-star"}>{"✦"}</span><span id={"chapter-label"}>{"CHAPTER 01"}</span><div className={"chapter-progress"}><div id={"chapter-progress-fill"}></div></div></div><div className="chapter-page-dots" id="chapter-page-dots" aria-label="Pages in this chapter"></div><div className={"chapter-right"}><button id={"chapter-previous"} type={"button"} title={"Previous page or chapter"}>{"← Previous"}</button><button id={"chapter-next"} type={"button"} title={"Next page or chapter"}>{"Next chapter →"}</button></div></div>
);
}
