# Repository Guidelines

## Project Structure & Module Organization
- `server.js`: Express API + static server, including SQLite bootstrap (`db/schema.sql` and optional `db/seed.sql`).
- `public/`: Frontend files (`index.html`, `css/styles.css`, `js/main.js`, `js/hotels.js`) plus images in `public/imagenes/`.
- `db/`: Database schema, seed data, and local SQLite files (`lindotours.db`, `-wal`, `-shm`).
- Keep new tour media under `public/imagenes/servicios/<tour_slug>/` and keep filenames numeric (`1.jpg`, `2.jpg`, ...).

## Build, Test, and Development Commands
```bash
npm install          # Install dependencies
npm start            # Start server on http://localhost:3000
PORT=4000 npm start  # Start server on a custom port
```
- There is no build step in this repository.
- `npm test` is currently a placeholder and exits with an error by design.

## Coding Style & Naming Conventions
- Stack: Node.js (CommonJS) + vanilla JS/CSS/HTML.
- Match existing formatting: 4 spaces in JS (`server.js`, `public/js/*.js`) and 2 spaces in CSS.
- Use semicolons in JavaScript.
- Naming:
  - `camelCase` for functions/variables.
  - `UPPER_SNAKE_CASE` for constants/env defaults.
  - `snake_case` for tour slugs and service image folders (for consistency with current assets).
- No ESLint/Prettier is configured; keep changes style-consistent with surrounding code.

## Testing Guidelines
- No automated test suite is configured yet.
- For each change, run a manual smoke test:
  1. Start app with `npm start` and confirm boot without errors.
  2. Verify key endpoints: `GET /api/tours`, `GET /api/hotels`, `POST /api/bookings`.
  3. If admin-related, validate `POST /api/admin/login` and protected booking routes.
  4. Check UI flows in both languages and on mobile/desktop widths.

## Commit & Pull Request Guidelines
- Git history mostly uses Conventional Commit prefixes (`feat:`, `refactor:`), with some inconsistent legacy messages.
- Preferred format: `<type>: <short imperative summary>` (example: `feat: add booking status filter`).
- Keep commits focused by concern (API, UI, DB).
- PRs should include: purpose, impacted files, manual test evidence, and screenshots for UI changes.
- If schema/seed changes are included, call them out explicitly in the PR description.

## Security & Configuration Tips
- Configure runtime values via environment variables: `PORT`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_TOKEN_TTL_MS`.
- Do not commit secrets or sensitive production data.
- Override default admin credentials outside local development.
