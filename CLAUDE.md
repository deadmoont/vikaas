# CLAUDE.md

Guidance for Claude Code (or any agent) working in this repository.

## What this is

A **frontend-only** clone of a HackerRank-style test flow: **Setup → Instructions →
Candidate Details → Integrity Guidelines & Permissions → Identity Verification → Test
Dashboard → Solve (problem + code editor)**. No backend, no database, no auth —
everything runs client-side, and the Setup page's output is **in-memory React state
only, never persisted** (no localStorage). Built with React + Vite.

The Setup page is a config generator, not test content itself: it collects company name,
test duration, date/start time (end time = start + duration, computed live), and a
dynamic list of sections (name + question count), then hands that off as the "live config"
every later page renders from. It's how this app stays "fully customizable" without
touching code for a per-run rebrand.

**Setup is deliberately one-way per page load.** Once `onComplete` fires, there is no
button or link anywhere in the onboarding flow to go back and re-edit it — the only way to
get a blank Setup page again is a real browser refresh (which remounts `App` and resets
`setupFields` to `null`). Don't add an "edit setup" affordance back in unless explicitly
asked; it was removed on purpose, not an oversight.

"Start Test" leads to a real (but still frontend-only) handoff, not straight to a
completion screen:

1. **`TestDashboardPage`** loads immediately (`testStartTime` is captured, and the stage
   becomes `"testDashboard"`, right on the Start Test click) — **`PhotoCapturePage` then
   renders as a blurred overlay on top of it** (`showPhotoCapture` state in `App.jsx`),
   not as its own preceding stage/page. This matches the reference: the dashboard (and its
   live countdown) is already visible-but-blurred behind the capture prompt, not hidden
   behind a blank page. It auto-captures a frame to a `<canvas>` after a 20s countdown (or
   on manual "Capture photo" click), shows a 3s "Looking good! / Submitting Image..."
   review screen with a Retake option, then dismisses itself (`showPhotoCapture -> false`)
   to reveal the already-loaded dashboard underneath. If you ever need this gate to block
   the dashboard from loading at all, that's a deliberate step backward from the current
   design — confirm it's actually wanted first.
