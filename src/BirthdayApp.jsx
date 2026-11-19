import React, { useCallback, useEffect, useState } from "react";
import BirthdayFrontdoor from "./BirthdayFrontdoor.jsx";
import StoryApp from "./story/StoryApp.jsx";
import RibbonUnlock from "./story/RibbonUnlock.jsx";
import BunnyCursor from "./story/BunnyCursor.jsx";
import CelebrationOverlay from "./components/CelebrationOverlay.jsx";
import FlyingLoveLetters from "./components/FlyingLoveLetters.jsx";
import HiddenCompliments from "./components/HiddenCompliments.jsx";
import AdminToast from "./screens/AdminToast.jsx";
import AdminLogin from "./screens/AdminLogin.jsx";
import AdminDashboard from "./screens/AdminDashboard.jsx";
import AdminEditor from "./screens/AdminEditor.jsx";

const dynamicImport = (path) => new Function("p", "return import(p)")(path);

/**
 * Guest flow:
 *  door   → calendar, check-in and countdown (server-locked until 17 Nov)
 *  ribbon → cinematic ribbon-untie unlock; the story mounts underneath
 *  story  → the scroll-driven birthday universe
 */
export function BirthdayWebsite() {
  const [stage, setStage] = useState("door");
  const [doorGone, setDoorGone] = useState(false);
  const [data, setData] = useState(null);
  const [celebrationOpen, setCelebrationOpen] = useState(false);

  useEffect(() => {
    window.ammuOpenCelebration = () => setCelebrationOpen(true);
    window.ammuCloseCelebration = () => setCelebrationOpen(false);
    return () => {
      delete window.ammuOpenCelebration;
      delete window.ammuCloseCelebration;
    };
  }, []);

  const onUnlocked = useCallback((bootstrap) => {
    setData(bootstrap);
    setStage("ribbon");
  }, []);
  const onReveal = useCallback(() => {
    setDoorGone(true);
    window.__ammuStoryRevealed = true;
    window.dispatchEvent(new Event("story:revealed"));
  }, []);
  const onDone = useCallback(() => setStage("story"), []);

  const storyOpen = stage !== "door";

  return (
    <>
      {!doorGone && <BirthdayFrontdoor onUnlocked={onUnlocked} />}
      <StoryApp open={storyOpen} initialData={data} />
      {stage === "ribbon" && <RibbonUnlock onReveal={onReveal} onDone={onDone} />}

      {storyOpen && <FlyingLoveLetters />}
      {storyOpen && <HiddenCompliments />}
      <CelebrationOverlay isOpen={celebrationOpen} onClose={() => setCelebrationOpen(false)} onCompleted={() => {}} />
      <BunnyCursor />
    </>
  );
}

let adminBooted = false;
function AdminBootstrap() {
  useEffect(() => {
    if (adminBooted) return;
    adminBooted = true;
    dynamicImport("/js/admin.js").catch((error) => console.error("Admin editor failed", error));
  }, []);
  return null;
}

export function AdminWebsite() {
  return (
    <>
      <AdminToast />
      <AdminLogin />
      <AdminDashboard />
      <AdminEditor />
      <AdminBootstrap />
    </>
  );
}
