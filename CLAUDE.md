# CLAUDE.md

Guidance for Claude Code (or any agent) working in this repository.

## What this is

A **frontend-only** clone of a HackerRank-style test onboarding flow: **Instructions →
Candidate Details → Integrity Guidelines & Permissions**. No backend, no database, no
auth — everything runs client-side. Built with React + Vite.

It stops after the "Start Test" button — that click just shows a completion modal. There
is no real coding-test environment (no questions, no code editor, no submission) since
this is a UI/UX demo, not a testing platform.

Every piece of copy (test title, duration, instructions, section list, form labels,
integrity guidelines, permission text) is centralized in one config file — never hardcode
test-specific text into a component; add it to the config and reference it instead.

## Stack

- React 18 + Vite 5, plain CSS (no Tailwind/CSS-in-JS/component library).
- No TypeScript — plain `.jsx`.
- No routing library — the 3 steps are just `stepIndex` state in `App.jsx`, not URL routes.

## Commands

```bash
npm install     # first-time setup
npm run dev     # dev server at http://localhost:5173
npm run build   # production build -> dist/
npm run preview # preview the production build
```

Camera and Fullscreen APIs both work on `localhost` without HTTPS (browsers treat
localhost as a secure context).

## Project structure

```
src/
├── main.jsx                 # React root
├── App.jsx                  # Step state, camera/fullscreen hooks, page-level footer nav
├── config/testConfig.js     # ALL customizable copy — edit here, not in components
├── hooks/
│   ├── useCamera.js         # getUserMedia wrapper (status: idle/requesting/granted/denied/unsupported)
│   └── useFullscreen.js     # Fullscreen API wrapper, tracks real state incl. Esc-to-exit
├── utils/validators.js      # Form validation helpers (isDetailsFormValid)
├── components/
│   ├── Sidebar.jsx          # Left branding panel: title (top), duration+footer (bottom)
│   ├── StepDots.jsx         # Progress dots (rendered in App's page-level footer)
│   ├── Modal.jsx            # Reusable modal (title/body/footer)
│   ├── AccordionItem.jsx    # Collapsible rows used on the Permissions page
│   └── ThemeToggle.jsx      # Light/dark switch (top-right)
├── pages/
│   ├── InstructionsPage.jsx # Content only — no nav buttons (see App.jsx footer)
│   ├── DetailsFormPage.jsx  # Content only — no nav buttons
│   └── PermissionsPage.jsx  # Content only; receives `camera`/`fullscreen` hook instances as props
└── styles/index.css         # All styling: design tokens + every component's CSS
```

### Key architectural decisions

- **Nav buttons live in `App.jsx`, not in the page components.** Back/Continue/Start Test
  and the step dots render in a `.content-footer` *below* the card (`.panel`), outside its
  border — matching the reference design where the card scrolls independently and the
  footer nav floats on the page background. Pages only render their content; `App.jsx`
  computes button labels/disabled-state per step.
- **`useCamera` and `useFullscreen` are instantiated in `App.jsx`**, not inside
  `PermissionsPage`, because the footer's "Start Test" button (owned by `App`) needs to
  read `camera.status` and `fullscreen.isFullscreen` to decide whether it's enabled. They're
  passed down to `PermissionsPage` as props.
- **Monitor-count check does not block "Start Test".** Multi-monitor detection relies on
  the Window Management API, which isn't universally supported; when unsupported it shows
  an honest "can't verify" message instead of pretending to enforce something it can't.
  Only camera-granted + fullscreen-active gate the Start Test button.

## Design system

All colors/borders/text styles/fonts are CSS custom properties defined once at `:root` in
`src/styles/index.css` — **never hardcode a hex value in a component rule; reference the
token instead.** The dark palette lives at `:root` (it's the app's canonical/default look);
`.app--light` overrides every token with a light equivalent so the theme toggle keeps
working without touching component CSS.

```css
:root {
  /* backgrounds */
  --bg-base: #121418;
  --bg-glow-teal: #14302F;
  --bg-glow-navy: #111A2A;
  --card-grad-top: #363D45;
  --card-grad-mid: #262B2E;
  --card-grad-bottom: #1C1F24;
  --surface-1: #1A1A1A;   /* callout box, section-details bar, sample-test button, accordion items */
  --surface-2: #1E2024;   /* duration box */
  --surface-table: #0D0D0D;

  /* borders */
  --border-subtle: rgba(255,255,255,0.06);
  --border-callout: #2C2D2E;
  --border-btn-outline: #666666;
  --border-table-row: #232323;

  /* text */
  --text-heading: #FAFAFA;
  --text-body: #B3B3B3;
  --text-label: #979797;
  --text-row: #F0F0F0;
  --text-link: #879DFF;
  --text-footer-link: #6687FF;
  --text-muted: #6E6E6E;   /* extension: dimmer inline notes, not in the original spec */

  /* accents */
  --accent-green: #20D761;
  --text-on-green: #0D0D0D;
  --danger: #FF6B6B;       /* extension: error/required-field text */
  --success: var(--accent-green);

  --font-family: 'Inter', -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}
```

`--danger`, `--success`, `--text-muted`, `--overlay`, `--shadow`, and the `.app--light`
block are extensions added to cover elements/states the original spec didn't enumerate
(error text, modal overlays, light theme) — kept in the same naming convention.

Page background is **not a flat color** — a dark base plus two soft radial glows (teal
top-left, navy top-right), applied on `body`:

```css
background-image:
  radial-gradient(ellipse 900px 700px at 0% 0%, var(--bg-glow-teal) 0%, transparent 60%),
  radial-gradient(ellipse 1000px 800px at 100% 0%, var(--bg-glow-navy) 0%, transparent 55%);
```

Typography sizes/weights used per element (dark values shown; same rule applies in light
theme via the swapped tokens):

| Element | Size | Weight | Color token |
|---|---|---|---|
| Page/sidebar title | 44px | 700 | `--text-heading` |
| Primary section heading ("Instructions", "Please enter your details", "Integrity Guidelines") — class `.panel-heading` | 28px | 700 | `--text-heading` |
| Secondary heading ("Test Format", "Permissions") — class `.panel-subheading` | 24px | 700 | `--text-heading` |
| Body / instructions list / muted text | 15–15.5px | 400 | `--text-body` |
| Table header row | 13px, uppercase | 600 | `--text-label` |
| Table row text | 15px | 400 | `--text-row` |
| Buttons | 16px | 700 | varies (`--text-on-green` on primary) |

Progress dots are neutral grays (`#CCCCCC` active / `#4D4D4D` inactive), **not** the accent
green — green is reserved for primary CTAs (Continue/Start Test/Grant Access/etc.) and the
small brand-mark square next to the footer wordmark.

When adding a new element, first check whether an existing token/class fits (`.panel-heading`
vs `.panel-subheading`, `.muted-text`, `.btn-primary`/`.btn-outline`/`.btn-secondary`,
`.surface-1`-style cards like `.sample-card`/`.checkbox-card`/`.accordion-item`) before
introducing a new one.

## Customizing the test content

Edit `src/config/testConfig.js` only — test title, duration, login window, instructions,
section table, work-experience options, integrity/ToS copy, integrity guidelines list,
permission descriptions, and all button labels live there. No component should need to
change for a rebrand/retext.
