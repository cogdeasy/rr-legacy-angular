# RR Engine Operations Portal

Angular application for Rolls-Royce engine health monitoring and MRO operations. It covers fleet
health surveillance, engine-level condition review, signal trending, shop visit planning and
maintenance work order execution against deterministic in-memory domain data.

## Stack

| Item | Version |
| --- | --- |
| Angular | 13.3.11 |
| Angular Material | 13.3.9 |
| TypeScript | 4.6.2 |
| RxJS | 7.5 |
| Node | 16.x |

## Getting started

```bash
nvm use 16
npm install
npm start
```

The dev server runs at `http://localhost:4200`. Sign in with any email and password — authentication
is mocked and persisted in `localStorage` under `rr_portal_auth`.

## Commands

```bash
npm start        # dev server
npm run build    # development build
npm run build:prod
npm run lint
npm test         # ng test (Karma + Jasmine)
```

Headless test run:

```bash
CHROME_BIN=$(which google-chrome) npx ng test --watch=false --browsers=ChromeHeadlessNoSandbox
```

## Routes

| Route | Purpose |
| --- | --- |
| `/login` | Mocked sign-in |
| `/dashboard` | Fleet health summary, alerts, EGT margin ranking |
| `/engine-explorer` | Filterable engine list with module condition detail |
| `/health-trending` | Twelve month EGT margin, vibration and oil consumption trends |
| `/shop-visit-planner` | Workscope builder with cost, turnaround and margin recovery estimate |
| `/work-orders` | Work order tracking and raising |
| `/profile` | Account details and alerting preferences |

All routes other than `/login` are lazy loaded behind `AuthGuard`.

## Structure

```text
src/app/
  app.module.ts              root module
  app-routing.module.ts      lazy routes + AuthGuard
  app.component.*            shell: header, sidebar, footer, router outlet
  shared/
    services/                AuthService, FleetService, NotificationService
    guards/auth.guard.ts
    models/                  engine and user domain types
    pipes/                   currencyFormat, engineHours, stateClass
    components/              header, sidebar, footer, loading-spinner
  pages/                     login, dashboard, engine-explorer, health-trending,
                             shop-visit-planner, work-orders, profile
```

## Design system

Global tokens live in `src/styles.scss`:

- RR blue `#10069F`, dark blue `#0B0484`
- White canvas, near-black text, hairline borders, uppercase micro-labels
- Semantic operational states: act now `#C8102E`, watchlist `#D98200`, nominal `#007A53`,
  no data `#8A909C`

Never introduce dark page surfaces; status colour is reserved for engine and work order state.

## Domain data

`FleetService` holds deterministic data for eight engines across the Trent 1000, Trent XWB-84,
Trent 7000, Trent 900 and BR725 families, with EGT margin, vibration, oil consumption, module
condition, workscope catalogue, shop visit estimating and work orders.
