# Repository Guidelines

## Project Structure & Module Organization
`server.js` is the application entry point: it starts Express, initializes SQLite from `db/schema.sql`, optionally seeds from `db/seed.sql`, and serves the SPA. `public/` contains the frontend (`index.html`, `css/styles.css`, `js/main.js`, `js/hotels.js`) plus static media in `public/imagenes/`. Store tour galleries in `public/imagenes/servicios/<tour_slug>/` and keep image names numeric, for example `1.jpg`, `2.jpg`. Treat `db/*.db` as local runtime state; ship schema or seed changes instead of database files.

## Build, Test, and Development Commands
```bash
npm install
npm start
PORT=4000 npm start
curl http://localhost:3000/api/tours
```
`npm install` installs dependencies. `npm start` runs the site and API on `http://localhost:3000`. Setting `PORT` overrides the default port. Use a quick `curl` call to confirm the API is responding. There is no separate build step in this repository.

## Coding Style & Naming Conventions
This project uses Node.js CommonJS on the backend and vanilla HTML, CSS, and JavaScript on the frontend. Match the existing formatting: 4 spaces in JavaScript, 2 spaces in CSS, and semicolons in JS files. Use `camelCase` for variables and functions, `UPPER_SNAKE_CASE` for constants, and `snake_case` for tour slugs and service image folders. Keep bilingual fields paired consistently as `*_en` and `*_es`.

## Testing Guidelines
No automated test suite is configured yet; `npm test` is still a placeholder and fails by design. For each change, run a manual smoke test: start the app, verify `GET /api/tours` and `GET /api/hotels`, then exercise any changed booking or admin flow such as `POST /api/bookings` or `POST /api/admin/login`. For UI work, check both language modes and at least one mobile-sized viewport.

## Commit & Pull Request Guidelines
Recent history mixes informal commits with Conventional Commit prefixes like `feat:`, `fix:`, and `chore:`. Prefer `<type>: <short imperative summary>`, for example `fix: validate booking totals on the server`. Keep commits focused on one concern. Pull requests should describe behavior changes, note added assets or schema updates, link related issues, and include screenshots plus manual test notes for visible UI changes.

## Security & Configuration Tips
Configure runtime settings with `PORT`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_TOKEN_TTL_MS`. Do not depend on default admin credentials outside local development. Keep `.env`, local SQLite files, and temporary uploaded test data out of commits.
