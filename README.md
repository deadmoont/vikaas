# Test Onboarding Flow (Frontend Demo)

A frontend-only, fully customizable clone of a HackerRank-style test onboarding flow:
**Instructions → Candidate Details → Integrity Guidelines & Permissions**.

No backend, no database, no auth — everything runs in the browser. Camera access and
fullscreen mode are wired up for real using native browser APIs.

## Features

- 3-step onboarding flow with a progress indicator, matching a real assessment-platform UX.
- **Fully customizable text** — company/test name, duration, login window, instructions,
  section table, form labels, integrity guidelines, permission copy — all from one file:
  [`src/config/testConfig.js`](src/config/testConfig.js).
- **Working webcam access** via `navigator.mediaDevices.getUserMedia` — shows a live
  preview once granted, handles denial gracefully.
- **Working fullscreen mode** via the Fullscreen API — tracks real state, including the
  user pressing `Esc` to exit.
- Best-effort multi-monitor detection (Window Management API where supported, with a
  graceful fallback message elsewhere).
- Light/dark theme toggle.
- "Start Test" is gated on camera + fullscreen actually being granted/active.

## Project structure

```
vikaas/
├── index.html               # Vite entry HTML
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx              # React root
│   ├── App.jsx                # Owns step state, camera/fullscreen hooks, page footer nav
│   ├── config/
│   │   └── testConfig.js      # <-- EDIT THIS to rebrand/retext everything
│   ├── hooks/
│   │   ├── useCamera.js       # getUserMedia wrapper
│   │   └── useFullscreen.js   # Fullscreen API wrapper
│   ├── utils/
│   │   └── validators.js      # Form validation helpers
│   ├── components/
│   │   ├── Sidebar.jsx        # Left branding panel (title, duration, footer links)
│   │   ├── StepDots.jsx       # Progress dots
│   │   ├── Modal.jsx          # Reusable modal
│   │   ├── AccordionItem.jsx  # Collapsible permission rows
│   │   └── ThemeToggle.jsx    # Light/dark switch
│   ├── pages/
│   │   ├── InstructionsPage.jsx
│   │   ├── DetailsFormPage.jsx
│   │   └── PermissionsPage.jsx
│   └── styles/
│       └── index.css          # All styling (theme tokens + components)
```

## Getting started

**Requirements:** Node.js 18+ (20+ recommended) and npm.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

This opens the app at **http://localhost:5173**. Camera and fullscreen permissions work
fine on `localhost` without HTTPS (browsers treat localhost as a secure context).

Other commands:

```bash
npm run build     # production build -> dist/
npm run preview   # locally preview the production build
```

## Customizing the test

Open [`src/config/testConfig.js`](src/config/testConfig.js) and edit the fields — for
example:

```js
testTitle: "Different - IIIT A - 6M - Campus Hiring'26",
durationMinutes: 90,
loginWindow: { start: "5 Aug 2026, 7:00 PM", end: "5 Aug 2026, 7:30 PM", timezone: "IST(+05:30)" },
sections: [{ name: "Problem Solving (Basic)", questions: 1 }, ...],
```

No component code needs to change — every page reads from this file.

## Notes / limitations

- This is an onboarding-flow demo only — clicking **Start Test** shows a completion
  message instead of launching a real coding environment (no backend exists to serve
  questions, run code, or store submissions).
- Multi-monitor detection relies on browser APIs that aren't universally supported; when
  unavailable it shows an honest "can't verify" message rather than blocking the user.
- "Sample Test" on the Instructions page is a placeholder (shows a small note) since there's
  no backend content to load.
