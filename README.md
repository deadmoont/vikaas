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

# 2. Windows: one command does everything (elevation prompt, hosts entry, dev server)
npm start
npm run stop       # whenever you want to stop it again

# macOS/Linux: no self-elevating launcher yet, so it's two steps —
sudo npm run setup-host   # one-time
sudo npm run dev          # every time (binding port 80 needs root; Ctrl+C to stop)
```

This opens the app at **http://hakarrrank.com/** (a made-up local dev hostname — not a
real, owned domain, just a name that happens to end in `.com` — see below) instead of the
default `http://localhost:5173`. Camera and fullscreen permissions still work fine, since
`hakarrrank.com` resolves to `127.0.0.1`, which browsers treat as a secure context the same
as `localhost`. Run `npm run setup-https` once (see below) to upgrade that to a real
`https://` padlock with no "Not secure" warning.

Other commands:

```bash
npm run build     # production build -> dist/
npm run preview   # locally preview the production build
```

### Local domain setup

`vite.config.js` runs the dev server on **port 80** (HTTP's default, so the browser omits
it from the address bar — `http://hakarrrank.com/` instead of `http://hakarrrank.com:5173/`)
and only answers to the `hakarrrank.com` hostname (`allowedHosts`, since Vite 5 rejects
unrecognized `Host` headers by default as a DNS-rebinding safeguard). Both require an
elevated terminal/process, since binding port 80 and editing the hosts file both need
admin/root.

- **`npm start` (Windows only)** — [`scripts/start.ps1`](scripts/start.ps1). If the current
  shell isn't already elevated, it relaunches itself as Administrator (one UAC prompt) and
  that elevated window closes itself automatically once it's done — you don't keep it open.
  It clears out any stray leftover Node process still squatting on port 80 from a previous
  run, runs `setup-host`, then starts the dev server as a **fully detached background
  process** (launched directly via `node .../vite/bin/vite.js` with a hidden window, output
  redirected to `dev-server.log`/`dev-server.err.log`, PID tracked in `.dev-server.pid` —
  none of these are committed, see `.gitignore`). Detached means exactly what it sounds
  like: it is **not** a child of the terminal that launched it, so closing that terminal (or
  any other window) does **not** stop the site — that was the whole point of switching away
  from the earlier version, which kept the server running as a foreground child of the
  elevated PowerShell window and died the moment you closed it.
- **`npm run stop`** — [`scripts/stop.ps1`](scripts/stop.ps1) reads `.dev-server.pid` and
  stops that process (self-elevates the same way `start.ps1` does, since stopping a process
  an elevated session started generally needs elevation too). Also self-heals: if port 80 is
  still held by *something* even without a matching PID file, it stops that too.
- **`npm run setup-host`** — [`scripts/setup-host.js`](scripts/setup-host.js) adds
  `127.0.0.1  hakarrrank.com` to your OS hosts file (`C:\Windows\System32\drivers\etc\hosts`
  on Windows, `/etc/hosts` on macOS/Linux). Safe to re-run — it skips the write if the
  entry's already there. Only affects your own machine.
- **"Port 80 is already in use"** — usually a leftover `vite`/`node` process from an earlier
  run that didn't get stopped via `npm run stop` (`npm start` clears this automatically on
  its next run too); otherwise it's a real conflict with IIS/Skype/another local server,
  which you'd need to stop separately (Task Manager, or `Get-NetTCPConnection -LocalPort 80`
  in an elevated PowerShell to see what's holding it).

### HTTPS (no "Not secure" warning)

Plain `http://` always shows "Not secure" in the address bar — there's no way around that
short of real TLS. `npm run setup-https` sets that up locally via
[mkcert](https://github.com/FiloSottile/mkcert): a tool that generates its own local
Certificate Authority, installs it into your OS/browser trust stores (so it's trusted the
same way a real CA is — this is the standard, widely-used way to get a genuine padlock on
`localhost`-style dev domains, not a workaround), and then issues a cert for `hakarrrank.com`
signed by that CA.

```bash
choco install mkcert -y   # one-time, from an Administrator terminal (Windows)
npm run setup-https       # generates certs/hakarrrank.com.pem + certs/hakarrrank.com-key.pem
```

Once those two files exist, `vite.config.js` picks them up automatically on the next
`npm start`/`npm run dev` — no further config changes — and switches from port 80 to port
443 (HTTPS's default, also omitted from the address bar) and from `http://` to `https://`.
Neither file is committed (see `.gitignore`): they're machine-specific, generated locally,
and only trusted because *your* machine's mkcert CA installation says so.

Want plain `localhost:5173` back instead? Just remove the `open`/`port`/`strictPort`/`host`/
`allowedHosts` overrides in `vite.config.js`'s `server` block, or comment them out — `npm
run dev` then works unprivileged again in the foreground, no `npm start`/`setup-host`/
`stop` needed (plain Ctrl+C stops it, same as any normal dev server).

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
