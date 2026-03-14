# Repository Guidelines

## Project Structure & Module Organization
`server.js` is the only backend entrypoint; it serves the API, initializes SQLite, and exposes the app on `PORT`. Static UI files live in `public/` with styles in `public/css/`, browser logic in `public/js/`, and tour/testimonial assets in `public/imagenes/`. Database schema and seed data live in `db/schema.sql` and `db/seed.sql`. Smoke tests and local helper scripts live in `scripts/`. Deployment templates are kept in `desploy/`, and runtime private uploads default to `storage/`.

## Build, Test, and Development Commands
Run `npm install` to install the Express/SQLite dependencies. Use `npm start` to launch the app locally on port `3000` by default. Run `npm test` or `npm run smoke` to execute the full smoke suite. Target a specific flow when debugging with `npm run smoke:orders`, `npm run smoke:customer-auth`, `npm run smoke:bank-transfer`, `npm run smoke:admin`, or `npm run smoke:paypal`.

## Coding Style & Naming Conventions
Match the existing JavaScript style: CommonJS modules, semicolons, and 4-space indentation. Use `camelCase` for variables and functions, `UPPER_SNAKE_CASE` for environment-backed constants, and descriptive route/helper names. Keep static asset folders slug-like and lowercase, for example `public/imagenes/servicios/private_chichen_itza_cenote_with_lunch/`. There is no formatter configured in the repo, so keep changes small and consistent with surrounding code.

## Testing Guidelines
This repository uses a custom Node smoke runner in `scripts/smoke.js`; there is no Jest/Vitest setup and no enforced coverage threshold. Add or extend smoke scenarios for behavior changes that affect orders, auth, admin, or payments. Before opening a PR, run the narrowest relevant smoke command first, then `npm test` for a full pass.

## Commit & Pull Request Guidelines
Recent history mixes terse subjects like `revisar docs` and `wtf2?` with occasional prefixes such as `fix:`. For new work, use short imperative summaries that describe the actual change, optionally with `fix:` or `feat:`. PRs should explain user-visible impact, note any schema or env changes, link the issue when available, and include screenshots for `public/` UI updates.

## Security & Configuration Tips
Start from `.env.example` and never commit real credentials or production values. Keep SQLite database files, WAL files, and private uploads out of Git. When testing payment or admin changes, prefer sandbox credentials and disposable local data.
