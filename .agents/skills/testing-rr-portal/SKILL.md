---
name: testing-rr-portal
description: Browser and component testing of the RR Engine Operations Portal (React 18 + Vite) with mocked authentication and deterministic in-memory data.
---

# Testing the RR Engine Operations Portal

React 18 and Vite SPA with mocked auth and deterministic in-memory data. There
is no backend or network call. Vitest and React Testing Library cover stores,
services, routes and page behavior.

## Boot the app

```bash
source ~/.nvm/nvm.sh && nvm use 22
cd /path/to/rr-legacy-angular
npm install
npm start
```

The Vite development server runs at `http://localhost:4200`. Wait for the
server to be available before driving the browser.

## Automated checks

```bash
npm run lint
npm run build
npm test
```

Vitest runs in jsdom through `src/test/setup.ts`. Prefer fake timers or awaited
React Testing Library assertions over real waits for service delays.

## Signing in

Authentication is provided by `src/shared/auth/authStore.ts`:

- Any email and non-empty password are accepted after a 1.2 second mocked
  delay.
- Submitting with either field empty shows
  `Enter your Rolls-Royce email and password`.
- The session is persisted in `localStorage` under `rr_portal_auth`.
- `RequireAuth` redirects unauthenticated routes to `/login`.

For browser checks, sign in through the form when recording behavior. To force
a logged-out state, use the header user menu → Sign out or clear the storage
key.

## Coverage expectations

Tests should cover:

- auth store login/logout and localStorage persistence;
- root and wildcard route redirects and protected routes;
- deterministic fleet service data and trend generation;
- shop-visit estimate cost, turnaround and restored-margin calculations;
- date and numeric format helpers;
- work-order required fields, title/findings minimum lengths and email format;
- successful work-order prepending and notification push;
- at least one smoke render for every route-level page.

Health trending uses a hand-rolled inline SVG chart. Verify signal or engine
changes by asserting the polyline `points` attribute or comparing screenshots;
do not replace it with a chart library.

## Browser route checks

After authenticating, smoke-check:

```text
/dashboard
/engine-explorer
/health-trending
/shop-visit-planner
/work-orders
/profile
```

Wait for each page's specific loading caption to resolve before asserting
service-backed content. For work orders, verify that a successful submission
appears first in the list and creates a notification in the header bell.

## Responsive checks

SCSS breakpoints are at 900px (shell/sidebar), 1100px and 1200px (page grids).
There is no 768px breakpoint. If a window manager is unavailable, use browser
mobile emulation and check horizontal overflow numerically:

```js
JSON.stringify({vw: innerWidth, docScroll: document.documentElement.scrollWidth})
```

Equal values indicate no horizontal overflow.

## Expected console output

The React app should produce zero application errors or warnings. Vite's
connection message and React DevTools informational message are expected during
development.

## Devin Secrets Needed

None — auth is mocked and all data is local.
