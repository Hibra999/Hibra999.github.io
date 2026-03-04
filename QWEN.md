# Lindo Tours - Project Context

## Project Overview

**Lindo Tours** is a bilingual (English/Spanish) tour booking website for private tours in the Riviera Maya, Mexico. The application allows customers to browse tour packages, view detailed information including pricing tiers, itineraries, and add-ons, and submit booking requests via WhatsApp or email.

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js with Express.js (v5.2.1) |
| **Database** | SQLite (better-sqlite3) with WAL mode |
| **Frontend** | Vanilla JavaScript, CSS3, HTML5 |
| **Styling** | Custom CSS with CSS variables |
| **External Services** | EmailJS (email), WhatsApp API |
| **UI Libraries** | Flatpickr (date picker) |

### Architecture

```
├── server.js           # Express server with API routes
├── db/
│   ├── schema.sql      # Database schema (8 tables)
│   ├── seed.sql        # Sample tour data
│   └── lindotours.db   # SQLite database (git-ignored)
├── public/
│   ├── index.html      # Single-page application
│   ├── css/styles.css  # Custom styles (1500+ lines)
│   ├── js/
│   │   ├── main.js     # Frontend logic (state management, UI)
│   │   ├── config.js   # Configuration loader
│   │   ├── data.js     # Data utilities
│   │   └── hotels.js   # Hotel autocomplete
│   └── imagenes/       # Tour images, logos, flags
└── package.json
```

### Database Schema

The application uses 8 relational tables:

- **tours** - Main tour information (bilingual titles, descriptions, pricing)
- **gallery_images** - Tour photo galleries
- **pricing_tiers** - Volume-based adult pricing
- **tour_includes/tour_excludes** - What's included/excluded
- **itinerary_steps** - Ordered itinerary items
- **addons** - Optional add-on activities
- **packing_items** - What to bring recommendations
- **hotels** - Hotel pickup locations
- **bookings** - Customer booking submissions

## Building and Running

### Prerequisites

- Node.js (v14+ recommended)
- npm

### Installation

```bash
npm install
```

### Running the Server

```bash
npm start
# or
node server.js
```

The server runs on `http://localhost:3000` (or `PORT` env variable).

### Database

- Database auto-initializes on startup using `db/schema.sql`
- Seed data from `db/seed.sql` loads if tables are empty
- WAL (Write-Ahead Logging) mode enabled for better concurrency

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tours` | Get all tours with full details |
| GET | `/api/tours/:slug` | Get single tour by slug |
| GET | `/api/hotels` | Get all hotels for pickup |
| GET | `/api/bookings` | Get all bookings (admin) |
| POST | `/api/bookings` | Submit new booking |
| GET | `/api/config` | Get EmailJS & WhatsApp config |

## Frontend Features

- **Bilingual Support**: Real-time language switching (ES/EN)
- **Tour Catalog**: Grid view with card thumbnails
- **Tour Details**: Full tour info with gallery, pricing, itinerary
- **Shopping Cart**: Add multiple tours, persistent via localStorage
- **Booking Form**: Customer details, date/time picker, hotel autocomplete
- **Checkout**: Send booking via WhatsApp or EmailJS

## Development Conventions

### Code Style

- **Backend**: CommonJS modules, concise arrow functions, semicolon-less style
- **Frontend**: Vanilla ES6+, `var` for broader compatibility, IIFE patterns
- **CSS**: CSS variables for theming, BEM-like naming, mobile-first responsive

### State Management

Frontend uses a global `state` object persisted to localStorage:
```javascript
state = {
  language: 'es',
  currentView: 'catalog',
  currentTour: null,
  cart: [],
  adults: 0,
  children: 0,
  addOns: {}
}
```

### Key Files to Know

| File | Purpose |
|------|---------|
| `server.js` | All backend logic in single file (~100 lines) |
| `public/js/main.js` | Frontend SPA logic (~1500 lines) |
| `db/schema.sql` | Database structure reference |
| `public/css/styles.css` | All styling with CSS custom properties |

## Notes

- No test suite configured (`npm test` is a placeholder)
- No linting configuration present
- Images stored in `public/imagenes/` with tour-specific subdirectories
- Booking flow stores data in SQLite but primarily uses WhatsApp/email for confirmation
