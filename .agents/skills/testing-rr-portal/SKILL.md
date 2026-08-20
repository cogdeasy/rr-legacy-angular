---
name: testing-rr-portal
description: Browser-level testing of the RR Engine Operations Portal (Angular 13) — how to boot the app, sign in past the mocked auth, reset in-memory state, and exercise each page's deterministic data.
---

# Testing the RR Engine Operations Portal

Angular 13.3.11 SPA with mocked auth and deterministic in-memory data. No backend, no
network calls — every number on screen is derived from `src/app/shared/services/fleet.service.ts`.

## Boot the app

```bash
source ~/.nvm/nvm.sh && nvm use 16   # Angular 13 will not run on modern Node LTS
cd /path/to/rr-legacy-angular
npm start                            # http://localhost:4200
```

First compile takes ~30-60s. Wait for `Compiled successfully` before driving the browser.

## Signing in

Auth is mocked in `src/app/shared/services/auth.service.ts`:

- **Any** email + **any** non-empty password is accepted after a ~1.2s artificial delay.
- Submitting with either field empty shows `Enter your Rolls-Royce email and password`.
- The session is persisted to `localStorage` under key `rr_portal_auth`.

To skip the login page in a fresh browser, seed that key directly, or just log in through the
UI (preferred when recording, since it is one form).

To force a logged-out state, clear the key or use the header user menu → Sign out. `AuthGuard`
on every route bounces unauthenticated direct navigation back to `/login`.

## Resetting state between runs

All mutations (new work orders, profile edits, notification badge) live in `BehaviorSubject`s
in memory only. A **full page reload wipes them** — reload rather than trying to undo edits.
Note this also means a profile edit (e.g. renaming the user) will keep showing in the header
and in the dashboard greeting until you reload.

## Per-page notes

- **Every route shows a spinner first** (`Loading fleet health…`, `Loading engine register…`,
  etc.) because services use `of(...).pipe(delay(...))`. Always re-read the DOM after a
  navigation; asserting immediately will catch the spinner, not the content.
- **Health trending**: the chart is a hand-rolled inline `<svg>` polyline, not a chart library.
  To prove it re-renders per signal/engine, compare the `points` attribute of the polyline (or
  screenshot the chart) before and after switching — a visual glance is not enough.
- **Shop visit planner**: cost/turnaround/restored-margin are pure functions of the selected
  workscope items × facility multiplier. Compute expected values from
  `fleet.service.ts` rather than trusting the UI. The projection line should equal
  the engine's current margin + restored margin.
- **Work orders**: the "Raise work order" form validates required fields, a min length on
  title/findings, and email format. Newly created orders are prepended to the list and push a
  header bell notification.

## Browser automation gotchas

- Typing into an already-populated input **appends**. Always `Control+a` then `Delete` before
  typing a replacement value, or your assertions will read concatenated junk.
- The date input accepts `MM/DD/YYYY` keystrokes and stores `YYYY-MM-DD`.

## Responsive testing

SCSS breakpoints are at **900px** (app shell / sidebar becomes an overlay drawer), **1100px**
and **1200px** (page grids collapse to one column). There is no 768px breakpoint, so testing at
768 and at ~440 exercises the same rules.

If `wmctrl` reports `Cannot get client list properties`, there is no reachable window manager
and you cannot resize the Chrome window; use the browser tool's mobile-emulation toggle instead
(it emulates roughly 390-450px wide). Verify overflow numerically rather than by eye:

```js
JSON.stringify({vw: innerWidth, docScroll: document.documentElement.scrollWidth})
```

Equal values mean no horizontal overflow. Screenshots taken under mobile emulation have a black
band on the right where the emulated viewport is narrower than the capture canvas — that is an
artifact, not a layout bug.

## Expected console output

A clean run logs exactly two messages and **zero** errors or warnings:

1. `Angular is running in development mode.`
2. `[webpack-dev-server] Live Reloading enabled.`

Anything else is a regression.

## Devin Secrets Needed

None — auth is mocked and all data is local.
