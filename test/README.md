# Testes de integração do frontend

Run `npm ci`, `npm test`, `npm run test:typecheck`, `npm run lint` and `npm run build` in this repository.

- `adapters/`: presentation conversions and form validation.
- `components/`: verification input, keyboard focus and paste.
- `navigation/`: real `SessionProvider`, `RequireSession` guard and TanStack memory router against a mocked `fetch`. Exercises login, MFA-adjacent flows, private-route guard, protocols, lifecycle, migration, team management, notifications, agenda and export, with real cookie-based session state (no bearer token, synthetic or otherwise).
- `contracts/`: native fetch against real Nest HTTP and PostgreSQL synthetic records, orchestrated by the backend.

For the HTTP contract, run `npm run test:setup` and then `npm run test:contract` **from allervia-backend**. Both checkouts must have dependencies installed. The backend defaults to the sibling `../allervia-web`; override `ALLERVIA_WEB_ROOT` there if needed. The database environment guard requires a local dedicated test database different from development. Do not run this concurrently with database-cleaning suites.

Do not manually set a production API/token for the web contract command. The harness starts an ephemeral loopback Nest server and issues a real opaque session cookie (`allervia_session_v2`) plus CSRF token via child-process environment, never argv or committed configuration. The contract test exercises real cookie, CSRF and session-context handling — not a synthetic bearer. Missing harness credentials fail the test rather than skip it.

Vitest has a dedicated config and does not load Vite route-generation plugins for tests. UI tests use jsdom with explicit cleanup. `test/setup.ts` stubs only unsupported jsdom scrolling APIs (`scrollIntoView`, `scrollTo`) and `ResizeObserver` — not API responses or navigation. Contracts use a separate Node environment.

## Playwright (E0 minimum)

`e2e/smoke.spec.ts` runs a real browser (Chromium) against the real backend, real PostgreSQL and the real frontend dev server — no mocked `fetch`. It covers login, private-route access (including a reload to prove the session survives via cookie, not in-memory state), and logout (confirms the server session is actually revoked by checking a fresh page can no longer reach the private route).

To run it: seed a demo dataset in `allervia-backend` (`npm run seed:demo-dataset`, from that repo), start the backend (`npm run start`) and the frontend (`npm run dev`), then from `allervia-web` run `npx playwright install chromium` (once) and `npm run e2e`. Override credentials via `PLAYWRIGHT_DEMO_EMAIL` / `PLAYWRIGHT_DEMO_PASSWORD` and the target via `PLAYWRIGHT_BASE_URL` if needed. This is a minimum smoke suite, not full browser homologation (E9).

## Known debt

Existing project lint failures (3× `react-hooks/set-state-in-effect`, 1× `react-refresh/only-export-components`) and the full picture of the vitest run (what passes, what fails and why) are recorded in `allervia-backend/docs/integration-baseline/baseline-report.md`; do not disable rules or weaken assertions to make this baseline appear clean without updating that report.
