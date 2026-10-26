import React from 'react';
import MagicalCursor from './components/cursor/MagicalCursor';

// Ultra Cute Magical Cursor System Root
// Integrates complete Canvas/WebGL particle engine, butterflies, hearts, stars, flowers, fairy dust, bows,
// spring-lagged focal pointer, ambient butterflies, and Disney-like sound chimes.
export default function CursorGarden() {
  return (
    <>
      <div id="react-cursor-garden" aria-hidden="true" style={{ display: 'none' }} />
      <MagicalCursor />
    </>
  );
}
