# RR Engine Operations Portal — agent guide

React 18 application for Rolls-Royce engine health and MRO operations, built with Vite and
TypeScript. It was migrated from Angular 13; no Angular code remains.

## Setup

```bash
npm install
```

Node 18 or newer.

## Checks to run before opening a PR

```bash
npm run lint
npm run build   # tsc --noEmit + vite build
npm test        # vitest run
```

## Conventions

- One page component per file under `src/pages/<Page>.tsx` with a sibling `<page>.scss`.
- Register the page in `src/app/router.tsx` as a lazy route, wrapped in `RequireAuth` unless it
  is `/login`.
- Shared data modules, models, formatters and layout components live under `src/shared/`.
- Data/auth/notification modules expose `Promise` APIs over a small external store
  (`shared/lib/store.ts`) consumed with `useSyncExternalStore`; domain data is deterministic and
  in memory — do not add network calls.
- Icons use the `Icon` component (Material Icons font); layout and data presentation use the
  global classes in `src/styles/global.scss`.
- Use the design tokens (`--rr-*`) rather than literal colours, and the shared `.panel`,
  `.page-header`, `.micro-label`, `.status-pill`, `.rr-table` and `.numeric` classes.
- White canvas only. Semantic colour is reserved for engine state and work order priority.
- TypeScript is strict. No `any`.
- Tests are Vitest + React Testing Library, colocated as `*.test.ts(x)`.
