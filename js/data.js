// ============================================
// DATOS & TRADUCCIONES
// ============================================

const EXCHANGE_RATES = {
    USD: { rate: 1, symbol: '$' },
    MXN: { rate: 17.47, symbol: '$' },
    EUR: { rate: 0.84, symbol: '€' }
};

const SERVICES = {
    cenotes: {
        id: 'cenotes',
        name: { es: 'Cenotes y Playa del Carmen', en: 'Cenotes and Playa del Carmen' },
        description: {
            es: 'Tulum es misticismo, historia, naturaleza, aventura y arte. En este tour podrás disfrutar de una variedad de cenotes, visitarás Casa Tortuga y Multun Ha.',
            en: 'Tulum is mysticism, history, nature, adventure and art. In this tour you will enjoy a variety of cenotes, visiting Casa Tortuga and Multun Ha.'
        },
        subtitle: {
            es: 'Tour de cenotes más visita a Multun Ha',
            en: 'Cenotes Tour plus visit to Multun Ha'
        },
        badges: [
            { text: { es: 'Super Promoción', en: 'Super Deal' }, icon: '🔥', class: 'promo' },
        ],
        // Image logic: assumes standard naming 1.jpg to count
        imageFolder: 'imagenes/servicios/Cenotes_y_Playa_del_Carmen',
        imageCount: 8,
        priceType: 'single',
        basePrice: 50,
        includes: {
            sectionTitle: { es: 'Incluye', en: 'Includes' },
            foodTitle: { es: '🍽️ Comida Buffet:', en: '🍽️ Buffet Meal:' },
            items: [
                { es: 'Cochinita Pibil', en: 'Cochinita Pibil' },
                { es: 'Fajitas de Pollo', en: 'Chicken Fajitas' },
                { es: 'Poc Chuc', en: 'Poc Chuc' },
                { es: 'Pollo Maya', en: 'Mayan Chicken' },
                { es: 'Fruta', en: 'Fruit' },
                { es: 'Postre', en: 'Dessert' }
            ],
            main: [
                { icon: '🚐', es: 'Transporte', en: 'Transportation' },
                { icon: '🎟️', es: 'Entradas', en: 'Tickets' },
                { icon: '👤', es: 'Guía', en: 'Guide' }
            ],
            notIncluded: { es: 'No incluye bebidas', en: 'Drinks not included' }
        }
    },
    clearboat: {
        id: 'clearboat',
        name: { es: 'Clear Boat ⛵ Cozumel', en: 'Clear Boat ⛵ Cozumel' },
        description: {
            es: 'Vive una experiencia única. Clear Boat, lo más nuevo en Cozumel. Asómbrate con la vista del fondo marino mientras visitas los barcos hundidos.',
            en: 'Live a unique experience. Clear Boat, the newest in Cozumel. Be amazed by the seabed view while visiting sunken ships.'
        },
        subtitle: {
            es: 'El único tour en lancha transparente',
            en: 'The only transparent boat tour'
        },
        badges: [
            { text: { es: 'Experiencia Única', en: 'Unique Experience' }, icon: '💙', class: 'promo' }, // Reusing promo class for visual consistency or define new
            { text: { es: '¡Lo más nuevo!', en: 'Brand New!' }, icon: '🤩', class: 'new' }
        ],
        imageFolder: 'imagenes/servicios/Clear_Boat_Cozumel',
        imageCount: 5,
        priceType: 'dual',
        adultPrice: 126,
        childPrice: 120,
        includes: {
            sectionTitle: { es: 'Nuestro Tour Incluye', en: 'Our Tour Includes' },
            items: [
                { icon: '🚐', es: 'Transporte con A/C', en: 'A/C Transportation' },
                { icon: '🛳️', es: 'Ferry incluido', en: 'Ferry included' },
                { icon: '🚤', es: '1:30 hrs Clear Boat', en: '1:30 hrs Clear Boat' },
                { icon: '🤿', es: 'Snorkel en arrecife', en: 'Reef Snorkeling' },
                { icon: '🍹', es: '4 bebidas a bordo', en: '4 drinks on board' },
                { icon: '🍽️', es: 'Comida incluida', en: 'Meal included' }
            ],
            main: [
                { icon: '⛑️', es: 'Protocolos de Sanidad', en: 'Health Protocols', style: 'background: linear-gradient(135deg, var(--ocean), var(--ocean-dark));' }
            ],
            notIncluded: { es: 'No incluye impuesto de muelle', en: 'Dock tax not included' },
            warning: {
                title: { es: 'IMPORTANTE', en: 'IMPORTANT' },
                text: { es: '❌ NO TOCAR CORALES NI ESTRELLAS DE MAR 😍', en: '❌ DO NOT TOUCH CORALS OR STARFISH 😍' }
            }
        }
    }
};
