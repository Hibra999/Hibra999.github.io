const express = require('express'), cors = require('cors'), path = require('path'), Database = require('better-sqlite3');
const multer = require('multer');
const app = express(), PORT = process.env.PORT || 3000;
const db = new Database(path.join(__dirname, 'db', 'lindotours.db'));
db.pragma('journal_mode=WAL'); db.pragma('foreign_keys=ON');

// Init DB
const fs = require('fs');
const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
db.exec(schema);
const seedFile = path.join(__dirname, 'db', 'seed.sql');
if (fs.existsSync(seedFile)) { const c = db.prepare("SELECT count(*) as c FROM tours").get(); if (c.c === 0) { db.exec(fs.readFileSync(seedFile, 'utf8')); console.log('DB seeded'); } }

app.use(cors()); app.use(express.json()); app.use(express.static(path.join(__dirname, 'public')));

// ---- API ROUTES ----

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const slug = req.body.slug || 'new-tour-' + Date.now();
        const dir = path.join(__dirname, 'public', 'imagenes', slug);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });
// GET all tours (catalog)
app.get('/api/tours', (req, res) => {
    const tours = db.prepare(`SELECT t.*,GROUP_CONCAT(DISTINCT g.image_num) as gallery_images FROM tours t LEFT JOIN gallery_images g ON g.tour_id=t.id GROUP BY t.id`).all();
    const pricing = db.prepare('SELECT * FROM pricing_tiers ORDER BY tour_id,adults').all();
    const includes = db.prepare('SELECT * FROM tour_includes ORDER BY tour_id,id').all();
    const excludes = db.prepare('SELECT * FROM tour_excludes ORDER BY tour_id,id').all();
    const itinerary = db.prepare('SELECT * FROM itinerary_steps ORDER BY tour_id,step_order').all();
    const addons = db.prepare('SELECT * FROM addons ORDER BY tour_id,id').all();
    const packing = db.prepare('SELECT * FROM packing_items ORDER BY tour_id,id').all();
    const result = tours.map(t => {
        const tid = t.id;
        return {
            id: t.slug, imageFolder: t.image_folder,
            card: { thumbnail: t.card_thumbnail, title: { en: t.title_en, es: t.title_es }, shortDescription: { en: t.short_desc_en, es: t.short_desc_es }, priceFrom: t.price_from },
            hero: { title: { en: t.title_en, es: t.title_es }, subtitle: { en: t.subtitle_en, es: t.subtitle_es }, description: { en: t.description_en, es: t.description_es }, heroImage: t.hero_image },
            gallery: { images: t.gallery_images ? t.gallery_images.split(',').map(Number) : [], title: { en: 'Gallery', es: 'Galeria' } },
            pricing: {
                sectionTitle: { en: 'Pricing', es: 'Precios' },
                tableHeader: { adults: { en: t.price_adults_label_en || 'Number of Adults', es: t.price_adults_label_es || 'Numero de Adultos' }, adultPrice: { en: t.price_adult_price_label_en || 'Price per Adult (13+)', es: t.price_adult_price_label_es || 'Precio por Adulto (13+)' }, childPrice: { en: t.price_child_price_label_en || 'Price per Child (5-12)', es: t.price_child_price_label_es || 'Precio por Nino (5-12)' } },
                tiers: pricing.filter(p => p.tour_id === tid).map(p => ({ adults: p.adults, adultPrice: p.adult_price })),
                childPriceFlat: t.child_price_flat,
                freeChildNote: { en: t.free_child_note_en, es: t.free_child_note_es },
                groupNote: { en: t.group_note_en, es: t.group_note_es },
                pricingNote: { en: t.pricing_note_en, es: t.pricing_note_es }
            },
            includes: {
                sectionTitle: { en: 'What Is Included', es: 'Que Incluye' },
                items: includes.filter(i => i.tour_id === tid).map(i => ({ en: i.text_en, es: i.text_es })),
                excludesTitle: { en: 'Not Included', es: 'No Incluido' },
                excludes: excludes.filter(e => e.tour_id === tid).map(e => ({ en: e.text_en, es: e.text_es }))
            },
            itinerary: {
                sectionTitle: { en: t.itinerary_title_en || 'Itinerary', es: t.itinerary_title_es || 'Itinerario' },
                steps: itinerary.filter(s => s.tour_id === tid).map(s => ({ en: s.text_en, es: s.text_es })),
                warning: { en: t.itinerary_warning_en, es: t.itinerary_warning_es },
                ...(t.combo_note_en ? { comboNote: { en: t.combo_note_en, es: t.combo_note_es } } : {})
            },
            addOns: {
                sectionTitle: { en: 'Add-On Options', es: 'Opciones Adicionales' },
                options: addons.filter(a => a.tour_id === tid).map(a => ({ id: a.slug, title: { en: a.title_en, es: a.title_es }, description: { en: a.desc_en, es: a.desc_es }, pricePerPerson: a.price_per_person }))
            },
            packingList: {
                sectionTitle: { en: 'What to Bring', es: 'Que Llevar' },
                items: packing.filter(p => p.tour_id === tid).map(p => ({ en: p.text_en, es: p.text_es, icon: p.icon }))
            },
            booking: { sectionTitle: { en: 'Booking Information', es: 'Informacion de Reservacion' }, description: { en: t.booking_desc_en, es: t.booking_desc_es } }
        };
    });
    res.json(result);
});

// GET single tour
app.get('/api/tours/:slug', (req, res) => {
    const t = db.prepare('SELECT * FROM tours WHERE slug=?').get(req.params.slug);
    if (!t) return res.status(404).json({ error: 'Tour not found' });
    res.json(t);
});

