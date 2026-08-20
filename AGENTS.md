# RR Engine Operations Portal — agent guide

Angular 13.3.11 application for Rolls-Royce engine health and MRO operations.

## Setup

```bash
nvm use 16
npm install
```

Node 16 is required; the Angular 13 toolchain does not run on current Node LTS releases.

## Checks to run before opening a PR

```bash
npm run lint
npm run build
CHROME_BIN=$(which google-chrome) npx ng test --watch=false --browsers=ChromeHeadlessNoSandbox
```

## Conventions

- One feature per folder under `src/app/pages/<feature>/`, each with its own `NgModule` that
  declares the component, imports `SharedModule` and registers `RouterModule.forChild`.
- Register the feature in `app-routing.module.ts` with `loadChildren` and `AuthGuard`.
- Shared services, models, pipes and layout components live under `src/app/shared/`.
- Services expose `Observable` APIs backed by `BehaviorSubject`/`of(...).pipe(delay(...))`; domain
  data is deterministic and in memory — do not add network calls.
- Templates use Angular Material only for icons, buttons, menus, badges, tooltips and spinners;
  layout and data presentation use the global classes in `src/styles.scss`.
- Use the design tokens (`--rr-*`) rather than literal colours, and the shared `.panel`,
  `.page-header`, `.micro-label`, `.status-pill`, `.rr-table` and `.numeric` classes.
- White canvas only. Semantic colour is reserved for engine state and work order priority.
- TypeScript is strict, and strict Angular templates are enabled. No `any`.
