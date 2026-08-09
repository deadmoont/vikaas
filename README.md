# Test Onboarding Flow (Frontend Demo)

A frontend-only, fully customizable clone of a HackerRank-style test onboarding flow:
**Setup → Instructions → Candidate Details → Integrity Guidelines & Permissions**.

No backend, no database, no auth — everything runs in the browser, and setup is
**in-memory only** (nothing written to `localStorage`). Camera access and fullscreen mode
are wired up for real using native browser APIs.

## Features

- **A Setup page runs first, once per page load.** Before the branded test experience
  loads, you fill in the company name, test duration, date + start time (end time is
  computed automatically as start + duration), and an arbitrary number of sections (name +
  question count) via an add/remove editor. Submitting generates the live config every
  later page renders from — no code editing required to stand up a differently-branded
  test. **There is deliberately no in-app way back to Setup once you continue** — the only
  way to redo it is a real browser refresh, which resets the app back to a blank Setup page.
- 3-step onboarding flow after that with a progress indicator, matching a real
  assessment-platform UX.
- **Fully customizable text** — everything not covered by the Setup page (instructions
  copy, integrity guidelines, permission descriptions, form labels, etc.) still comes from
  one file: [`src/config/testConfig.js`](src/config/testConfig.js), which also supplies the
  *defaults* the Setup page's fields start out pre-filled with.
- **Working webcam access** via `navigator.mediaDevices.getUserMedia` — shows a live
  preview once granted, handles denial gracefully.
- **Working fullscreen mode** via the Fullscreen API — tracks real state, including the
  user pressing `Esc` to exit.
- Best-effort multi-monitor detection (Window Management API where supported, with a
  graceful fallback message elsewhere).
- Light/dark theme toggle.
- Slide-in transitions between steps (Continue → from the right, Back → from the left).
- "Start Test" is gated on camera + fullscreen actually being granted/active.

## Project structure

```
vikaas/
├── index.html               # Vite entry HTML
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx              # React root
│   ├── App.jsx                # Setup ⇄ onboarding stage switch, step state, camera/fullscreen hooks
│   ├── config/
│   │   └── testConfig.js      # <-- Defaults: what the Setup page pre-fills, and everything it doesn't cover
│   ├── hooks/
│   │   ├── useCamera.js       # getUserMedia wrapper
│   │   └── useFullscreen.js   # Fullscreen API wrapper
│   ├── utils/
│   │   ├── validators.js            # Form validation helpers
│   │   ├── datetime.js              # Time-math for the Setup page (start + duration -> end, display formatting)
│   │   └── buildConfigFromSetup.js  # Raw Setup-page fields -> full testConfig-shaped object
│   ├── components/
│   │   ├── Sidebar.jsx        # Left branding panel (title, duration, footer links)
│   │   ├── StepDots.jsx       # Progress dots
│   │   ├── Modal.jsx          # Reusable modal
│   │   ├── AccordionItem.jsx  # Collapsible permission rows
│   │   ├── Chevron.jsx        # Shared rotating collapse/expand icon
│   │   ├── Dropdown.jsx       # Custom-styled stand-in for <select>
│   │   ├── SectionsEditor.jsx # Add/remove/edit {name, questions} rows on the Setup page
│   │   └── ThemeToggle.jsx    # Light/dark switch
│   ├── pages/
│   │   ├── SetupPage.jsx      # Runs first — company/duration/date-time/sections form
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

## Using the Setup page

Every page load starts on **Set Up Your Test**: company name, an optional test-label
suffix (combined as `Company - Label` for the title), duration in minutes, a date, a start
time, and a timezone label. The end time shown in the "login window" preview is always
`start time + duration`, computed live as you type. Below that, add or remove as many
sections (name + question count) as the test needs — at least one is required.

Submitting switches into the actual onboarding flow, which renders entirely from what you
just entered — **this is one-way**. There is no button to go back and edit the setup while
staying on the same page instance; refresh the browser to get a blank Setup page again and
regenerate from scratch.

## Customizing the test

Two layers:

- **Per-run setup** (company name, duration, date/start time, sections) — use the Setup
  page above; no file editing needed. One-way per page load, as noted above.
- **Everything else** (instructions copy, integrity guidelines, permission descriptions,
  work-experience dropdown options, button labels, footer links, completion message) —
  edit [`src/config/testConfig.js`](src/config/testConfig.js) directly. Its `testTitle`,
  `durationMinutes`, `loginWindow`, and `sections` fields also double as the Setup page's
  starting defaults.

## Notes / limitations

- This is an onboarding-flow demo only — clicking **Start Test** shows a completion
  message instead of launching a real coding environment (no backend exists to serve
  questions, run code, or store submissions).
- Setup is in-memory React state, not persisted anywhere — refreshing the browser (or
  losing the tab) always starts fresh from a blank Setup page. This is intentional: setup
  is meant to be a one-time, one-way step per session, not something reopened mid-flow.
- Multi-monitor detection relies on browser APIs that aren't universally supported; when
  unavailable it shows an honest "can't verify" message rather than blocking the user.
- "Sample Test" on the Instructions page is a placeholder (shows a small note) since there's
  no backend content to load.
- The computed end time doesn't roll over to the next calendar day if duration pushes it
  past midnight — fine for typical test lengths, a known simplification otherwise.
