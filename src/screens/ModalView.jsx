import React from "react";
export default function ModalView(){return (
<div id={"modal-backdrop"} className={"modal-backdrop"} hidden={true}><div id={"modal"} className={"modal"} role={"dialog"} aria-modal={"true"} aria-label={"Surprise message"}><button className={"modal-close"} id={"modal-close"} aria-label={"Close"}>{"✕"}</button><div id={"modal-content"}></div></div></div>
);}
