# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

React 19 SPA ("Plataforma de Gestión de Deudas" — personal debt/expense tracker), built with Vite (using the Rolldown-based `rolldown-vite` package aliased as `vite`), JavaScript/JSX (no TypeScript), Tailwind CSS 4, react-router-dom 7, zustand for state, axios for HTTP, Firebase for Google auth, Pusher for realtime.

It is one of two frontend clients on a shared backend: the sibling repo `d:\proyectos_node\api-plataformas-desarrollo` (Node/Express API). The other client is the Flutter app `d:\proyectos_flutter\app_expense_manager`. Backend contract changes (routes, error codes, response shapes) affect both clients.

The README.md is outdated — it describes an older, purely local/localStorage-only version of the app and doesn't mention the real backend, `compartidos` (shared expenses), or the "hacer cuentas" settlement mode. Don't trust it for current architecture.

## Documentation and guides

- `docs/` — functional documentation for the **whole system** (web + Flutter app + API): `requerimientos-funcionales.md`, `requerimientos-no-funcionales.md`, `casos-de-uso.md` and the use-case diagrams in `docs/diagramas/`. It lives in this repo but covers all three projects.
- `.claude/guides/` — development guides: `arquitectura-web.md`, `arquitectura-flutter.md`, `arquitectura-api.md` and `documentacion.md`. Read the guide for the project you are about to change before writing code.

## Documentation update rule

**Every change made in any of the three projects** (this web app, the Flutter app, the API) **must update, in the same change, whatever it leaves stale** in:

1. `docs/` in this repo — requirements, use cases and diagrams.
2. `.claude/guides/` in this repo — the architecture guide of the affected project.
3. The `CLAUDE.md` of the affected repo(s), if a command, folder, layer or convention changed.

This applies even when the code change is entirely in the Flutter or API repo: the docs and guides to update are still the ones here (`c:\Users\gonza\Desktop\web-plataformas-de-desarrollo\docs` and `\.claude\guides`).

`.claude/guides/documentacion.md` has the table of what to update for each kind of change — follow it. Purely visual changes and internal refactors that alter no layer or convention need no update. Document what the code actually does: a rule the API does not enforce is recorded as a known limitation, not as fulfilled.

At the end of every task, state which documentation files were updated, or say explicitly that none needed updating and why.

## Feature parity rule

Any functional/business-logic change made here (new feature, changed behavior, new field, new validation, new endpoint usage) **must also be implemented in the Flutter app** (`d:\proyectos_flutter\app_expense_manager`), and vice versa. The two clients are meant to mirror each other on top of the same API.

**Exception**: purely visual/layout/UI changes are exempt — screen sizes and interaction patterns differ between web and mobile, so layout, spacing, component choice, and navigation chrome can legitimately diverge. The parity rule applies to _what the app does_, not _how it looks_.

When making a cross-cutting change, call out explicitly whether the equivalent change was also made (or is needed) in the Flutter app.

## Commands

```
npm run dev        # vite dev server
npm run build       # vite build
npm run preview     # vite preview
npm run lint        # eslint .
npm run lint:fix     # eslint . --fix
npm run format       # prettier --write .
```

No test framework is configured (no vitest/jest, no `*.test.*` files). If adding tests, vitest is the natural fit given the Vite toolchain.

`.env` is required locally and gitignored (no `.env.example` exists) — needs `VITE_API_BASE_URL`, Firebase `VITE_FIREBASE_*` vars, and `VITE_PUSHER_KEY`/`VITE_PUSHER_CLUSTER`.

## Architecture

```
src/
  App.jsx        # central route table (react-router-dom v7)
  guards/        # ProtectedRoute.jsx — redirects to /login if unauthenticated
  layouts/       # AppLayout.jsx — sidebar + Outlet shell, eager-loads entities/categories/settlement session on mount
  pages/<feature>/  # one folder per screen: <Feature>.jsx + components/ + hooks/
  services/      # api.js (single axios instance + all API calls), error-handler.js
  store/         # zustand stores, one per domain
  lib/           # third-party client singletons (pusher.js)
  utils/         # formatting, enums, error-catalog
```

**Per-page hook split**: each `pages/<feature>/hooks/` folder separates `use-<feature>-data.js` (data fetching/store wiring) from `use-<feature>-ui.js` (local UI state like modal open/close). Follow this split when adding pages rather than putting everything in one hook.

**API layer is centralized**: all HTTP calls go through the single axios instance in `src/services/api.js`. Its response interceptor:

- Normalizes every error via `error-handler.js` + `utils/error-catalog.js`.
- Automatically shows a global snackbar/dialog on failure, **except** for `SILENT_PATHS` (`/auth/login`, `/auth/register`), where the calling form handles the error inline instead.
- Auto-logs out and redirects to `/login` on 401 (guarded by a `sessionExpiredHandled` flag to avoid double-handling).
- Auth token is passed explicitly as `Authorization: Bearer <token>` per call (no axios default header) — it's threaded through hooks/stores as an argument.

Never bypass this interceptor with ad hoc error handling outside `SILENT_PATHS`.

**Global feedback singletons**: `src/components/GlobalFeedback.jsx` mounts a snackbar/dialog once at the app root. Trigger them from anywhere with `useSnackbarStore.getState().show(...)` / `useDialogStore.getState().alert(...)` — no prop drilling needed.

**Auth persistence is manual**: `use-auth-store.js` reads/writes `user`/`token` to `localStorage` directly inside its actions (not via zustand's `persist` middleware). New persisted auth fields need updates in `getStoredAuthData()`, the relevant actions, and `logout()`'s cleanup.

**Realtime channel ref-counting**: `src/hooks/use-pusher-channel.js` uses a module-level `Map` to ref-count Pusher channel subscriptions so multiple components on the same channel don't cause a premature unsubscribe when one unmounts. Don't "simplify" this without preserving the ref-count.

**"Modo hacer cuentas" (settlement)**: a session-based flow (`store/use-settlement-store.js`, `hooks/use-settlement.js`, `hooks/use-settlements.js`, backend `/settlement/*` endpoints). With a session open, paying only *marks* the expense; the real payments are recorded when the session is finished, which also produces a snapshot. Paying from the dashboard requires an open session (client guard `ensureSettlementActive()`; the backend returns 409 `SETTLEMENT_REQUIRED` for batch payments). From the expense detail a payment is direct when no session is open, and from the entity detail it is always direct (`{ direct: true }`). This is a cross-cutting business rule, not just a UI feature — full rules in `docs/requerimientos-funcionales.md` (PAG and CTA).

**Path alias `@/*` → `src/*`** must stay in sync across three configs: `vite.config.js` (`resolve.alias`), `jsconfig.json` (`compilerOptions.paths`), `eslint.config.js` (`import/resolver.alias`).

`checklist_mis_cuentas.md` and `checklits_expense_manager.md` (repo root) are informal running checklists of implemented/pending features — useful for context on what's done vs. planned, not formal specs.
