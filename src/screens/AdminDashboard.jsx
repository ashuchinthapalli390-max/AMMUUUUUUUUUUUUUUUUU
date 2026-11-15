import React from "react";

export default function AdminDashboard() {
  return (
    <div id={"dashboard"} hidden={true}>
      <aside className={"sidebar"}>
        <div className={"brand"}>
          {"Ashu's "}<em>{"Studio"}</em>
          <small>{"💗 AMMUUU BIRTHDAY PROJECT"}</small>
        </div>
        <button data-section={"overview"} className={"active"}>{"◈   Overview"}</button>
        <button data-section={"flyingnotes"}>{"🦋   Flying Love Notes"}</button>
        <button data-section={"mailstudio"}>{"💌   Countdown Mail Studio"}</button>
        <button data-section={"story"}>{"✎   Our Journey"}</button>
        <button data-section={"photos"}>{"▧   Photos & Gallery"}</button>
        <button data-section={"magazine"}>{"📖   Birthday Magazine"}</button>
        <button data-section={"bestiecard"}>{"🪪   Birthday ID Card"}</button>
        <button data-section={"wishes"}>{"💌   Ammu's Wishes"}</button>
        <button data-section={"letters"}>{"✉   Letters & Text"}</button>
        <button data-section={"vouchers"}>{"🎟️   Gifts & Memberships"}</button>
        <button data-section={"playlist"}>{"♫   Birthday Playlist"}</button>
        <button data-section={"extras"}>{"✦   Movies & Extra Notes"}</button>
        <button data-section={"settings"}>{"⚙   Website Settings"}</button>
        <button data-section={"notifications"}>{"♫   Email Log"}</button>
        <div className={"sidebar-bottom"}>
          <a href={"/"} target={"_blank"}>{"✦   Public Countdown Gate"}</a>
          <button id={"logout"}>{"Log Out"}</button>
        </div>
      </aside>
      <main className={"main"}>
        <header>
          <div>
            <span className={"crumb"}>{"PRIVATE CONTENT CONTROL"}</span>
            <h1 id={"page-title"}>{"Overview"}</h1>
          </div>
          <div className={"header-actions"}>
            <span className={"pill"}>{"Birthday Locked: 17 Nov 00:00 IST"}</span>
            <a href={"/"} target={"_blank"} className={"primary"} style={{fontWeight: 'bold', padding: '8px 18px', background: 'linear-gradient(135deg, #781d45, #b83d6a)', color: '#fff', textDecoration: 'none', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px'}}>
              {"✦ View Countdown Gate ↗"}
            </a>
          </div>
        </header>
        <div id={"admin-content"} className={"admin-content"}></div>
      </main>
    </div>
  );
}
