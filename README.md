# RR Engine Operations Portal

React application for Rolls-Royce engine health monitoring and MRO operations. It covers fleet
health surveillance, engine-level condition review, signal trending, shop visit planning and
maintenance work order execution against deterministic in-memory domain data.

Originally an Angular 13 application, it was migrated to React with a strangler-fig approach:
React owned the shell and took over routes one at a time behind a dev-server proxy, and the
Angular code was removed only once every page had a verified React equivalent.

## Stack

| Item | Version |
| --- | --- |
| React | 18.3.1 |
| React Router | 6.26.2 |
| TypeScript | 5.5.4 |
| Vite | 5.4.8 |
| Vitest + React Testing Library | 2.1.2 / 16.0.1 |
| Node | 18+ |

## Getting started

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:4200`. Sign in with any email and password — authentication
is mocked and persisted in `localStorage` under `rr_portal_auth`.

## Commands

```bash
npm run dev        # dev server
npm run build      # typecheck (tsc --noEmit) + production build
npm run preview    # serve the production build
npm run lint
npm test           # vitest run
npm run test:watch
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

All routes other than `/login` are lazy loaded behind the `RequireAuth` wrapper.

## Structure

```text
src/
  main.tsx                     React root
  app/
    router.tsx                 route map: lazy pages + RequireAuth
    AppShell.tsx               shell: header, sidebar, footer, Outlet
  shared/
    data/                      fleetData (deterministic domain data), fleetService
    auth/                      authStore, useAuth
    notifications/             notificationStore
    models/                    engine and user domain types
    lib/                       format (currencyFormat, engineHours, stateClass), date,
                               store, useAsync
    components/                Header, Sidebar, Footer, LoadingSpinner, Icon, RequireAuth
  pages/                       LoginPage, DashboardPage, EngineExplorerPage,
                               HealthTrendingPage, ShopVisitPlannerPage, WorkOrdersPage,
                               ProfilePage
  styles/global.scss           design tokens and shared classes
```

Services are plain modules over a small external store (`shared/lib/store.ts`) consumed through
`useSyncExternalStore`, with artificial delays preserved from the Angular `Observable` APIs.

## Design system

Global tokens live in `src/styles/global.scss`:

- RR blue `#10069F`, dark blue `#0B0484`
- White canvas, near-black text, hairline borders, uppercase micro-labels
- Semantic operational states: act now `#C8102E`, watchlist `#D98200`, nominal `#007A53`,
  no data `#8A909C`

Never introduce dark page surfaces; status colour is reserved for engine and work order state.

## Domain data

`shared/data` holds deterministic data for eight engines across the Trent 1000, Trent XWB-84,
Trent 7000, Trent 900 and BR725 families, with EGT margin, vibration, oil consumption, module
condition, workscope catalogue, shop visit estimating and work orders.
