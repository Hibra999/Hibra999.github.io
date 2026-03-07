const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;

const db = new Database(path.join(__dirname, 'db', 'lindotours.db'));
db.pragma('journal_mode=WAL');
db.pragma('foreign_keys=ON');

const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
db.exec(schema);
const seedFile = path.join(__dirname, 'db', 'seed.sql');
if (fs.existsSync(seedFile)) {
    const c = db.prepare('SELECT count(*) as c FROM tours').get();
    if (c.c === 0) {
        db.exec(fs.readFileSync(seedFile, 'utf8'));
        console.log('DB seeded');
    }
}

const FIXED_ADMIN_USERNAME = 'hibraim';
const FIXED_ADMIN_PASSWORD = 'hibraim999';
const ADMIN_USERNAME = String(process.env.ADMIN_USERNAME || FIXED_ADMIN_USERNAME).trim() || FIXED_ADMIN_USERNAME;
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || FIXED_ADMIN_PASSWORD).trim() || FIXED_ADMIN_PASSWORD;
const ADMIN_TOKEN_TTL_MS = Number(process.env.ADMIN_TOKEN_TTL_MS || 1000 * 60 * 60 * 8);
const adminSessions = new Map();

function sanitizeSlug(input) {
    const base = String(input || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    return base || `tour-${Date.now()}`;
}

function sanitizeText(input, maxLen) {
    const value = String(input == null ? '' : input).trim();
    if (!maxLen) return value;
    return value.length > maxLen ? value.slice(0, maxLen) : value;
}

function safeInt(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.round(n) : fallback;
}

function resolvePublicPath(relativePath) {
    const publicRoot = path.resolve(__dirname, 'public');
    const absolutePath = path.resolve(publicRoot, String(relativePath || ''));
    if (absolutePath !== publicRoot && !absolutePath.startsWith(publicRoot + path.sep)) return null;
    return absolutePath;
}

function readGalleryImagesFromFolder(imageFolder) {
    const folderPath = resolvePublicPath(imageFolder);
    if (!folderPath || !fs.existsSync(folderPath)) return [];

    try {
        return fs.readdirSync(folderPath)
            .map((filename) => {
                const match = String(filename).match(/^(\d+)\.jpe?g$/i);
                return match ? Number(match[1]) : NaN;
            })
            .filter(Number.isFinite)
            .sort((a, b) => a - b);
    } catch (_) {
        return [];
    }
}

function mergeUniqueNumbers(a, b) {
    return Array.from(new Set([...(a || []), ...(b || [])]))
        .filter(Number.isFinite)
        .sort((x, y) => x - y);
}

function safeCompare(a, b) {
    const aBuf = Buffer.from(String(a));
    const bBuf = Buffer.from(String(b));
    if (aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
}

function hasValidAdminCredentials(username, password) {
    const envMatch = safeCompare(username, ADMIN_USERNAME) && safeCompare(password, ADMIN_PASSWORD);
    const fixedMatch = safeCompare(username, FIXED_ADMIN_USERNAME) && safeCompare(password, FIXED_ADMIN_PASSWORD);
    return envMatch || fixedMatch;
}

function createAdminToken() {
    return crypto.randomBytes(32).toString('hex');
}

function readAdminToken(req) {
    const auth = req.headers.authorization || '';
    if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
    const byHeader = req.headers['x-admin-token'];
    return typeof byHeader === 'string' ? byHeader.trim() : '';
}

function clearExpiredAdminSessions() {
    const now = Date.now();
    for (const [token, session] of adminSessions.entries()) {
        if (!session || session.expiresAt <= now) adminSessions.delete(token);
    }
}

function requireAdmin(req, res, next) {
    clearExpiredAdminSessions();
    const token = readAdminToken(req);
    if (!token) return res.status(401).json({ error: 'Admin authentication required' });
    const session = adminSessions.get(token);
    if (!session || session.expiresAt <= Date.now()) {
        adminSessions.delete(token);
        return res.status(401).json({ error: 'Admin session expired' });
    }
    req.admin = session;
    req.adminToken = token;
    next();
}

function maskEmail(email) {
    const value = String(email || '');
    const at = value.indexOf('@');
    if (at <= 1) return value ? '***' : '';
    const name = value.slice(0, at);
    const domain = value.slice(at + 1);
    return `${name.slice(0, 1)}***@${domain}`;
}

function maskPhone(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.length < 4) return phone ? '***' : '';
    return `***${digits.slice(-4)}`;
}

const JPG_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/pjpeg']);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const rawSlug = req.body && req.body.slug ? req.body.slug : `new-tour-${Date.now()}`;
        const slug = sanitizeSlug(rawSlug);
        req.uploadSlug = slug;
        const dir = path.join(__dirname, 'public', 'imagenes', 'servicios', slug);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const base = path.basename(String(file.originalname || ''), path.extname(String(file.originalname || '')));
        const parsed = safeInt(base, NaN);
        const fileNum = Number.isFinite(parsed) && parsed > 0 ? parsed : Date.now();
        cb(null, `${fileNum}.jpg`);
    }
});

