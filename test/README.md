# Integration baseline tests

Run `npm ci`, `npm test`, and `npm run test:typecheck` in this repository.

- `adapters/`: existing presentation conversions and form validation.
- `components/`: real verification input, keyboard focus and paste.
- `navigation/`: real LoginPage link and TanStack memory router; does not certify an authenticated route guard, which is I1 work.
- `contracts/`: native fetch against real Nest HTTP and PostgreSQL synthetic records, orchestrated by the backend.

For the HTTP contract, run `npm run test:setup` and then `npm run test:contract` **from allervia-backend**. Both checkouts must have dependencies installed. The backend defaults to the sibling `../allervia-web`; override `ALLERVIA_WEB_ROOT` there if needed. The database environment guard requires a local dedicated test database different from development. Do not run this concurrently with database-cleaning suites.

Do not manually set a production API/token for the web contract command. The harness starts an ephemeral loopback server and passes a synthetic short-lived bearer via child-process environment, never argv or committed configuration. The current test records existing HTTP behavior (including preview 201); cookie/MFA/CSRF testing belongs to I1. Missing harness credentials fail the test rather than skip it.

Vitest has a dedicated config and does not load Vite route-generation plugins for tests. UI tests use jsdom with explicit cleanup. The setup stubs only unsupported scrolling, not API responses or navigation. Contracts use a separate Node environment.

Existing project lint failures are recorded in `allervia-backend/docs/integration-baseline/baseline-report.md`; do not disable rules to make this baseline appear clean.
