CREATE TABLE IF NOT EXISTS tours(
id INTEGER PRIMARY KEY AUTOINCREMENT,slug TEXT UNIQUE NOT NULL,image_folder TEXT,
card_thumbnail INTEGER DEFAULT 1,title_en TEXT,title_es TEXT,short_desc_en TEXT,short_desc_es TEXT,price_from INTEGER,
subtitle_en TEXT,subtitle_es TEXT,description_en TEXT,description_es TEXT,hero_image INTEGER DEFAULT 1,
price_adults_label_en TEXT,price_adults_label_es TEXT,price_adult_price_label_en TEXT,price_adult_price_label_es TEXT,
price_child_price_label_en TEXT,price_child_price_label_es TEXT,
child_price_flat INTEGER,free_child_note_en TEXT,free_child_note_es TEXT,
group_note_en TEXT,group_note_es TEXT,pricing_note_en TEXT,pricing_note_es TEXT,
itinerary_title_en TEXT DEFAULT 'Itinerary',itinerary_title_es TEXT DEFAULT 'Itinerario',
itinerary_warning_en TEXT,itinerary_warning_es TEXT,combo_note_en TEXT,combo_note_es TEXT,
booking_desc_en TEXT,booking_desc_es TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE IF NOT EXISTS gallery_images(id INTEGER PRIMARY KEY AUTOINCREMENT,tour_id INTEGER NOT NULL,image_num INTEGER,FOREIGN KEY(tour_id) REFERENCES tours(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS pricing_tiers(id INTEGER PRIMARY KEY AUTOINCREMENT,tour_id INTEGER NOT NULL,adults INTEGER,adult_price INTEGER,FOREIGN KEY(tour_id) REFERENCES tours(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS tour_includes(id INTEGER PRIMARY KEY AUTOINCREMENT,tour_id INTEGER NOT NULL,text_en TEXT,text_es TEXT,FOREIGN KEY(tour_id) REFERENCES tours(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS tour_excludes(id INTEGER PRIMARY KEY AUTOINCREMENT,tour_id INTEGER NOT NULL,text_en TEXT,text_es TEXT,FOREIGN KEY(tour_id) REFERENCES tours(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS itinerary_steps(id INTEGER PRIMARY KEY AUTOINCREMENT,tour_id INTEGER NOT NULL,step_order INTEGER,text_en TEXT,text_es TEXT,FOREIGN KEY(tour_id) REFERENCES tours(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS addons(id INTEGER PRIMARY KEY AUTOINCREMENT,tour_id INTEGER NOT NULL,slug TEXT,title_en TEXT,title_es TEXT,desc_en TEXT,desc_es TEXT,price_per_person INTEGER,FOREIGN KEY(tour_id) REFERENCES tours(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS packing_items(id INTEGER PRIMARY KEY AUTOINCREMENT,tour_id INTEGER NOT NULL,text_en TEXT,text_es TEXT,icon TEXT,FOREIGN KEY(tour_id) REFERENCES tours(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS hotels(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,zone TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS bookings(id INTEGER PRIMARY KEY AUTOINCREMENT,customer_name TEXT,customer_email TEXT,customer_phone TEXT,tour_date TEXT,pickup_time TEXT,hotel TEXT,comments TEXT,cart_json TEXT,total_usd INTEGER,status TEXT DEFAULT 'pending',created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