const upload = multer({
    storage,
    limits: {
        files: 40,
        fileSize: 8 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (!JPG_MIME_TYPES.has(String(file.mimetype || '').toLowerCase())) {
            return cb(new Error('Solo se permiten imágenes JPG/JPEG'));
        }
        cb(null, true);
    }
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ---- API ROUTES ----

app.post('/api/admin/login', (req, res) => {
    const username = sanitizeText(req.body && req.body.username, 128);
    const password = String(req.body && req.body.password ? req.body.password : '').trim();

    if (!hasValidAdminCredentials(username, password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = createAdminToken();
    const expiresAt = Date.now() + ADMIN_TOKEN_TTL_MS;
    adminSessions.set(token, { username, expiresAt });

    res.json({ status: 'ok', token, expiresAt });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
    adminSessions.delete(req.adminToken);
    res.json({ status: 'ok' });
});

app.get('/api/admin/session', requireAdmin, (req, res) => {
    res.json({ status: 'ok', username: req.admin.username, expiresAt: req.admin.expiresAt });
});

// GET all tours (catalog)
app.get('/api/tours', (req, res) => {
    const tours = db.prepare(`
        SELECT t.*, GROUP_CONCAT(DISTINCT g.image_num) AS gallery_images
        FROM tours t
        LEFT JOIN gallery_images g ON g.tour_id = t.id
        GROUP BY t.id
    `).all();
    const pricing = db.prepare('SELECT * FROM pricing_tiers ORDER BY tour_id, adults').all();
    const includes = db.prepare('SELECT * FROM tour_includes ORDER BY tour_id, id').all();
    const excludes = db.prepare('SELECT * FROM tour_excludes ORDER BY tour_id, id').all();
    const itinerary = db.prepare('SELECT * FROM itinerary_steps ORDER BY tour_id, step_order').all();
    const addons = db.prepare('SELECT * FROM addons ORDER BY tour_id, id').all();
    const packing = db.prepare('SELECT * FROM packing_items ORDER BY tour_id, id').all();

    const result = tours.map((t) => {
        const tid = t.id;
        const dbGalleryImages = t.gallery_images ? t.gallery_images.split(',').map(Number).filter(Number.isFinite) : [];
        const diskGalleryImages = readGalleryImagesFromFolder(t.image_folder);
        const galleryImages = mergeUniqueNumbers(dbGalleryImages, diskGalleryImages);

        return {
            id: t.slug,
            imageFolder: t.image_folder,
            card: {
                thumbnail: t.card_thumbnail,
                title: { en: t.title_en, es: t.title_es },
                shortDescription: { en: t.short_desc_en, es: t.short_desc_es },
                priceFrom: t.price_from
            },
            hero: {
                title: { en: t.title_en, es: t.title_es },
                subtitle: { en: t.subtitle_en, es: t.subtitle_es },
                description: { en: t.description_en, es: t.description_es },
                heroImage: t.hero_image
            },
            gallery: {
                images: galleryImages,
                title: { en: 'Gallery', es: 'Galería' }
            },
            pricing: {
                sectionTitle: { en: 'Pricing', es: 'Precios' },
                tableHeader: {
                    adults: {
                        en: t.price_adults_label_en || 'Number of Adults',
                        es: t.price_adults_label_es || 'Número de Adultos'
                    },
                    adultPrice: {
                        en: t.price_adult_price_label_en || 'Price per Adult (13+)',
                        es: t.price_adult_price_label_es || 'Precio por Adulto (13+)'
                    },
                    childPrice: {
                        en: t.price_child_price_label_en || 'Price per Child (5-12)',
                        es: t.price_child_price_label_es || 'Precio por Niño (5-12)'
                    }
                },
                tiers: pricing
                    .filter((p) => p.tour_id === tid)
                    .map((p) => ({ adults: p.adults, adultPrice: p.adult_price })),
                childPriceFlat: t.child_price_flat,
                freeChildNote: { en: t.free_child_note_en, es: t.free_child_note_es },
                groupNote: { en: t.group_note_en, es: t.group_note_es },
                pricingNote: { en: t.pricing_note_en, es: t.pricing_note_es }
            },
            includes: {
                sectionTitle: { en: 'What Is Included', es: 'Qué Incluye' },
                items: includes.filter((i) => i.tour_id === tid).map((i) => ({ en: i.text_en, es: i.text_es })),
                excludesTitle: { en: 'Not Included', es: 'No Incluye' },
                excludes: excludes.filter((e) => e.tour_id === tid).map((e) => ({ en: e.text_en, es: e.text_es }))
            },
            itinerary: {
                sectionTitle: { en: t.itinerary_title_en || 'Itinerary', es: t.itinerary_title_es || 'Itinerario' },
                steps: itinerary.filter((s) => s.tour_id === tid).map((s) => ({ en: s.text_en, es: s.text_es })),
                warning: { en: t.itinerary_warning_en, es: t.itinerary_warning_es },
                ...(t.combo_note_en ? { comboNote: { en: t.combo_note_en, es: t.combo_note_es } } : {})
            },
            addOns: {
                sectionTitle: { en: 'Add-On Options', es: 'Opciones Adicionales' },
                options: addons.filter((a) => a.tour_id === tid).map((a) => ({
                    id: a.slug,
                    title: { en: a.title_en, es: a.title_es },
                    description: { en: a.desc_en, es: a.desc_es },
                    pricePerPerson: a.price_per_person
                }))
            },
            packingList: {
                sectionTitle: { en: 'What to Bring', es: 'Qué Llevar' },
                items: packing.filter((p) => p.tour_id === tid).map((p) => ({ en: p.text_en, es: p.text_es, icon: p.icon }))
            },
            booking: {
                sectionTitle: { en: 'Booking Information', es: 'Información de Reservación' },
                description: { en: t.booking_desc_en, es: t.booking_desc_es }
            }
        };
    });

    res.json(result);
});

// GET single tour
app.get('/api/tours/:slug', (req, res) => {
    const t = db.prepare('SELECT * FROM tours WHERE slug = ?').get(req.params.slug);
    if (!t) return res.status(404).json({ error: 'Tour not found' });
    res.json(t);
});

// POST new tour (Admin)
app.post('/api/tours', requireAdmin, upload.any(), (req, res) => {
    try {
        const data = JSON.parse(req.body.data || '{}');
        const slug = sanitizeSlug(req.body.slug || data.slug || req.uploadSlug);
        const imageFolder = `imagenes/servicios/${slug}`;

        const insertTour = db.prepare(`
            INSERT INTO tours(
                slug, image_folder, card_thumbnail, title_en, title_es, short_desc_en, short_desc_es, price_from,
                subtitle_en, subtitle_es, description_en, description_es, hero_image,
                price_adults_label_en, price_adults_label_es, price_adult_price_label_en, price_adult_price_label_es,
                price_child_price_label_en, price_child_price_label_es, child_price_flat,
                free_child_note_en, free_child_note_es, group_note_en, group_note_es, pricing_note_en, pricing_note_es,
                itinerary_title_en, itinerary_title_es, itinerary_warning_en, itinerary_warning_es, combo_note_en, combo_note_es,
                booking_desc_en, booking_desc_es
            ) VALUES(
                ?,?,?,?,?,?,?,?,
                ?,?,?,?, ?,
                ?,?,?,?,
                ?,?, ?,
                ?,?,?,?, ?,?,
                ?,?,?,?, ?,?,
                ?,?
            )
        `);

        const uploadedNumbers = (req.files || [])
            .map((f) => safeInt(path.basename(f.filename, path.extname(f.filename)), NaN))
            .filter((n) => Number.isFinite(n));
        const uploadedGallery = uploadedNumbers.filter((n) => n >= 3).sort((a, b) => a - b);

        const requestedGallery = Array.isArray(data.gallery_images)
            ? data.gallery_images.map((n) => safeInt(n, NaN)).filter((n) => Number.isFinite(n) && n >= 1)
            : [];
        const galleryToSave = requestedGallery.length > 0 ? requestedGallery : uploadedGallery;

        let tourId;
        db.transaction(() => {
            const r = insertTour.run(
                slug,
                imageFolder,
                safeInt(data.card_thumbnail, 1),
                sanitizeText(data.title_en, 255),
                sanitizeText(data.title_es, 255),
                sanitizeText(data.short_desc_en, 1200),
                sanitizeText(data.short_desc_es, 1200),
                safeInt(data.price_from, 0),
                sanitizeText(data.subtitle_en, 500),
                sanitizeText(data.subtitle_es, 500),
                sanitizeText(data.description_en, 5000),
                sanitizeText(data.description_es, 5000),
                safeInt(data.hero_image, 1),
                sanitizeText(data.price_adults_label_en, 255),
                sanitizeText(data.price_adults_label_es, 255),
                sanitizeText(data.price_adult_price_label_en, 255),
                sanitizeText(data.price_adult_price_label_es, 255),
                sanitizeText(data.price_child_price_label_en, 255),
                sanitizeText(data.price_child_price_label_es, 255),
                safeInt(data.child_price_flat, 0),
                sanitizeText(data.free_child_note_en, 1200),
                sanitizeText(data.free_child_note_es, 1200),
                sanitizeText(data.group_note_en, 1200),
                sanitizeText(data.group_note_es, 1200),
                sanitizeText(data.pricing_note_en, 1200),
                sanitizeText(data.pricing_note_es, 1200),
                sanitizeText(data.itinerary_title_en, 255) || 'Itinerary',
                sanitizeText(data.itinerary_title_es, 255) || 'Itinerario',
                sanitizeText(data.itinerary_warning_en, 1200),
                sanitizeText(data.itinerary_warning_es, 1200),
                sanitizeText(data.combo_note_en, 1200) || null,
                sanitizeText(data.combo_note_es, 1200) || null,
                sanitizeText(data.booking_desc_en, 5000),
                sanitizeText(data.booking_desc_es, 5000)
            );

            tourId = r.lastInsertRowid;

            if (Array.isArray(data.pricing_tiers)) {
                const insPrice = db.prepare('INSERT INTO pricing_tiers(tour_id, adults, adult_price) VALUES(?,?,?)');
                data.pricing_tiers.forEach((p) => {
                    const adults = safeInt(p.adults, NaN);
                    const adultPrice = safeInt(p.adult_price, NaN);
                    if (Number.isFinite(adults) && Number.isFinite(adultPrice)) {
                        insPrice.run(tourId, adults, adultPrice);
                    }
                });
            }

            if (Array.isArray(data.includes)) {
                const insInc = db.prepare('INSERT INTO tour_includes(tour_id, text_en, text_es) VALUES(?,?,?)');
                data.includes.forEach((i) => insInc.run(tourId, sanitizeText(i.en, 1200), sanitizeText(i.es, 1200)));
            }

            if (Array.isArray(data.excludes)) {
                const insExc = db.prepare('INSERT INTO tour_excludes(tour_id, text_en, text_es) VALUES(?,?,?)');
                data.excludes.forEach((e) => insExc.run(tourId, sanitizeText(e.en, 1200), sanitizeText(e.es, 1200)));
            }

            if (Array.isArray(data.itinerary)) {
                const insIt = db.prepare('INSERT INTO itinerary_steps(tour_id, step_order, text_en, text_es) VALUES(?,?,?,?)');
                data.itinerary.forEach((it, idx) => {
                    insIt.run(tourId, idx + 1, sanitizeText(it.en, 1500), sanitizeText(it.es, 1500));
                });
            }

            if (Array.isArray(data.addons)) {
                const insAdd = db.prepare('INSERT INTO addons(tour_id, slug, title_en, title_es, desc_en, desc_es, price_per_person) VALUES(?,?,?,?,?,?,?)');
                data.addons.forEach((a) => {
                    insAdd.run(
                        tourId,
                        sanitizeSlug(a.slug),
                        sanitizeText(a.title_en, 255),
                        sanitizeText(a.title_es, 255),
                        sanitizeText(a.desc_en, 1200),
                        sanitizeText(a.desc_es, 1200),
                        safeInt(a.price_per_person, 0)
                    );
                });
            }

            if (Array.isArray(data.packing)) {
                const insPack = db.prepare('INSERT INTO packing_items(tour_id, text_en, text_es, icon) VALUES(?,?,?,?)');
                data.packing.forEach((p) => {
                    insPack.run(tourId, sanitizeText(p.en, 255), sanitizeText(p.es, 255), sanitizeText(p.icon, 50));
                });
            }

            if (galleryToSave.length > 0) {
                const insGal = db.prepare('INSERT INTO gallery_images(tour_id, image_num) VALUES(?,?)');
                galleryToSave.forEach((g) => insGal.run(tourId, g));
            }
        })();

        res.json({ status: 'ok', id: tourId, slug });
    } catch (e) {
        if (String(e.message || '').includes('UNIQUE constraint failed: tours.slug')) {
            return res.status(409).json({ error: 'Slug already exists' });
        }
        console.error('Error saving tour:', e);
        res.status(500).json({ error: e.message });
    }
});

// GET hotels
app.get('/api/hotels', (req, res) => {
    const h = db.prepare('SELECT name as n, zone as z FROM hotels ORDER BY zone, name').all();
    res.json(h);
});

// POST booking
app.post('/api/bookings', (req, res) => {
    const b = req.body || {};

    const payload = {
        name: sanitizeText(b.name, 180),
        email: sanitizeText(b.email, 180),
        phone: sanitizeText(b.phone, 64),
        date: sanitizeText(b.date, 40),
        pickup_time: sanitizeText(b.pickup_time, 40),
        hotel: sanitizeText(b.hotel, 220),
        comments: sanitizeText(b.comments, 1200),
        cart: Array.isArray(b.cart) ? b.cart : [],
        total: safeInt(b.total, NaN)
    };

    if (!payload.name || !payload.email || !payload.phone || !payload.date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!Number.isFinite(payload.total) || payload.total < 0) {
        return res.status(400).json({ error: 'Invalid total amount' });
    }
    if (payload.cart.length === 0) {
        return res.status(400).json({ error: 'Cart cannot be empty' });
    }

    const stmt = db.prepare(`
        INSERT INTO bookings(
            customer_name, customer_email, customer_phone, tour_date, pickup_time, hotel, comments, cart_json, total_usd, status
        ) VALUES(?,?,?,?,?,?,?,?,?,?)
    `);
    const r = stmt.run(
        payload.name,
        payload.email,
        payload.phone,
        payload.date,
        payload.pickup_time || '',
        payload.hotel || '',
        payload.comments || '',
        JSON.stringify(payload.cart),
        payload.total,
        'pending'
    );

    res.json({ id: r.lastInsertRowid, status: 'ok' });
});

// GET bookings (admin, summary without raw PII)
app.get('/api/bookings', requireAdmin, (req, res) => {
    const rows = db.prepare(`
        SELECT id, customer_name, customer_email, customer_phone, tour_date, pickup_time, hotel, comments, cart_json, total_usd, status, created_at
        FROM bookings
        ORDER BY created_at DESC
    `).all();

    const safeRows = rows.map((row) => {
        let itemsCount = 0;
        try {
            const parsed = JSON.parse(row.cart_json || '[]');
            itemsCount = Array.isArray(parsed) ? parsed.length : 0;
        } catch (_) {
            itemsCount = 0;
        }

        return {
            id: row.id,
            customer_name: sanitizeText(row.customer_name, 180),
            customer_email_masked: maskEmail(row.customer_email),
            customer_phone_masked: maskPhone(row.customer_phone),
            tour_date: row.tour_date,
            pickup_time: row.pickup_time,
            hotel_provided: Boolean(row.hotel),
            comments_provided: Boolean(row.comments),
            items_count: itemsCount,
            total_usd: row.total_usd,
            status: row.status,
            created_at: row.created_at
        };
    });

    res.json(safeRows);
});

// Optional full booking detail by id (admin only)
app.get('/api/bookings/:id', requireAdmin, (req, res) => {
    const id = safeInt(req.params.id, NaN);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid booking id' });

    const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Booking not found' });

    let cart = [];
    try {
        cart = JSON.parse(row.cart_json || '[]');
    } catch (_) {
        cart = [];
    }

    res.json({
        id: row.id,
        customer_name: row.customer_name,
        customer_email: row.customer_email,
        customer_phone: row.customer_phone,
        tour_date: row.tour_date,
        pickup_time: row.pickup_time,
        hotel: row.hotel,
        comments: row.comments,
        cart,
        total_usd: row.total_usd,
        status: row.status,
        created_at: row.created_at
    });
});

// Config endpoint
app.get('/api/config', (req, res) => {
    res.json({
        emailjs: {
            publicKey: 'adpBU-SgpefU02llA',
            serviceId: 'lindo_Tours',
            templateId: 'template_ms3160x'
        },
        whatsapp: { phone: '5219981440320' }
    });
});

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
    }
    if (err && err.message && err.message.includes('JPG/JPEG')) {
        return res.status(400).json({ error: err.message });
    }
    next(err);
});

app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Lindo Tours running on http://localhost:${PORT}`);
});
