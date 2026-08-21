# RR Engine Operations Portal

React and Vite application for Rolls-Royce engine health monitoring and MRO
operations. It covers fleet health surveillance, engine-level condition review,
signal trending, shop visit planning and maintenance work order execution
against deterministic in-memory domain data.

## Stack

| Item | Version |
| --- | --- |
| React | 18.3.1 |
| React Router | 6.26.2 |
| Vite | 5.4.8 |
| TypeScript | 5.5.4 |
| Vitest | 2.1.3 |
| Node | 22.x |

## Getting started

```bash
source ~/.nvm/nvm.sh && nvm use 22
npm install
npm start
```

The Vite development server runs at `http://localhost:4200`. Sign in with any
email and non-empty password. Authentication is mocked and persisted in
`localStorage` under `rr_portal_auth`.

## Commands

```bash
npm start        # Vite development server on port 4200
npm run build    # strict TypeScript check and production bundle
npm run lint     # ESLint
npm test         # Vitest run
```

## Routes

| Route | Purpose |
| --- | --- |
| `/login` | Mocked sign-in |
| `/dashboard` | Fleet health summary, alerts and EGT margin ranking |
| `/engine-explorer` | Filterable engine list with module condition detail |
| `/health-trending` | Twelve month EGT margin, vibration and oil consumption trends |
| `/shop-visit-planner` | Workscope builder with cost, turnaround and margin recovery estimate |
| `/work-orders` | Work order tracking and raising |
| `/profile` | Account details and alerting preferences |

All routes other than `/login` are protected by `RequireAuth`.

## Structure

```text
src/
  app/                    app shell and React Router configuration
  pages/                  route-level functional components and page SCSS
  shared/
    auth/                 mocked authentication store and hook
    components/           header, sidebar, footer and UI primitives
    data/                 deterministic fleet data and service
    lib/                  external-store, async, date and format helpers
    models/               domain types and enums
    notifications/        notification store and hook
  styles/global.scss      design tokens and shared layout primitives
  test/                   Vitest setup and React Testing Library tests
```

## Design system

Global tokens live in `src/styles/global.scss`. Use `--rr-*` tokens rather than
literal colours, preserve the white canvas, and keep semantic colour reserved
for engine state and work-order priority. Shared classes include `.panel`,
`.page-header`, `.micro-label`, `.status-pill`, `.rr-table` and `.numeric`.

The application intentionally has no state library, chart library or UI kit.
Charts remain hand-rolled inline SVG, and services make no network calls.
