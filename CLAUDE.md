# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Lindo Tours is a bilingual (EN/ES) tour booking platform for Cancún/Riviera Maya. It's a monolithic Express app (`server.js`, ~3350 lines) backed by SQLite (better-sqlite3) that serves a single-page application from `public/`. It supports PayPal and bank transfer payments, Google Sign-In, email OTP customer auth, and an admin panel.

## Commands

- `npm start` — run the server (default port 3000, override with `PORT`)
- `node --watch server.js` — development with auto-reload
- `npm test` — full smoke test suite (spawns its own server with temp DB)
- `npm run smoke:orders` / `smoke:customer-auth` / `smoke:bank-transfer` / `smoke:admin` / `smoke:paypal` — targeted smoke flows

No linter, formatter, or type checker is configured.

## Architecture

**Single-file backend**: `server.js` contains all Express routes, middleware, SQLite setup, PayPal integration, customer auth (email OTP + Google), admin auth, and the SPA catch-all. Routes are grouped as:
- `/api/tours`, `/api/hotels` — public catalog
- `/api/orders`, `/api/payments/*`, `/api/bookings` — checkout and payment flow
- `/api/auth/customer/*`, `/api/me/*` — customer authentication and portal
- `/api/admin/*` — admin panel (basic auth with token sessions)
- `/api/webhooks/paypal` — PayPal webhook handler (registered before JSON body parser)
- `/api/config` — public client config (PayPal client ID, Google client ID, contact info, feature flags)

**Database**: `db/schema.sql` is the source of truth for schema (applied on startup). `db/seed.sql` seeds tour data only if the tours table is empty. Key tables: `tours` (with child tables for pricing_tiers, addons, itinerary_steps, etc.), `orders`/`order_items`/`payments`, `customer_profiles`/`customer_sessions`, `audit_logs`.

**Frontend SPA**: `public/index.html` is a large single HTML file containing all UI (catalog, tour details, cart, checkout, admin panel, customer portal). Browser JS is in `public/js/main.js` (core app), `public/js/auth-page.js` (login/register pages), `public/js/hotels.js` (hotel data). Styles in `public/css/styles.css`.

**File storage**: Tour images go in `public/imagenes/servicios/<slug>/`. Private uploads (transfer proofs) go in `storage/transfer-proofs/` (configurable via `PRIVATE_STORAGE_PATH`).

## Key Environment Variables

See `desploy/lindo-tours.env.example` for the full list. Important ones: `ADMIN_USERNAME`/`ADMIN_PASSWORD` (override hardcoded defaults), `PAYPAL_CLIENT_ID`/`PAYPAL_CLIENT_SECRET`/`PAYPAL_WEBHOOK_ID`, `GOOGLE_CLIENT_IDS`, `SQLITE_DB_PATH`, `PRIVATE_STORAGE_PATH`, `DEMO_MODE`, `BANK_TRANSFER_*` vars.

## Code Style

CommonJS modules, semicolons, single quotes, 4-space indentation. `camelCase` for variables/functions, `UPPER_SNAKE_CASE` for env-backed constants. Keep the `desploy/` folder name (intentional).

## Deployment

Production runs behind nginx with systemd (`desploy/lindo-tours.service`). The service uses `node --watch` and listens on `127.0.0.1:5023`. SQLite DB and private storage live outside the repo at `/var/lib/lindo-tours/` in production. See `desploy/README.md` for full setup steps.
