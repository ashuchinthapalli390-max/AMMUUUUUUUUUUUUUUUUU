# React v3 migration summary

- 20 birthday sections plus chrome/navigation, overlays, modal and private dashboard are rendered by named React JSX components.
- Original visual markup/DOM identifiers retained, ensuring `public/css/style.css` uses the same selectors.
- GSAP installed locally via npm for chapter animation controller.
- CursorGarden is a hook-based Framer Motion component, with a capped particle emitter and persistence.
- Original feature engines (cake, magazine, gift shop, midnight stars, admin) are loaded by React mount effects as compatibility controllers. This is an **incremental React migration**, not a wholesale rewrite of their internal state management.
- User data and assets retained. Rejected images from earlier chats were not added.
- The React client listens on :5173 and the original API on :4173 in local development; built React runs under the Node server at :4173.
- All forms/OTP remain actual API operations requiring configured email for remote delivery; this source does not falsely claim preconfigured addresses.
