The vanilla Three.js Cake Studio dynamically imports THREE from /vendor/three.module.js if present.
If absent, it loads the pinned Three.js module from jsDelivr when connected to the internet.

To bundle for offline cake functionality, with internet available once:
  npm install three@0.170.0 --no-save
  npm run vendor:three
This copies three.module.js and three.core.js into this folder.
