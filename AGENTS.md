# Repository Guidelines

## Project Structure & Module Organization
- `server.js`: Express 5 API and static file server entrypoint.
- `public/`: frontend SPA assets.
- `public/index.html`: base markup.
- `public/js/main.js`: client logic (catalog, detail, cart, checkout, admin view).
- `public/css/styles.css`: all site styles.
- `public/imagenes/`: media files, organized by tour slug.
- `db/schema.sql`: SQLite schema.
- `db/seed.sql`: initial tour/hotel seed data.
- `db/lindotours.db*`: local runtime database files; avoid committing binary DB changes unless required.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm start`: run the app at `http://localhost:3000`.
- `PORT=4000 npm start`: run on a different local port.
- `curl http://localhost:3000/api/tours`: quick API smoke check.
- `npm test`: currently a placeholder that exits with an error; not a valid test signal yet.

## Coding Style & Naming Conventions
- Use 4-space indentation, semicolons, and camelCase in JavaScript.
- Keep backend code in CommonJS style (`require(...)`).
- Keep bilingual fields paired (`*_en` and `*_es`) in SQL/data objects.
- Keep translatable UI text in `data-es` and `data-en` attributes.
- Tour slugs should stay stable and map to image folders (for example: `public/imagenes/tulumAkumal/1.jpg`).

## Testing Guidelines
- No automated test suite is configured yet.
- Before opening a PR, run manual checks:
- load catalog/detail/about/admin/cart flows in the browser;
- verify `/api/tours`, `/api/hotels`, and `/api/config` responses;
- submit a booking and confirm persistence through `/api/bookings`.
- If you add automated tests, create a `tests/` directory and add the corresponding npm script in `package.json`.

## Commit & Pull Request Guidelines
- Prefer Conventional Commit prefixes (`feat:`, `fix:`, `refactor:`, `chore:`).
- Keep messages short, imperative, and specific (avoid vague titles like "NEW ERA").
- Keep commits focused by concern (API, UI, SQL).
- PRs should include:
- change summary and scope;
- screenshots/GIFs for UI changes;
- schema/seed impact notes;
- manual validation steps and results.

## Security & Configuration Tips
- Do not commit real secrets or production credentials.
- Move sensitive values (admin credentials, third-party keys) to environment variables in deployed environments.
- Review large SQL seed edits carefully to avoid accidental bulk data changes.
