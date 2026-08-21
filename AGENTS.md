# RR Engine Operations Portal — agent guide

React 18 and Vite application for Rolls-Royce engine health and MRO operations.

## Setup

```bash
source ~/.nvm/nvm.sh && nvm use 22
npm install
```

## Checks

Run these checks before handing work back:

```bash
npm run lint
npm run build
npm test
```

Use the Vite server for browser checks:

```bash
npm start
```

It serves the portal at `http://localhost:4200`.

## React conventions

- Use functional components and React hooks.
- Keep route-level components in `src/pages/` with page-specific SCSS beside
  the component.
- Define routes in `src/app/router.tsx` with React Router and preserve the
  existing protected-route behavior.
- Use the `createStore`/`useStore` pattern in `src/shared/lib/store.ts` for
  shared state. Do not add RxJS or another state library.
- Keep service data deterministic and in memory. Do not add network calls.
- Keep charts as hand-rolled inline SVG. Do not add a chart library or UI kit.
- Use `--rr-*` design tokens and shared primitives instead of literal colours.
- Preserve the white canvas. Semantic colours are reserved for engine state and
  work-order priority.
- Preserve existing class names, DOM structure, strings, numbers and artificial
  delays when porting behavior.
- TypeScript is strict. Do not use `any`.

## Shared styling

Prefer the shared `.panel`, `.page-header`, `.micro-label`, `.status-pill`,
`.rr-table` and `.numeric` classes. Add a page selector to the relevant page
SCSS only when a style is not shared. Keep anchor-rendered button controls
visually equivalent to button-rendered controls without changing intentional
inline link styling.
