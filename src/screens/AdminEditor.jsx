import React from "react";
export default function AdminEditor(){return (
<div id={"editor-overlay"} hidden={true}><div id={"editor"} className={"editor"}><button className={"x"} id={"editor-close"}>{"✕"}</button><h2 id={"editor-title"}>{"Edit Item"}</h2><form id={"editor-form"}><div id={"editor-fields"}></div><div className={"buttons"}><button className={"outline"} type={"button"} id={"editor-cancel"}>{"Cancel"}</button><button className={"primary"} type={"submit"}>{"Save Changes ✓"}</button></div></form></div></div>
);}
