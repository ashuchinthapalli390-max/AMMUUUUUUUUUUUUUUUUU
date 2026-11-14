import React, { useEffect, useState } from "react";
import CursorGarden from "./CursorGarden.jsx";
import BirthdayFrontdoor from "./BirthdayFrontdoor.jsx";
import MotionSceneFX from "./MotionSceneFX.jsx";
import SectionChapterUi from "./screens/SectionChapterUi.jsx";
import SectionSceneTransition from "./screens/SectionSceneTransition.jsx";
import SectionOther2 from "./screens/SectionOther2.jsx";
import SectionPreviewRibbon from "./screens/SectionPreviewRibbon.jsx";
import SectionHome from "./screens/SectionHome.jsx";
import SectionJourney from "./screens/SectionJourney.jsx";
import SectionMemories from "./screens/SectionMemories.jsx";
import SectionMagazine from "./screens/SectionMagazine.jsx";
import SectionBestieId from "./screens/SectionBestieId.jsx";
import SectionLetters from "./screens/SectionLetters.jsx";
import SectionWishes from "./screens/SectionWishes.jsx";
import SectionPlaylist from "./screens/SectionPlaylist.jsx";
import SectionCake from "./screens/SectionCake.jsx";
import SectionGifts from "./screens/SectionGifts.jsx";
import SectionPranks from "./screens/SectionPranks.jsx";
import SectionMemberships from "./screens/SectionMemberships.jsx";
import SectionMovies from "./screens/SectionMovies.jsx";
import SectionMidnight from "./screens/SectionMidnight.jsx";
import SectionGames from "./screens/SectionGames.jsx";
import SectionLittleThings from "./screens/SectionLittleThings.jsx";
import SectionCertificates from "./screens/SectionCertificates.jsx";
import SectionFinale from "./screens/SectionFinale.jsx";
import SectionOther24 from "./screens/SectionOther24.jsx";
import PetalLayer from "./screens/PetalLayer.jsx";
import ToasterView from "./screens/ToasterView.jsx";
import GateView from "./screens/GateView.jsx";
import IntroView from "./screens/IntroView.jsx";
import ModalView from "./screens/ModalView.jsx";
import LightboxView from "./screens/LightboxView.jsx";
import AdminToast from "./screens/AdminToast.jsx";
import AdminLogin from "./screens/AdminLogin.jsx";
import AdminDashboard from "./screens/AdminDashboard.jsx";
import AdminEditor from "./screens/AdminEditor.jsx";

// V16 New Components
import CelebrationOverlay from "./components/CelebrationOverlay.jsx";
import FlyingLoveLetters from "./components/FlyingLoveLetters.jsx";
import HiddenCompliments from "./components/HiddenCompliments.jsx";
import AdminPreviewToolbar from "./components/AdminPreviewToolbar.jsx";

const dynamicImport = (path) => new Function('p', 'return import(p)')(path);
let guestBooted = false;
let adminBooted = false;

function GuestBootstrap() {
  useEffect(() => {
    if (guestBooted) return;
    guestBooted = true;
    (async () => {
      try {
        await dynamicImport('/js/app.js');
        await dynamicImport('/js/experience.js');
      } catch (error) {
        console.error('Birthday interactive layer failed', error);
        const el = document.getElementById('toast');
        if (el) {
          el.textContent = 'Could not start an interactive feature. Reload to try again.';
          el.classList.add('show');
        }
      }
    })();
  }, []);
  return null;
}

function AdminBootstrap() {
  useEffect(() => {
    if (adminBooted) return;
    adminBooted = true;
    dynamicImport('/js/admin.js').catch((error) => console.error('Admin editor failed', error));
  }, []);
  return null;
}

export function BirthdayWebsite({ isPreview = false }) {
  const [celebrationOpen, setCelebrationOpen] = useState(false);

  useEffect(() => {
    window.ammuOpenCelebration = () => setCelebrationOpen(true);
    window.ammuCloseCelebration = () => setCelebrationOpen(false);
    return () => {
      delete window.ammuOpenCelebration;
      delete window.ammuCloseCelebration;
    };
  }, []);

  // When opening in admin preview mode, verify admin authentication and prepare the experience immediately
  useEffect(() => {
    if (isPreview) {
      fetch('/api/admin/session', { credentials: 'same-origin' })
        .then((r) => r.json())
        .then((data) => {
          if (!data.authenticated) {
            window.location.href = '/admin?unauthorized=1';
            return;
          }
          // Reveal experience and bypass lock views
          const exp = document.getElementById('experience');
          if (exp) exp.hidden = false;
          const gate = document.getElementById('gate');
          if (gate) gate.hidden = true;
          const intro = document.getElementById('intro-stage');
          if (intro) intro.hidden = true;
          const ribbon = document.getElementById('preview-ribbon');
          if (ribbon) ribbon.hidden = false;
        })
        .catch(() => {
          window.location.href = '/admin?unauthorized=1';
        });
    }
  }, [isPreview]);

  return (
    <>
      <BirthdayFrontdoor skip={isPreview} />
      <PetalLayer />
      <ToasterView />
      <GateView isPreview={isPreview} />
      <IntroView />
      <div id="experience" hidden={!isPreview ? true : false}>
        <SectionChapterUi />
        <SectionSceneTransition />
        <SectionOther2 />
        <SectionPreviewRibbon />
        <SectionHome />
        <SectionJourney />
        <SectionMemories />
        <SectionMagazine />
        <SectionBestieId />
        <SectionLetters />
        <SectionPlaylist />
        <SectionWishes />
        <SectionCake />
        <SectionGifts />
        <SectionPranks />
        <SectionMemberships />
        <SectionMovies />
        <SectionMidnight />
        <SectionGames />
        <SectionLittleThings />
        <SectionCertificates />
        <SectionFinale />
        <SectionOther24 />
      </div>
      <ModalView />
      <LightboxView />
      <CursorGarden />
      <MotionSceneFX />

      {/* V16 Interactivity: Flying Letters & Hidden Compliments */}
      <FlyingLoveLetters />
      <HiddenCompliments />

      {/* Fullscreen 3D Celebration Modal */}
      <CelebrationOverlay
        isOpen={celebrationOpen}
        onClose={() => setCelebrationOpen(false)}
        onCompleted={() => {}}
      />

      {/* Private Admin Preview Toolbar (Visible only when authenticated as Ashu) */}
      <AdminPreviewToolbar isPreview={isPreview} />

      <GuestBootstrap />
    </>
  );
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
