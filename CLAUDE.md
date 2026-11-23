# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

React 19 SPA ("Expense Manager" — personal debt/expense tracker), built with Vite (using the Rolldown-based `rolldown-vite` package aliased as `vite`), JavaScript/JSX (no TypeScript), Tailwind CSS 4, react-router-dom 7, zustand for state, axios for HTTP, Firebase for Google auth, Pusher for realtime, i18next/react-i18next for translations.

It is one of two frontend clients on a shared backend: the sibling repo `api-plataformas-desarrollo` (Node/Express API). The other client is the Flutter app `app_expense_manager`. Backend contract changes (routes, error codes, response shapes) affect both clients.

The README.md is the human-facing entry point (setup, env vars, scripts, architecture summary, main libraries) for the web and summarizes the backend; the API and Flutter repos have their own README. Keep it in sync when a command, env var or main dependency changes.

## Documentation and guides

- `docs/` — functional documentation for the **whole system** (web + Flutter app + API): `descripcion-general.md` (system overview, general/specific objectives and scope — the entry point), `mision-vision-valores.md` (mission, vision and core values, each value tied to the RF/RNF that implement it), `requerimientos-funcionales.md`, `requerimientos-no-funcionales.md`, `casos-de-uso.md` and the use-case, entity-relationship and UML class diagrams (domain and design) in `docs/diagramas/`. It lives in this repo but covers all three projects.
- `.claude/guides/` — development guides of this repo: `arquitectura-web.md` (this project's architecture) and `documentacion.md` (what to update after a change, for all three projects).
- Each project keeps its own architecture guide in its own repo: `.claude/guides/arquitectura-flutter.md` in the Flutter repo and `.claude/guides/arquitectura-api.md` in the API repo. Read the guide for the project you are about to change before writing code.

## Documentation update rule

**Every change made in any of the three projects** (this web app, the Flutter app, the API) **must update, in the same change, whatever it leaves stale** in:

1. `docs/` in this repo — system overview/objectives/scope (`descripcion-general.md`), requirements, use cases and diagrams. `descripcion-general.md` must be updated whenever a change adds/removes a module, changes what a module is for, adds a platform/language/currency/external service, or moves something into or out of scope. `mision-vision-valores.md` must be updated when a change alters, fixes or breaks a commitment listed in its values table, or renumbers an RF/RNF it cites.
2. The architecture guide of the affected project, in that project's own repo (`.claude/guides/arquitectura-<web|flutter|api>.md`).
3. The `CLAUDE.md` of the affected repo(s), if a command, folder, layer or convention changed.
4. The Postman collection `postman/expense-manager.postman_collection.json` in this repo, whenever an API endpoint is added, removed or changed (method, path, query params, body, auth or response data its scripts read). It must keep covering every route of the API.

`docs/` applies even when the code change is entirely in the Flutter or API repo: the functional docs to update are still the ones here (`docs/`).

`.claude/guides/documentacion.md` has the table of what to update for each kind of change — follow it. Purely visual changes and internal refactors that alter no layer or convention need no update. Document what the code actually does: a rule the API does not enforce is recorded as a known limitation, not as fulfilled.

**No absolute paths in documentation**: each team member clones the repos in a different location, so never write machine-specific paths. Use paths relative to the repo root, and refer to another project by its repo name (e.g. `docs/` in the web repo).

At the end of every task, state which documentation files were updated, or say explicitly that none needed updating and why.

## Git read-only rule

**Only read-only git operations are allowed** — in any of the three projects (this web app, the Flutter app, the API). Allowed: `git status`, `git log`, `git show`, `git diff`, `git blame`, `git branch` (listing only), `git ls-files`, `git remote -v` and similar commands that do not change the repository, the index or the remote. Not allowed, even if asked mid-task: `git add`, `git rm`, `git mv`, `git commit`, `git push`, `git pull`, `git fetch`, `git merge`, `git rebase`, `git reset`, `git restore`, `git checkout`/`git switch`, `git stash`, `git tag`, `git cherry-pick`, `git revert`, `git clean`, creating/deleting branches, or any `gh` command that creates or modifies PRs, issues or comments. Make the changes in the working tree and leave staging, committing and pushing to the user.

## Feature parity rule

Any functional/business-logic change made here (new feature, changed behavior, new field, new validation, new endpoint usage) **must also be implemented in the Flutter app** (`app_expense_manager`), and vice versa. The two clients are meant to mirror each other on top of the same API.

**Exception**: purely visual/layout/UI changes are exempt — screen sizes and interaction patterns differ between web and mobile, so layout, spacing, component choice, and navigation chrome can legitimately diverge. The parity rule applies to _what the app does_, not _how it looks_.

When making a cross-cutting change, call out explicitly whether the equivalent change was also made (or is needed) in the Flutter app.

## No code comments rule

**Do not write comments in code** — in any of the three projects (this web app, the Flutter app, the API). No `//`, `/* */`, JSX `{/* */}`, JSDoc `/** */` or Dart `///` doc comments, not even section markers like `{/* HEADER */}`. Code must explain itself through names and structure; the "why" of a business rule belongs in `docs/` or the architecture guide, not in the source. When editing a file that still has a comment, remove it.

Only tool directives are allowed, because they change behavior: `eslint-disable*`, `prettier-ignore`, Dart `// ignore:` / `// ignore_for_file:`. Generated files (`lib/l10n/gen/`, `firebase_options.dart`) are left as generated.

An intentionally empty `catch {}` needs no comment: ESLint here allows it (`no-empty` with `allowEmptyCatch`).

## Commands

```
npm run dev        # vite dev server
npm run build       # vite build
npm run preview     # vite preview
npm run lint        # eslint .
npm run lint:fix     # eslint . --fix
npm run format       # prettier --write .
npm test             # vitest run (unit tests)
npm run test:watch   # vitest in watch mode
```

Unit tests use Vitest (no separate config: it reads `vite.config.js`, so the `@/` alias works; `src/i18n/test-setup.js` fixes the language to Spanish). Test files are `<name>.test.js` next to the file under test (e.g. `src/utils/convert-currency.test.js`), import `describe`/`it`/`expect` explicitly from `vitest`, and cover pure functions in `utils/`, plus `lib/create-pusher-client.js`, `lib/create-firebase-auth.js`, `services/error-handler.js`, `store/use-settlement-store.js`, `store/use-screen-cache-store.js` and `store/use-dialog-store.js` — there is no `jsdom` environment or Testing Library installed for components/hooks. To test screen logic, extract it to a `utils/` function first. Do not use `vi.mock` with the `@/` alias: on Windows the mock is ignored when the working directory has a lowercase drive (`d:\`, as VS Code opens it). Replace store actions with `setState`, and fake HTTP by setting `axios.defaults.adapter` before dynamically importing the module (see `use-settlement-store.test.js`).

`.env` is required locally and gitignored (no `.env.example` exists) — needs `VITE_API_BASE_URL`. Optional: Firebase `VITE_FIREBASE_*` vars (without them `auth` is `null` and the Google button is disabled) and `VITE_PUSHER_KEY`/`VITE_PUSHER_CLUSTER` (without either one, `pusherClient` is `null` and the app runs without realtime).

## Architecture

```
src/
  App.jsx        # central route table (react-router-dom v7); every /app page is lazy()-loaded
  guards/        # ProtectedRoute.jsx — redirects to /login if unauthenticated
  layouts/       # AppLayout.jsx — sidebar + mobile top bar + Outlet shell, eager-loads entities/categories/settlement session on mount
  pages/<feature>/  # one folder per screen: <Feature>.jsx + components/ + hooks/
  services/      # api.js (single axios instance + all API calls), error-handler.js
  store/         # zustand stores, one per domain
  lib/           # third-party client singletons (pusher.js, null without its env vars)
  i18n/          # i18next setup and locales/es.json + locales/en.json
  utils/         # formatting, enums, error-catalog
```

**Per-page hook split**: each `pages/<feature>/hooks/` folder separates `use-<feature>-data.js` (data fetching/store wiring) from `use-<feature>-ui.js` (local UI state like modal open/close). Follow this split when adding pages rather than putting everything in one hook.

**API layer is centralized**: all HTTP calls go through the single axios instance in `src/services/api.js`. Its response interceptor:

- Normalizes every error via `error-handler.js` + `utils/error-catalog.js`.
- Automatically shows a global snackbar/dialog on failure, **except** for `SILENT_PATHS` (`/auth/login`, `/auth/register`, `/auth/firebase-login`), where the calling form or hook handles the error instead.
- Auto-logs out and redirects to `/login` on 401 (guarded by a `sessionExpiredHandled` flag to avoid double-handling).
- Auth token is passed explicitly as `Authorization: Bearer <token>` per call (no axios default header) — it's threaded through hooks/stores as an argument.

Never bypass this interceptor with ad hoc error handling outside `SILENT_PATHS`.

**Global feedback singletons**: `src/components/GlobalFeedback.jsx` mounts a snackbar/dialog once at the app root. Trigger them from anywhere with `useSnackbarStore.getState().show(...)` / `useDialogStore.getState().alert(...)` — no prop drilling needed. For yes/no confirmations use `await useDialogStore.getState().confirm({ title, message, tone, confirmLabel })` (resolves `true`/`false`); never use native `window.alert`/`window.confirm`. For a slow confirmed action pass it as `onConfirm: async () => …`: the dialog stays open and locked, with the spinner on its confirm button, until it finishes.

**Auth persistence is manual**: `use-auth-store.js` reads/writes `user`/`token` to `localStorage` directly inside its actions (not via zustand's `persist` middleware). New persisted auth fields need updates in `getStoredAuthData()`, the relevant actions, and `logout()`'s cleanup.

**Screen cache**: dashboard, entities, shared items and settlement history keep their server data in `useCachedState` (`store/use-screen-cache-store.js`), so returning to a module paints immediately and revalidates in the background, without the full-screen loader. The cache is in-memory, cleared when the token changes, and rejects writes from a previous token. Loads must use `beginScreenRequest(key)` to drop superseded responses.

**Realtime channel ref-counting**: `src/hooks/use-pusher-channel.js` uses a module-level `Map` to ref-count Pusher channel subscriptions so multiple components on the same channel don't cause a premature unsubscribe when one unmounts. Don't "simplify" this without preserving the ref-count.

**"Modo hacer cuentas" (settlement)**: a session-based flow (`store/use-settlement-store.js`, `hooks/use-settlement.js`, `hooks/use-settlements.js`, backend `/settlement/*` endpoints). With a session open, paying only *marks* the expense; the real payments are recorded when the session is finished, which also produces a snapshot. Paying from the dashboard requires an open session (client guard `ensureSettlementActive()`; the backend returns 409 `SETTLEMENT_REQUIRED` for batch payments). From the expense detail a payment is direct when no session is open, and from the entity detail it is always direct (`{ direct: true }`). This is a cross-cutting business rule, not just a UI feature — full rules in `docs/requerimientos-funcionales.md` (PAG and CTA).

**Light/dark theme**: Tailwind's `dark:` variant is class-based (`@custom-variant dark` in `index.css`), driven by `themeMode` (`system`/`light`/`dark`) in `use-ui-store.js` and applied by `utils/theme.js` + `hooks/use-theme-sync.js`. Every background/text/border color needs its light and `dark:` pair; don't add dark-only hex colors.

**Responsive layout**: the web must work from 360px wide. Main breakpoint is `lg` (1024px, `DESKTOP_QUERY` in `hooks/use-media-query.js`): from there up the sidebar is fixed and collapsible; below it `components/MobileTopBar.jsx` opens it as an overlay drawer (`mobileSidebarOpen` in `use-ui-store.js`, not persisted). Internal-scroll pages (dashboard, settlement history) only scroll internally from `lg` up. Write mobile-first Tailwind classes; full conventions in `.claude/guides/arquitectura-web.md` (section 4, "Responsive").

**Internationalization**: every user-visible text lives in `src/i18n/locales/es.json` and `en.json`, with the same keys, placeholders and rich-text tags (enforced by `utils/locale-catalog.test.js`). Import `t` from `@/i18n` (it also works outside React); use `<Trans>` for text with inline markup and `_one`/`_other` keys for plurals. Never concatenate sentence fragments. Use `getIntlLocale()` for `Intl`/`toLocale*`, never a hardcoded locale. The language is a per-browser preference (`system`/`es`/`en`, key `ui:language`, card `IdiomaCard` in Configuración, same options as Flutter). `system` follows the browser (first supported, otherwise English). Changing the active language reloads the app because some labels are built at module load. API data values such as `EGRESO`/`INGRESO` are not translated.

**Path alias `@/*` → `src/*`** must stay in sync across three configs: `vite.config.js` (`resolve.alias`), `jsconfig.json` (`compilerOptions.paths`), `eslint.config.js` (`import/resolver.alias`).

`checklist_mis_cuentas.md` and `checklits_expense_manager.md` (repo root) are informal running checklists of implemented/pending features — useful for context on what's done vs. planned, not formal specs.
