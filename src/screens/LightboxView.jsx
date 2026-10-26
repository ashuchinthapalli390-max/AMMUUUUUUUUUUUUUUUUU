import React from "react";
export default function LightboxView(){return (
<div id={"gallery-lightbox"} className={"lightbox"} hidden={true}><button id={"lightbox-close"} aria-label={"Close gallery"}>{"✕"}</button><button id={"lightbox-prev"} aria-label={"Previous photo"}>{"←"}</button><div className={"lightbox-card"}><img id={"lightbox-img"} alt={"Ammu gallery image"} /><div className={"lightbox-text"}><span id={"lightbox-index"}></span><p id={"lightbox-caption"}></p></div></div><button id={"lightbox-next"} aria-label={"Next photo"}>{"→"}</button></div>
);}