// POST new tour (Admin)
app.post('/api/tours', upload.any(), (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        const slug = req.body.slug || data.slug;
        const imageFolder = `imagenes/${slug}`;

        const insertTour = db.prepare(`INSERT INTO tours(
            slug, image_folder, card_thumbnail, title_en, title_es, short_desc_en, short_desc_es, price_from,
            subtitle_en, subtitle_es, description_en, description_es, hero_image,
            price_adults_label_en, price_adults_label_es, price_adult_price_label_en, price_adult_price_label_es,
            price_child_price_label_en, price_child_price_label_es, child_price_flat,
            free_child_note_en, free_child_note_es, group_note_en, group_note_es, pricing_note_en, pricing_note_es,
            itinerary_title_en, itinerary_title_es, itinerary_warning_en, itinerary_warning_es, combo_note_en, combo_note_es,
            booking_desc_en, booking_desc_es
        ) VALUES(
            ?,?,?,?,?,?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,
            ?,?,?,
            ?,?,?,?,?,
            ?,?,?,?,?,
            ?,?
        )`);

        let tourId;
        db.transaction(() => {
            const r = insertTour.run(
                slug, imageFolder, data.card_thumbnail || 1, data.title_en, data.title_es, data.short_desc_en, data.short_desc_es, data.price_from,
                data.subtitle_en, data.subtitle_es, data.description_en, data.description_es, data.hero_image || 1,
                data.price_adults_label_en || '', data.price_adults_label_es || '', data.price_adult_price_label_en || '', data.price_adult_price_label_es || '',
                data.price_child_price_label_en || '', data.price_child_price_label_es || '', data.child_price_flat || 0,
                data.free_child_note_en || '', data.free_child_note_es || '', data.group_note_en || '', data.group_note_es || '', data.pricing_note_en || '', data.pricing_note_es || '',
                data.itinerary_title_en || 'Itinerary', data.itinerary_title_es || 'Itinerario', data.itinerary_warning_en || '', data.itinerary_warning_es || '', data.combo_note_en || null, data.combo_note_es || null,
                data.booking_desc_en || '', data.booking_desc_es || ''
            );
            tourId = r.lastInsertRowid;

            // Pricing
            if (data.pricing_tiers) {
                const insPrice = db.prepare('INSERT INTO pricing_tiers(tour_id, adults, adult_price) VALUES(?,?,?)');
                data.pricing_tiers.forEach(p => insPrice.run(tourId, p.adults, p.adult_price));
            }
            // Includes
            if (data.includes) {
                const insInc = db.prepare('INSERT INTO tour_includes(tour_id, text_en, text_es) VALUES(?,?,?)');
                data.includes.forEach(i => insInc.run(tourId, i.en, i.es));
            }
            // Excludes
            if (data.excludes) {
                const insExc = db.prepare('INSERT INTO tour_excludes(tour_id, text_en, text_es) VALUES(?,?,?)');
                data.excludes.forEach(e => insExc.run(tourId, e.en, e.es));
            }
            // Itinerary
            if (data.itinerary) {
                const insIt = db.prepare('INSERT INTO itinerary_steps(tour_id, step_order, text_en, text_es) VALUES(?,?,?,?)');
                data.itinerary.forEach((it, idx) => insIt.run(tourId, idx + 1, it.en, it.es));
            }
            // Addons
            if (data.addons) {
                const insAdd = db.prepare('INSERT INTO addons(tour_id, slug, title_en, title_es, desc_en, desc_es, price_per_person) VALUES(?,?,?,?,?,?,?)');
                data.addons.forEach(a => insAdd.run(tourId, a.slug, a.title_en, a.title_es, a.desc_en, a.desc_es, a.price_per_person));
            }
            // Packing
            if (data.packing) {
                const insPack = db.prepare('INSERT INTO packing_items(tour_id, text_en, text_es, icon) VALUES(?,?,?,?)');
                data.packing.forEach(p => insPack.run(tourId, p.en, p.es, p.icon));
            }
            // Gallery
            if (data.gallery_images) {
                // e.g. [1, 2, 3] integers mapping to 1.jpg, 2.jpg
                const insGal = db.prepare('INSERT INTO gallery_images(tour_id, image_num) VALUES(?,?)');
                data.gallery_images.forEach(g => insGal.run(tourId, g));
            }
        })();

        res.json({ status: 'ok', id: tourId, slug });
    } catch (e) {
        console.error('Error saving tour:', e);
        res.status(500).json({ error: e.message });
    }
});

// GET hotels
app.get('/api/hotels', (req, res) => {
    const h = db.prepare('SELECT name as n,zone as z FROM hotels ORDER BY zone,name').all();
    res.json(h);
});

// POST booking
app.post('/api/bookings', (req, res) => {
    const b = req.body;
    const stmt = db.prepare(`INSERT INTO bookings(customer_name,customer_email,customer_phone,tour_date,pickup_time,hotel,comments,cart_json,total_usd,status) VALUES(?,?,?,?,?,?,?,?,?,?)`);
    const r = stmt.run(b.name, b.email, b.phone, b.date, b.pickup_time, b.hotel || '', b.comments || '', JSON.stringify(b.cart), b.total, 'pending');
    res.json({ id: r.lastInsertRowid, status: 'ok' });
});

// GET bookings (admin)
app.get('/api/bookings', (req, res) => {
    const rows = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all();
    res.json(rows);
});

// Config endpoint
app.get('/api/config', (req, res) => {
    res.json({ emailjs: { publicKey: 'adpBU-SgpefU02llA', serviceId: 'lindo_Tours', templateId: 'template_ms3160x' }, whatsapp: { phone: '5219981440320' } });
});

app.get('/{*path}', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`Lindo Tours running on http://localhost:${PORT}`));
