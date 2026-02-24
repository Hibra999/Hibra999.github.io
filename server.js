const express = require('express'), cors = require('cors'), path = require('path'), Database = require('better-sqlite3');
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
