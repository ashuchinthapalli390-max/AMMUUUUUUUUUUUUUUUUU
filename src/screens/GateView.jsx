import React, { useState, useEffect } from "react";

export default function GateView({ isPreview = false }) {
  const [optInOpen, setOptInOpen] = useState(false);
  const [optInEmail, setOptInEmail] = useState("");
  const [optInTier, setOptInTier] = useState("all_hourly_and_minute");
  const [optInStatus, setOptInStatus] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Check initial bootstrap status
  useEffect(() => {
    fetch('/api/bootstrap', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((data) => {
        if (data.open) {
          setIsUnlocked(true);
        }
      })
      .catch(() => {});
  }, []);

  // Expose global simulation function for Admin preview & testing
  useEffect(() => {
    window.ammuSimulateMidnightUnlock = () => {
      triggerMidnightUnlockSequence();
    };
    return () => {
      delete window.ammuSimulateMidnightUnlock;
    };
  }, []);

  const triggerMidnightUnlockSequence = () => {
    setIsUnlocked(true);
    const gate = document.getElementById("gate");
    if (gate) {
      gate.hidden = false;
      gate.style.opacity = "1";
    }
    const gateCopy = document.querySelector(".gate-copy");
    if (gateCopy) {
      gateCopy.classList.add("unlocked-stage");
    }
    const openBtn = document.getElementById("open-present");
    if (openBtn) {
      openBtn.hidden = false;
      openBtn.style.display = "inline-flex";
    }
    // Web Audio chime removed per V17 specifications (zero UI sound effects)
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!optInEmail || !optInEmail.includes("@")) {
      setOptInStatus("Please enter a valid email address.");
      return;
    }
    setOptInStatus("Saving preferences...");
    try {
      const res = await fetch("/api/countdown/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: optInEmail, tier: optInTier }),
      });
      const data = await res.json();
      if (res.ok) {
        setOptInStatus("Subscribed! Countdown love letters will float your way 💗");
      } else {
        setOptInStatus(data.error || "Could not save preferences.");
      }
    } catch {
      setOptInStatus("Connection error. Please try again.");
    }
  };

  const handleEnterUniverse = () => {
    if (window.ammuUnlock) {
      window.ammuUnlock();
      return;
    }
    const gate = document.getElementById("gate");
    if (gate) {
      gate.style.transition = "opacity 0.8s ease, transform 0.8s ease";
      gate.style.opacity = "0";
      gate.style.transform = "scale(1.05)";
      setTimeout(() => {
        gate.hidden = true;
        const exp = document.getElementById("experience");
        if (exp) {
          exp.hidden = false;
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      }, 800);
    }
  };

  const isGateHidden = isPreview || (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin/preview'));

  return (
    <section id={"gate"} hidden={isGateHidden} className={`gate ${isUnlocked ? "is-unlocked" : ""}`} aria-label={"Birthday entrance"}>
      <div className={"gate-stars"}></div>

      {/* VELVET CURTAINS & GOLDEN GLOW FOR MIDNIGHT UNLOCK */}
      <div className={`gate-curtains ${isUnlocked ? "curtains-parted" : ""}`} aria-hidden="true" />
      <div className={`gate-golden-spotlight ${isUnlocked ? "spotlight-active" : ""}`} aria-hidden="true" />

      <div className={"gate-copy"}>
        <span className={"eyebrow light"}>{"A PRIVATE LITTLE UNIVERSE • FROM ASHU"}</span>
        <span className={"glow-moon"}>{"✦ ♡ ✦"}</span>

        {isUnlocked ? (
          <div className="gate-unlocked-banner" style={{ animation: "ammuFadeIn 0.8s ease-out" }}>
            <span style={{ fontSize: "52px", display: "block", marginBottom: "8px" }}>🎂✨</span>
            <h1 style={{ color: "#FFF", fontSize: "38px" }}>
              {"HAPPIEST BIRTHDAYYYYY "}<br /><em>{"AMMUUUUUUUUUUUUU! 💗"}</em>
            </h1>
            <p style={{ color: "#FFE4EF", fontSize: "18px", maxWidth: "520px", margin: "14px auto 26px" }}>
              {"November 17 has officially arrived! Your complete birthday universe has awakened with every flower, memory, song, and surprise."}
            </p>
          </div>
        ) : (
          <>
            <h1>{"A special little surprise"}<br />{"is waiting for "}<em>{"Ammuuuu..."}</em></h1>
            <p>{"Just a few more sunsets until your day, Pottiiiiiiii 💗"}</p>
          </>
        )}

        {/* COUNTDOWN CLOCK */}
        <div className={"countdown"} id={"countdown"}>
          <div><b id={"days"}>{"00"}</b><small>{"DAYS"}</small></div>
          <div><b id={"hours"}>{"00"}</b><small>{"HOURS"}</small></div>
          <div><b id={"minutes"}>{"00"}</b><small>{"MINUTES"}</small></div>
          <div><b id={"seconds"}>{"00"}</b><small>{"SECONDS"}</small></div>
        </div>

        <div className={"gate-buttons"} style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            id={"open-present"}
            className={"btn btn-pink"}
            onClick={handleEnterUniverse}
            style={{
              fontSize: "17px",
              padding: "16px 38px",
              boxShadow: "0 8px 26px rgba(235, 78, 138, 0.45)",
              animation: "ammuPulseButton 1.5s infinite alternate",
              display: isUnlocked ? "inline-flex" : "none",
            }}
          >
            {"OPEN YOUR BIRTHDAY UNIVERSE 💗 "}<span>{"↗"}</span>
          </button>

          {!isUnlocked && (
            <button
              type="button"
              className={"btn btn-pink"}
              onClick={triggerMidnightUnlockSequence}
              style={{
                fontSize: "15px",
                padding: "14px 28px",
                background: "linear-gradient(135deg, #B83A6D, #7E1E46)",
                boxShadow: "0 6px 20px rgba(184, 58, 109, 0.4)",
              }}
            >
              {"Simulate Midnight Unlock ✨"}
            </button>
          )}

          {/* Private Preview Button for Ashu */}
          <button
            id={"preview-open"}
            type="button"
            className={"btn btn-outline"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderColor: "rgba(255, 200, 220, 0.4)",
              color: "#ffd5e6",
              fontSize: "14px",
              padding: "14px 26px",
              borderRadius: "30px",
              background: "rgba(255, 255, 255, 0.08)",
              backdropFilter: "blur(8px)",
              cursor: "pointer"
            }}
          >
            {"👑 Private Preview Option (Ashu)"}
          </button>
        </div>

        <p className={"tiny"} id={"gate-date"}>
          {isUnlocked ? "✨ Official Birthday Gate Is Open!" : "Unlocking automatically on 17 November at 12:00 AM IST"}
        </p>

        {/* COUNTDOWN EMAIL LETTERS OPT-IN ACCORDION */}
        {!isUnlocked && (
          <div style={{ marginTop: "28px" }}>
            <button
              type="button"
              onClick={() => setOptInOpen(!optInOpen)}
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                border: "1px solid rgba(255, 200, 220, 0.3)",
                borderRadius: "20px",
                color: "#FFDCE8",
                padding: "8px 18px",
                fontSize: "13px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>💌</span>
              <span>{optInOpen ? "Close Countdown Letters" : "Receive Ammu’s Countdown Letters"}</span>
            </button>

            {optInOpen && (
              <form
                onSubmit={handleSubscribe}
                style={{
                  background: "rgba(45, 15, 32, 0.92)",
                  border: "1px solid #EAA4BE",
                  borderRadius: "18px",
                  padding: "20px 24px",
                  maxWidth: "460px",
                  margin: "16px auto 0",
                  textAlign: "left",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                }}
              >
                <div style={{ fontSize: "14px", fontWeight: "bold", color: "#FFD3E2", marginBottom: "8px" }}>
                  Choose Your Countdown Preferences:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "#FFF", marginBottom: "14px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="tier"
                      value="daily"
                      checked={optInTier === "daily"}
                      onChange={() => setOptInTier("daily")}
                    />
                    <span>1. Daily Birthday Letters</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="tier"
                      value="major"
                      checked={optInTier === "major"}
                      onChange={() => setOptInTier("major")}
                    />
                    <span>2. Major Countdown Milestones (24h, 12h, 6h, 1h, 10m)</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="tier"
                      value="all_hourly_and_minute"
                      checked={optInTier === "all_hourly_and_minute"}
                      onChange={() => setOptInTier("all_hourly_and_minute")}
                    />
                    <span>3. Full Final Countdown (Hourly & Final 10 Minutes)</span>
                  </label>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={optInEmail}
                    onChange={(e) => setOptInEmail(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      background: "#FFF",
                      border: "1px solid #EAA4BE",
                      borderRadius: "10px",
                      padding: "8px 12px",
                      fontSize: "13px",
                      color: "#333",
                    }}
                  />
                  <button type="submit" className="btn btn-pink" style={{ padding: "8px 16px", fontSize: "13px" }}>
                    Opt In 💗
                  </button>
                </div>

                {optInStatus && (
                  <div style={{ marginTop: "10px", fontSize: "12px", color: "#FFD3E2" }}>
                    {optInStatus}
                  </div>
                )}
              </form>
            )}
          </div>
        )}

        {/* Private Preview Form */}
        <div className={"gate-preview-form"} id={"gate-preview-form"} hidden={true} style={{ marginTop: "20px", padding: "18px 24px", background: "rgba(255,255,255,0.12)", borderRadius: "18px", border: "1px solid rgba(255,200,220,0.3)", maxWidth: "480px", margin: "20px auto 0" }}>
          <p style={{ color: "#ffe7f1", fontSize: "13px", margin: "0 0 12px" }}>Enter private preview code or admin password:</p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
            <input id={"preview-code"} placeholder={"Enter preview code or password"} type={"password"} autoComplete={"off"} style={{ padding: "11px 18px", borderRadius: "25px", border: "1.5px solid #d889aa", background: "#fff", color: "#692842", outline: "none", fontSize: "14px" }} />
            <button className={"btn btn-pink"} id={"preview-submit"} type="button" style={{ padding: "11px 22px", borderRadius: "25px", fontWeight: "bold" }}>{"Unlock Preview ↗"}</button>
          </div>
          <p className={"tiny"} id={"preview-error"} style={{ color: "#ff8dae", marginTop: "10px", fontWeight: "bold" }}></p>
          <div style={{ marginTop: "12px", borderTop: "1px dashed rgba(255,200,220,0.3)", paddingTop: "10px" }}>
            <a href="/admin" style={{ color: "#ffcbe0", fontSize: "12px", textDecoration: "underline" }}>Or go to Ashu's Admin Studio (/admin) ↗</a>
          </div>
        </div>
      </div>

      <div className={"gate-art"}>
        <div className={"moon-halo"}></div>
        <div className={"ribbon-back"}>{"🎀"}</div>
        <img
          src={"/assets/photos/original_black.jpg"}
          alt={"Ammu birthday portrait"}
          className={"gate-portrait"}
          onError={e => { e.currentTarget.style.visibility = "hidden"; }}
        />
        <div className={"floating-note"}>{"for my favourite human ♡"}</div>
      </div>
      <div className={"gate-footer"}>{"a tiny world made with infinite care ✿"}</div>

      <style>{`
        @keyframes ammuPulseButton {
          0% { transform: scale(1); }
          100% { transform: scale(1.05); }
        }
      `}</style>
    </section>
  );
}