2. **`TestDashboardPage`** — lists `config.sections` as a table per section (Question /
   Type / Action), with a "Solve" button per question that reads "Modify" instead once
   that question id is in `submittedQuestions` (a `Set` lifted to `App.jsx`, populated by
   `SolvePage`'s "Save & Proceed" via `onSubmitQuestion`). "Submit Test" no longer jumps
   straight to a completion modal — it opens a **"Confirm Submit Test" dialog** first (own
   local state in `TestDashboardPage`, using the shared `Modal` component); only its "Yes,
   submit my test" button calls the `onSubmit` prop, which moves `App.jsx` to the
   `"feedback"` stage.
3. **`SolvePage`** — a real problem-statement + code-editor split screen, reached via
   "Solve"/"Modify". **Only questionIds 1/2/3 (global numbering across sections) have real
   content** — `src/data/problems.jsx` hardcodes exactly 3 problems (Easy/Medium/Hard:
   Bit Profit, Global Maximum, Autocorrect Prototype), matched by that global number.
   Anything beyond question 3 falls back to `TestDashboardPage`'s inline demo note instead
   of opening `SolvePage`. `CodeEditor.jsx` has real (if lightweight) syntax coloring —
   `utils/highlightCpp.jsx` is a regex tokenizer, not a real parser, rendered as a colored
   `<pre>` stacked exactly under a transparent-text `<textarea>` (the classic
   textarea-over-highlight-overlay technique); still not a dependency like
   CodeMirror/Monaco, deliberately. "Run Code" simulates a run rather than executing
   anything: `runStatus` (`idle` → `running` → `passed`) drives a 5–7s randomized timer,
   during which every one of `TOTAL_TEST_CASES` (15) shows a loading spinner; only the
   first N (that problem's real `sampleCases.length`) are ever "unlocked" — the rest show
   a lock icon throughout, mirroring hidden judge cases. On `passed`, the results panel
   becomes a list (left) + detail (right) view — Compiler Message/Input/Output/Expected
   Output — but only for unlocked cases; selecting a locked one shows an explanatory note
   instead of fabricating input/output that was never real. The test countdown
   (`useCountdown`) is derived from a single `testStartTime` timestamp captured once in
   `App.jsx` on the Start Test click, not a per-page ticking counter, so the remaining time
   stays exactly consistent across dashboard ⇄ solve navigation (and through the photo
   capture overlay) instead of drifting or resetting.
4. **`FeedbackPage`** — the true terminal screen ("Your assessment has been submitted!" +
   a 5-star rating), reached only via the confirm dialog's "Yes, submit my test". Sits on
   the same `.setup-page` wrapper as `SetupPage`/`PhotoCapturePage` (no background
   override there, so the usual gradient glow shows through) — deliberately different from
   `TestDashboardPage`/`SolvePage`, which are flat with no glow. **No restart affordance
   here on purpose** — matches the reference, and this app's established "refresh the
   browser to start over" philosophy (see the Setup notes above). Don't add a
   restart/close button back in unless explicitly asked.

Neither `TestDashboardPage` nor `SolvePage` renders the `Sidebar` — there's no per-page
branding left to show once you're "inside" the test itself, matching the reference
platform's own dashboard (no sidebar there either). All three are top-level `stage` values
in `App.jsx` (`testDashboard` / `solve` / `feedback`), same pattern as `setup`/`onboarding`.
Photo capture is not a `stage` — see above.

Copy not covered by the Setup page (instructions text, integrity guidelines, permission
descriptions, form labels, button labels, footer links, completion message) is centralized
in `src/config/testConfig.js` — never hardcode test-specific text into a component; add it
to the config and reference it instead.

## Stack

- React 18 + Vite 5, plain CSS (no Tailwind/CSS-in-JS/component library).
- No TypeScript — plain `.jsx`.
- No routing library — Setup vs. onboarding is a `stage` state in `App.jsx`; the 3
  onboarding steps are `stepIndex` state, not URL routes.

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
├── main.jsx                        # React root
├── App.jsx                         # stage switch (setup/onboarding/testDashboard/solve), step state, camera/fullscreen hooks
├── config/testConfig.js            # Defaults (Setup page's pre-filled starting values + everything it doesn't cover)
├── hooks/
│   ├── useCamera.js                # getUserMedia wrapper; exposes the raw MediaStream, not just a ref (see below)
│   ├── useFullscreen.js            # Fullscreen API wrapper, tracks real state incl. Esc-to-exit
│   └── useCountdown.js             # Derives remaining seconds from a fixed start timestamp, not a ticking counter (see below)
├── utils/
│   ├── validators.js               # Form validation helpers (isDetailsFormValid)
│   ├── datetime.js                 # addMinutesToTime, formatDisplayDateTime — Setup page's time math
│   └── buildConfigFromSetup.js     # Raw Setup-page fields -> full testConfig-shaped object
├── components/
│   ├── Sidebar.jsx                 # Left branding panel: title (top), duration+footer (bottom)
│   ├── StepDots.jsx                # Progress dots (rendered in App's page-level footer)
│   ├── Modal.jsx                   # Reusable modal, rendered via a Portal into <body> (see below)
│   ├── AccordionItem.jsx           # Controlled collapsible row (open/onToggle props) — Permissions page
│   ├── Chevron.jsx                 # Shared rotating collapse/expand SVG icon
│   ├── Dropdown.jsx                # Custom-styled stand-in for <select> (floating panel, hover highlight)
│   ├── SectionsEditor.jsx          # Add/remove/edit {name, questions} rows (used by SetupPage)
│   ├── VideoPreview.jsx            # <video> bound to a MediaStream via its own ref+effect (see below)
│   ├── CodeEditor.jsx              # Plain-text editor: line-number gutter + <textarea> (no syntax highlighting)
│   ├── icons.jsx                   # Plain currentColor SVG icons (webcam/monitor/fullscreen + checklist illustrations)
│   └── ThemeToggle.jsx             # Light/dark switch — fixed-position by default, or inline (see .theme-toggle--inline)
├── data/
│   └── problems.jsx                # The 3 hardcoded Solve-page problems, keyed by global question number (1/2/3)
├── pages/
│   ├── SetupPage.jsx               # Runs first — company/duration/date-time/sections form
│   ├── InstructionsPage.jsx        # Content only — no nav buttons (see App.jsx footer)
│   ├── DetailsFormPage.jsx         # Content only — no nav buttons
│   ├── PermissionsPage.jsx         # Content only; receives `config`/`camera`/`fullscreen` as props
│   ├── PhotoCapturePage.jsx        # Blurred overlay on TestDashboardPage, not its own stage (see below)
│   ├── TestDashboardPage.jsx       # Sections/questions table (no sidebar)
│   └── SolvePage.jsx               # Problem statement + code editor split screen (no sidebar)
└── styles/index.css                # All styling: design tokens + every component's CSS
```

### Key architectural decisions

- **Config flows down as a prop, not a static import.** `Sidebar`, `InstructionsPage`,
  `DetailsFormPage`, and `PermissionsPage` all take `config` as a prop from `App.jsx` —
  none of them `import testConfig from ...` directly (only `App.jsx`, `SetupPage.jsx`, and
  `buildConfigFromSetup.js` touch the static file). This is what lets the Setup page's
  output actually reach every page without a second parallel data path.
- **`config = setupFields ? buildConfigFromSetup(setupFields) : defaultConfig`**, memoized
  in `App.jsx`. `buildConfigFromSetup` spreads `...defaultConfig` first, then overrides
  only `testTitle`, `durationMinutes`, `loginWindow`, and `sections` — everything else
  (instructions copy, integrity guidelines, button labels, etc.) always comes from the
  static defaults regardless of what was set up.
- **SetupPage hands back raw fields, not a derived config.** `onComplete(fields)` passes
  `{ companyName, testLabel, durationMinutes, testDate, startTime, timezoneLabel, sections }`
  — the exact shape of its own form state — rather than a pre-built testConfig object.
  `SetupPage` also accepts an `initialFields` prop to pre-fill from (used if you ever wire
  up an edit-setup path again — currently `App.jsx` always passes none, since setup is
  one-way; see above). `loginWindow` is a *display string* ("5 Aug 2026, 7:00 PM") that
  can't be round-tripped back into `<input type="date">`/`<input type="time">` values
  without lossy parsing, which is exactly why the raw fields (not the derived config) are
  the thing worth hanging onto if persistence/editing ever comes back.
- **Nav buttons live in `App.jsx`, not in the page components.** Back/Continue/Start Test
  and the step dots render in a `.content-footer` *below* the card (`.panel`), outside its
  border — matching the reference design where the card scrolls independently and the
  footer nav floats on the page background. Pages only render their content; `App.jsx`
  computes button labels/disabled-state per step. "Start Test" now captures
  `testStartTime`, sets `showPhotoCapture` true, and sets `stage` to `"testDashboard"`
  rather than opening the completion modal directly — see above.
- **`useCamera` and `useFullscreen` are instantiated in `App.jsx`**, not inside
  `PermissionsPage`, because the footer's "Start Test" button (owned by `App`) needs to
  read `camera.status` and `fullscreen.isFullscreen` to decide whether it's enabled. Also
  why `camera`/`fullscreen` are passed down as props rather than each page re-instantiating
  its own hook — `PhotoCapturePage` reuses the *same* already-granted `camera` stream from
  the Permissions step rather than re-requesting access.
- **`useCamera` exposes the raw `MediaStream` in state, not a single shared video ref.**
  The stream needs to render into more than one `<video>` at different times (the pre-check
  modal, the inline accordion preview, then `PhotoCapturePage`'s own capture view) — a ref
  can only ever point at one DOM node, so a video element that mounts *after* the stream
  arrives would never get `.srcObject` set. `VideoPreview.jsx` is the fix: it takes
  `stream` as a prop and owns its own local ref + `useEffect` that reattaches on every
  mount. Anywhere a live camera preview is needed, use `<VideoPreview stream={camera.stream} />`,
  never a raw `<video ref={camera.videoRef}>` (that prop doesn't exist anymore).
- **`Modal` renders via a React Portal into `document.body`**, not inline where it's used
  in JSX. Reason: an ancestor with a mid-flight CSS `animation` (like the step slide-in
  transition) computes a non-`none` `transform` for its duration/fill-mode, which per spec
  makes that ancestor a new *containing block* for any `position: fixed` descendant — so an
  inline-rendered modal could end up centered inside that ancestor's box instead of the
  viewport. Portaling sidesteps this category of bug entirely; don't revert to inline
  rendering even if a specific transform issue looks "fixed" some other way.
- **`AccordionItem` is a controlled component** (`open`/`onToggle` props, no internal
  `useState`). `PermissionsPage` owns a single `openIndex` state across all three
  permission rows so only one is ever open at once, and auto-advances it forward as each
  permission completes (camera granted -> open monitor row; monitor checked -> open
  fullscreen row; fullscreen active -> collapse everything). If you add a 4th
  `AccordionItem` anywhere, it needs its own `open`/`onToggle` wiring from a parent — it
  won't manage its own expand/collapse state anymore.
- **Monitor-count check does not block "Start Test".** Multi-monitor detection relies on
  the Window Management API, which isn't universally supported; when unsupported it shows
  an honest "can't verify" message instead of pretending to enforce something it can't.
  Only camera-granted + fullscreen-active gate the Start Test button.
- **Never a raw emoji glyph for an icon that needs theme-aware coloring.** Emoji (🕐, ☀️,
  ⌄) ignore CSS `color` and render in their own fixed tone regardless of the design tokens
  — this bit us three times (theme toggle, clock icon, collapse chevrons) before landing on
  the fix: plain inline SVGs with `stroke="currentColor"` (see `Chevron.jsx`, the sun/moon
  paths in `ThemeToggle.jsx`, the clock icon in `Sidebar.jsx`).
- **Instructions with inline links are data, not JSX.** `testConfig.instructions` items can
  be a plain string OR an array of segments (strings mixed with `{ text, href }` objects);
  `InstructionsPage` renders link segments as real `<a>` tags. (A prior bug: the "sample
  test"/"FAQs" text was plain strings with no anchor at all, so no amount of CSS could make
  it look like a link — fixed by changing the data shape, not the styling.)

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
  --text-link: #5B8DFF;   /* bumped from the original spec's #879DFF — read as too pale/gray on this bg */
  --text-footer-link: #6687FF;
  --text-muted: #6E6E6E;  /* extension: dimmer inline notes, not in the original spec */

  /* accents */
  --accent-green: #20D761;
  --text-on-green: #0D0D0D;
  --danger: #FF6B6B;      /* extension: error/required-field text */
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

Typography sizes/weights actually in use (dark values shown; same rules apply in light
theme via the swapped tokens). These went through several correction passes against a
reference screenshot — trust this table over any earlier commentary in this file's history:

| Element | Size | Weight | Color token |
|---|---|---|---|
| Page/sidebar title | 40px | 700 | `--text-heading` |
| Primary section heading ("Instructions", "Please enter your details", "Integrity Guidelines") — class `.panel-heading` | 22px | 700 | `--text-heading` |
| Secondary heading ("Test Format", "Permissions") — class `.panel-subheading` | 24px | 700 | `--text-heading` |
| Numbered instructions list — `.instructions-list` | 14.5px | 400 | `--text-body` |
| Muted/description text — `.muted-text` | 15px | 400 | `--text-body` |
| Sample-test callout text — `.sample-card` | 15px | 400 | `#E6E6E6` |
| "Sample Test" button — `.btn-secondary` (scoped override; other buttons stay 16px) | 14px | 700 | `--text-heading` |
| "Test duration: N minutes" — `.duration-card-row` | 14px | 600 | `#E6E6E6` |
| "Section Details" bar / accordion headers | 16px | 600 | `--text-heading` |
| Table header row | 13px, uppercase | 600 | `--text-label` |
| Table row text | 15px | 400 | `--text-row` |
| Buttons (base `.btn`) | 16px | 700 | varies (`--text-on-green` on primary) |

Progress dots are neutral grays (`#CCCCCC` active / `#4D4D4D` inactive), **not** the accent
green — green is reserved for primary CTAs (Continue/Start Test/Grant Access/etc.) and the
small brand-mark square next to the footer wordmark.

Layout notes worth knowing before touching `app-shell`/`sidebar`/`content-column` CSS:
- The card (`.content-column`) and the sidebar are independent CSS Grid items — shifting
  one's position/width should be done via `margin` on that item itself (e.g. `.sidebar {
  margin-left: -15px }`, `.content-column { margin-right: 80px }`), **not** by changing
  `app-shell`'s shared padding or the grid-column fr-ratio, which perturbs both columns at
  once in ways that are hard to reason about pixel-for-pixel.
- The theme toggle is `position: fixed`, sized independently of the grid — if the card's
  right margin changes, its `right` offset needs a matching update or it visually detaches
  from the card's corner (this has happened before).

When adding a new element, first check whether an existing token/class fits (`.panel-heading`
vs `.panel-subheading`, `.muted-text`, `.btn-primary`/`.btn-outline`/`.btn-secondary`,
`.surface-1`-style cards like `.sample-card`/`.checkbox-card`/`.accordion-item`) before
introducing a new one.

## Customizing the test

Two layers, matching the two places state comes from:

- **Per-run setup** — company name, test-label suffix, duration, date/start time, and
  sections. Done live through the Setup page UI (`src/pages/SetupPage.jsx`); lives only in
  React state for that page load, one-way (see above). No file editing needed for this.
- **Static defaults** — everything else (instructions copy, integrity guidelines,
  permission descriptions, work-experience dropdown options, button labels, footer links,
  completion message) plus the Setup page's own starting pre-fill values — edit
  `src/config/testConfig.js` directly.
