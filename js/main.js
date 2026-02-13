
// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================
let state = {
    language: 'es',
    currency: 'USD',
    quantities: {},
    cart: [],
    checkoutMode: false
};

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    loadState();

    // Renderizar servicios dinámicamente
    renderServices();

    // Inicializar componentes
    initLanguage();
    initCurrency();
    initDatePicker();
    initEmailJS();

    // Actualizar UI
    updateAllPrices();
    updateCartUI();
});

// ============================================
// RENDERIZADO DINÁMICO
// ============================================
function renderServices() {
    const container = document.getElementById('services-container');
    container.innerHTML = ''; // Limpiar

    Object.values(SERVICES).forEach(service => {
        // Inicializar cantidades en el estado si no existen
        if (service.priceType === 'single') {
            if (state.quantities[service.id] === undefined) state.quantities[service.id] = 0;
        } else {
            if (state.quantities[`${service.id}-adult`] === undefined) state.quantities[`${service.id}-adult`] = 0;
            if (state.quantities[`${service.id}-child`] === undefined) state.quantities[`${service.id}-child`] = 0;
        }

        const article = document.createElement('article');
        article.className = 'service-card';
        article.dataset.service = service.id;

        // Construir HTML del Servicio
        let slidesHtml = '';
        for (let i = 1; i <= service.imageCount; i++) {
            slidesHtml += `<div class="slide" style="background-image: url('${service.imageFolder}/${i}.jpg');"></div>`;
        }

        let badgesHtml = service.badges.map(b =>
            `<span class="badge ${b.class}">${b.icon} <span data-es="${b.text.es}" data-en="${b.text.en}">${b.text[state.language]}</span></span>`
        ).join('');

        let includesHtml = '';
        if (service.includes.items) {
            includesHtml += `<div class="includes-list">` +
                service.includes.items.map(item => {
                    const icon = item.icon ? `<span>${item.icon}</span>` : '<span>✨</span>';
                    return `<div class="include-item">${icon}<span data-es="${item.es}" data-en="${item.en}">${item[state.language]}</span></div>`;
                }).join('') + `</div>`;
        }

        let mainIncludesHtml = '';
        if (service.includes.main) {
            mainIncludesHtml += `<div class="main-includes">` +
                service.includes.main.map(item => {
                    const style = item.style ? `style="${item.style}"` : '';
                    return `<div class="main-include" ${style}><span>${item.icon}</span><span data-es="${item.es}" data-en="${item.en}">${item[state.language]}</span></div>`
                }).join('') + `</div>`;
        }

        // Sección de Precios
        let priceSectionHtml = '';
        const sectionClass = service.priceType === 'dual' ? 'price-section ocean' : 'price-section';
        const btnClass = service.priceType === 'dual' ? 'add-to-cart-btn ocean' : 'add-to-cart-btn';

        if (service.priceType === 'single') {
            priceSectionHtml = `
                <div class="${sectionClass}" data-service="${service.id}">
                    <div class="price-row">
                        <div class="price-info">
                            <span class="price-label" data-es="Precio por persona" data-en="Price per person">Precio por persona</span>
                            <span class="price-currency" data-currency-symbol>$</span>
                            <span class="price-amount" data-price="${service.basePrice}">${service.basePrice}</span>
                            <span class="price-currency" data-currency-code>USD</span>
                        </div>
                        <div class="quantity-selector">
                            <button class="qty-btn" onclick="updateQuantity('${service.id}', -1)">−</button>
                            <span class="qty-value" id="qty-${service.id}">${state.quantities[service.id]}</span>
                            <button class="qty-btn" onclick="updateQuantity('${service.id}', 1)">+</button>
                        </div>
                    </div>
                    <div class="subtotal-row">
                         <span class="subtotal-label" data-es="Subtotal:" data-en="Subtotal:">Subtotal:</span>
                         <span class="subtotal-amount" id="subtotal-${service.id}">$0</span>
                    </div>
                    <button class="${btnClass}" id="btn-${service.id}" onclick="addToCart('${service.id}')" disabled>
                        <span>🛒</span>
                        <span data-es="Agregar al Carrito" data-en="Add to Cart">Agregar al Carrito</span>
                    </button>
                </div>
            `;
        } else {
            priceSectionHtml = `
                <div class="${sectionClass}" data-service="${service.id}">
                    <div class="price-row">
                         <div class="price-info">
                            <span class="price-label" data-es="👨 Adulto" data-en="👨 Adult">👨 Adulto</span>
                            <span class="price-currency" data-currency-symbol>$</span>
                            <span class="price-amount" data-price="${service.adultPrice}">${service.adultPrice}</span>
                            <span class="price-currency" data-currency-code>USD</span>
                         </div>
                         <div class="quantity-selector">
                            <button class="qty-btn" onclick="updateQuantity('${service.id}-adult', -1)">−</button>
                            <span class="qty-value" id="qty-${service.id}-adult">${state.quantities[`${service.id}-adult`]}</span>
                            <button class="qty-btn" onclick="updateQuantity('${service.id}-adult', 1)">+</button>
                        </div>
                    </div>
                    <div class="price-row">
                         <div class="price-info">
                            <span class="price-label" data-es="👧 Menor" data-en="👧 Child">👧 Menor</span>
                            <span class="price-currency" data-currency-symbol>$</span>
                            <span class="price-amount" data-price="${service.childPrice}">${service.childPrice}</span>
                            <span class="price-currency" data-currency-code>USD</span>
                         </div>
                         <div class="quantity-selector">
                            <button class="qty-btn" onclick="updateQuantity('${service.id}-child', -1)">−</button>
                            <span class="qty-value" id="qty-${service.id}-child">${state.quantities[`${service.id}-child`]}</span>
                            <button class="qty-btn" onclick="updateQuantity('${service.id}-child', 1)">+</button>
                        </div>
                    </div>
                    <div class="subtotal-row">
                         <span class="subtotal-label" data-es="Subtotal:" data-en="Subtotal:">Subtotal:</span>
                         <span class="subtotal-amount" id="subtotal-${service.id}">$0</span>
                    </div>
                    <button class="${btnClass}" id="btn-${service.id}" onclick="addToCart('${service.id}')" disabled>
                        <span>🛒</span>
                        <span data-es="Agregar al Carrito" data-en="Add to Cart">Agregar al Carrito</span>
                    </button>
                </div>
            `;
        }

        // Warning Box (if exists)
        let warningHtml = '';
        if (service.includes.warning) {
            warningHtml = `
             <div class="warning-box">
                <h5>⚠️ <span data-es="${service.includes.warning.title.es}" data-en="${service.includes.warning.title.en}">${service.includes.warning.title[state.language]}</span></h5>
                <p data-es="${service.includes.warning.text.es}" data-en="${service.includes.warning.text.en}">${service.includes.warning.text[state.language]}</p>
             </div>`;
        }

        const foodTitleHtml = service.includes.foodTitle ?
            `<p class="food-title" data-es="${service.includes.foodTitle.es}" data-en="${service.includes.foodTitle.en}">${service.includes.foodTitle[state.language]}</p>` : '';

        const notIncludedHtml = service.includes.notIncluded ?
            `<p class="not-included"><span>🚫</span><span data-es="${service.includes.notIncluded.es}" data-en="${service.includes.notIncluded.en}">${service.includes.notIncluded[state.language]}</span></p>` : '';

        article.innerHTML = `
            <div class="slider-container">
                <div class="slider" id="slider-${service.id}">
                    ${slidesHtml}
                </div>
                <button class="slider-btn prev" onclick="moveSlide('slider-${service.id}', -1)">❮</button>
                <button class="slider-btn next" onclick="moveSlide('slider-${service.id}', 1)">❯</button>
                <div class="slider-dots" id="dots-${service.id}"></div>
            </div>

            <div class="service-content">
                <div class="badges">${badgesHtml}</div>
                <h2 class="service-title" data-es="${service.name.es}" data-en="${service.name.en}">${service.name[state.language]}</h2>
                <h3 class="service-subtitle">😍 <span data-es="${service.subtitle.es}" data-en="${service.subtitle.en}">${service.subtitle[state.language]}</span> ✨</h3>
                <p class="service-description" data-es="${service.description.es}" data-en="${service.description.en}">
                    ${service.description[state.language]}
                </p>

                <div class="includes-section">
                    <h4 class="includes-title">✅ <span data-es="${service.includes.sectionTitle.es}" data-en="${service.includes.sectionTitle.en}">${service.includes.sectionTitle[state.language]}</span></h4>
                    ${foodTitleHtml}
                    ${includesHtml}
                    ${mainIncludesHtml}
                    ${notIncludedHtml}
                    ${warningHtml}
                </div>

                ${priceSectionHtml}
            </div>
        `;

        container.appendChild(article);

        // Inicializar slider para este servicio
        initSingleSlider(service.id, service.imageCount);
    });
}

// ============================================
// LOGICA DE SLIDERS
// ============================================
const sliders = {};

function initSingleSlider(id, count) {
    const sliderId = `slider-${id}`;
    sliders[sliderId] = { current: 0, total: count };

    const dotsContainer = document.getElementById(`dots-${id}`);
    if (dotsContainer) {
        for (let i = 0; i < count; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.onclick = () => goToSlide(sliderId, i);
            dotsContainer.appendChild(dot);
        }
    }

    // Auto-slide 
    // Random offset to avoid syncing
    const delay = 5000 + Math.random() * 1000;
    setInterval(() => moveSlide(sliderId, 1), delay);
}

function goToSlide(sliderId, index) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;

    sliders[sliderId].current = index;
    slider.style.transform = `translateX(-${index * 100}%)`;

    const dotsId = sliderId.replace('slider', 'dots');
    const dotsContainer = document.getElementById(dotsId);
    if (dotsContainer) {
        dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
}

function moveSlide(sliderId, direction) {
    if (!sliders[sliderId]) return;
    const { current, total } = sliders[sliderId];
    let newSlide = current + direction;
    if (newSlide < 0) newSlide = total - 1;
    if (newSlide >= total) newSlide = 0;
    goToSlide(sliderId, newSlide);
}


// ============================================
// PERSISTENCIA & LENGUAJE
// ============================================
function loadState() {
    try {
        const savedCart = localStorage.getItem('lindotours_cart');
        const savedLang = localStorage.getItem('lindotours_language');
        const savedCurrency = localStorage.getItem('lindotours_currency');

        if (savedCart) state.cart = JSON.parse(savedCart);
        if (savedLang) state.language = savedLang;
        if (savedCurrency) state.currency = savedCurrency;
    } catch (e) {
        console.error('Error loading state:', e);
    }
}

function saveState() {
    try {
        localStorage.setItem('lindotours_cart', JSON.stringify(state.cart));
        localStorage.setItem('lindotours_language', state.language);
        localStorage.setItem('lindotours_currency', state.currency);
    } catch (e) { console.error(e); }
}

function initLanguage() {
    const selector = document.getElementById('language-selector');
    selector.value = state.language;
    changeLanguage(state.language);

    selector.addEventListener('change', (e) => {
        state.language = e.target.value;
        changeLanguage(state.language);
        saveState();
        // Re-render to update dynamic contents not controlled by data attributes (if any remain)
        // Note: Currently most content has data-attributes so re-render isn't strictly necessary for all, 
        // but cleaner for JS-injected content.
        renderServices();
        updateAllPrices(); // Re-bind prices
    });
}

function changeLanguage(lang) {
    document.querySelectorAll('[data-es]').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`);
    });
    document.documentElement.lang = lang;
    if (window.tourDatePicker) {
        window.tourDatePicker.set('locale', lang === 'es' ? 'es' : 'default');
    }
}

function initCurrency() {
    const selector = document.getElementById('currency-selector');
    selector.value = state.currency;
    selector.addEventListener('change', (e) => {
        state.currency = e.target.value;
        updateAllPrices();
        saveState();
    });
}

function updateAllPrices() {
    const { rate, symbol } = EXCHANGE_RATES[state.currency];

    document.querySelectorAll('[data-price]').forEach(el => {
        const basePrice = parseFloat(el.getAttribute('data-price'));
        el.textContent = Math.round(basePrice * rate);
    });

    document.querySelectorAll('[data-currency-symbol]').forEach(el => el.textContent = symbol);
    document.querySelectorAll('[data-currency-code]').forEach(el => el.textContent = state.currency);

    Object.keys(SERVICES).forEach(id => updateSubtotal(id));
    updateCartTotal();
}

function convertPrice(usdPrice) {
    const { rate, symbol } = EXCHANGE_RATES[state.currency];
    return `${symbol}${Math.round(usdPrice * rate)} ${state.currency}`;
}


// ============================================
// CANTIDADES Y CARRITO
// ============================================
function updateQuantity(id, change) {
    const currentQty = state.quantities[id] || 0;
    const newQty = Math.max(0, Math.min(20, currentQty + change));
    state.quantities[id] = newQty;

    const qtyElement = document.getElementById(`qty-${id}`);
    if (qtyElement) qtyElement.textContent = newQty;

    // Find service base ID
    const serviceId = id.split('-')[0];
    updateSubtotal(serviceId);
}

function updateSubtotal(serviceId) {
    const service = SERVICES[serviceId];
    if (!service) return;

    const { rate, symbol } = EXCHANGE_RATES[state.currency];
    let subtotal = 0;

    if (service.priceType === 'single') {
        const qty = state.quantities[serviceId] || 0;
        subtotal = qty * service.basePrice;
        const btn = document.getElementById(`btn-${serviceId}`);
        if (btn) btn.disabled = qty === 0;
    } else {
        const adultQty = state.quantities[`${serviceId}-adult`] || 0;
        const childQty = state.quantities[`${serviceId}-child`] || 0;
        subtotal = (adultQty * service.adultPrice) + (childQty * service.childPrice);
        const btn = document.getElementById(`btn-${serviceId}`);
        if (btn) btn.disabled = (adultQty + childQty) === 0;
    }

    const subtotalElement = document.getElementById(`subtotal-${serviceId}`);
    if (subtotalElement) subtotalElement.textContent = `${symbol}${Math.round(subtotal * rate)}`;
}

function addToCart(serviceId) {
    const service = SERVICES[serviceId];
    const lang = state.language;

    if (service.priceType === 'single') {
        const qty = state.quantities[serviceId];
        if (qty === 0) return;

        const existingIndex = state.cart.findIndex(item => item.id === serviceId);
        if (existingIndex >= 0) {
            state.cart[existingIndex].quantity += qty;
            state.cart[existingIndex].subtotalUSD = state.cart[existingIndex].quantity * service.basePrice;
        } else {
            state.cart.push({
                id: serviceId,
                name: service.name[lang],
                image: `${service.imageFolder}/1.jpg`,
                quantity: qty,
                priceUSD: service.basePrice,
                subtotalUSD: qty * service.basePrice,
                type: 'persons'
            });
        }

        state.quantities[serviceId] = 0;
        document.getElementById(`qty-${serviceId}`).textContent = '0';

    } else {
        const adults = state.quantities[`${serviceId}-adult`];
        const children = state.quantities[`${serviceId}-child`];

        if (adults === 0 && children === 0) return;

        const subtotal = (adults * service.adultPrice) + (children * service.childPrice);
        const existingIndex = state.cart.findIndex(item => item.id === serviceId);

        if (existingIndex >= 0) {
            state.cart[existingIndex].adults += adults;
            state.cart[existingIndex].children += children;
            state.cart[existingIndex].subtotalUSD =
                (state.cart[existingIndex].adults * service.adultPrice) +
                (state.cart[existingIndex].children * service.childPrice);
        } else {
            state.cart.push({
                id: serviceId,
                name: service.name[lang],
                image: `${service.imageFolder}/1.jpg`,
                adults: adults,
                children: children,
                adultPriceUSD: service.adultPrice,
                childPriceUSD: service.childPrice,
                subtotalUSD: subtotal,
                type: 'dual'
            });
        }

        state.quantities[`${serviceId}-adult`] = 0;
        state.quantities[`${serviceId}-child`] = 0;
        document.getElementById(`qty-${serviceId}-adult`).textContent = '0';
        document.getElementById(`qty-${serviceId}-child`).textContent = '0';
    }

    updateSubtotal(serviceId);
    saveState();
    updateCartUI();

    showToast('success',
        lang === 'es' ? '¡Agregado!' : 'Added!',
        lang === 'es' ? 'Tour agregado al carrito' : 'Tour added to cart'
    );

    // Animation
    const btn = document.getElementById(`btn-${serviceId}`);
    if (btn) {
        btn.classList.add('added');
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<span>✓</span><span>' + (lang === 'es' ? 'Agregado' : 'Added') + '</span>';
        setTimeout(() => {
            btn.classList.remove('added');
            btn.innerHTML = originalContent;
        }, 1500);
    }
}

function removeFromCart(index) {
    state.cart.splice(index, 1);
    saveState();
    updateCartUI();
    showToast('info',
        state.language === 'es' ? 'Eliminado' : 'Removed',
        state.language === 'es' ? 'Tour eliminado del carrito' : 'Tour removed from cart'
    );
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const totalSection = document.getElementById('cart-total-section');
    const checkoutBtn = document.getElementById('checkout-btn');
    const lang = state.language;

    let totalItems = 0;
    state.cart.forEach(item => {
        if (item.type === 'dual') {
            totalItems += (item.adults || 0) + (item.children || 0);
        } else {
            totalItems += item.quantity || 0;
        }
    });

    cartCount.textContent = totalItems;
    cartCount.classList.toggle('empty', totalItems === 0);

    if (state.cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <span>🛒</span>
                <p>${lang === 'es' ? 'Tu carrito está vacío' : 'Your cart is empty'}</p>
            </div>`;
        totalSection.style.display = 'none';
        checkoutBtn.style.display = 'none';

        // Reset checkout visibility
        document.getElementById('checkout-form').classList.remove('active');
        document.getElementById('send-email-btn').style.display = 'none';
        document.getElementById('send-whatsapp-btn').style.display = 'none';
        state.checkoutMode = false;
    } else {
        let html = '';
        state.cart.forEach((item, index) => {
            let qtyText = '';
            if (item.type === 'dual') {
                const parts = [];
                if (item.adults > 0) parts.push(`${item.adults} ${lang === 'es' ? 'adulto(s)' : 'adult(s)'}`);
                if (item.children > 0) parts.push(`${item.children} ${lang === 'es' ? 'menor(es)' : 'child(ren)'}`);
                qtyText = parts.join(', ');
            } else {
                qtyText = `${item.quantity} ${lang === 'es' ? 'persona(s)' : 'person(s)'}`;
            }

            html += `
                <div class="cart-item">
                    <div class="cart-item-image" style="background-image: url('${item.image}');"></div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-qty">${qtyText}</div>
                    </div>
                    <div class="cart-item-price">${convertPrice(item.subtotalUSD)}</div>
                    <button class="cart-item-remove" onclick="removeFromCart(${index})">×</button>
                </div>`;
        });
        cartItems.innerHTML = html;
        totalSection.style.display = 'flex';
        checkoutBtn.style.display = state.checkoutMode ? 'none' : 'flex';

        // Ensure buttons visibility is correct if in checkout mode
        if (state.checkoutMode) {
            document.getElementById('checkout-form').classList.add('active');
            document.getElementById('send-email-btn').style.display = 'flex';
            document.getElementById('send-whatsapp-btn').style.display = 'flex';
        }
    }
    updateCartTotal();
}

function updateCartTotal() {
    const totalUSD = state.cart.reduce((sum, item) => sum + item.subtotalUSD, 0);
    const totalElement = document.getElementById('cart-total-amount');
    if (totalElement) totalElement.textContent = convertPrice(totalUSD);
}


// ============================================
// MODAL & CHECKOUT
// ============================================
function openCartModal() {
    document.getElementById('cart-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
    updateCartUI();
}

function closeCartModal() {
    document.getElementById('cart-modal').classList.remove('active');
    document.body.style.overflow = '';
    state.checkoutMode = false;
    document.getElementById('checkout-form').classList.remove('active');
    document.getElementById('checkout-btn').style.display = state.cart.length > 0 ? 'flex' : 'none';
    document.getElementById('send-email-btn').style.display = 'none';
    document.getElementById('send-whatsapp-btn').style.display = 'none';
}

document.getElementById('cart-modal').addEventListener('click', function (e) {
    if (e.target === this) closeCartModal();
});

function proceedToCheckout() {
    state.checkoutMode = true;
    document.getElementById('checkout-form').classList.add('active');
    document.getElementById('checkout-btn').style.display = 'none';
    document.getElementById('send-email-btn').style.display = 'flex';
    document.getElementById('send-whatsapp-btn').style.display = 'flex';
}

// ============================================
// UTILITIES
// ============================================
function initDatePicker() {
    window.tourDatePicker = flatpickr('#tour-date', {
        locale: state.language === 'es' ? 'es' : 'default',
        minDate: 'today',
        dateFormat: 'd/m/Y',
        disableMobile: false,
        allowInput: false
    });
}

function initEmailJS() {
    if (CONFIG.emailjs.publicKey && CONFIG.emailjs.publicKey !== 'TU_PUBLIC_KEY') {
        emailjs.init(CONFIG.emailjs.publicKey);
    }
}

async function sendBookingEmail() {
    const form = document.getElementById('booking-form');
    const lang = state.language;

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const btn = document.getElementById('send-email-btn');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
        const cartSummary = state.cart.map(item => {
            if (item.type === 'dual') {
                return `${item.name}: ${item.adults} ad, ${item.children} ch - ${convertPrice(item.subtotalUSD)}`;
            }
            return `${item.name}: ${item.quantity} pers - ${convertPrice(item.subtotalUSD)}`;
        }).join('\n');

        const totalUSD = state.cart.reduce((sum, item) => sum + item.subtotalUSD, 0);

        const templateParams = {
            customer_name: document.getElementById('customer-name').value,
            customer_email: document.getElementById('customer-email').value,
            customer_phone: document.getElementById('customer-phone').value,
            tour_date: document.getElementById('tour-date').value,
            customer_hotel: document.getElementById('customer-hotel').value || 'No especificado',
            customer_comments: document.getElementById('customer-comments').value || 'Sin comentarios',
            cart_summary: cartSummary,
            total_amount: convertPrice(totalUSD),
            currency: state.currency
        };

        await emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.templateId, templateParams);

        showToast('success', lang === 'es' ? '¡Reservación Enviada!' : 'Booking Sent!', '');
        state.cart = [];
        saveState();
        setTimeout(closeCartModal, 2000);

    } catch (error) {
        console.error(error);
        showToast('error', lang === 'es' ? 'Error. Usa WhatsApp' : 'Error. Use WhatsApp', '');
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

function sendToWhatsApp() {
    const form = document.getElementById('booking-form');
    const lang = state.language;

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    let message = lang === 'es' ? '🌴 *NUEVA RESERVACIÓN*\n\n' : '🌴 *NEW BOOKING*\n\n';

    message += `👤 *${document.getElementById('customer-name').value}*\n`;
    message += `📅 ${document.getElementById('tour-date').value}\n`;
    message += `📞 ${document.getElementById('customer-phone').value}\n\n`;

    message += lang === 'es' ? '🎫 *Tours:*\n' : '🎫 *Tours:*\n';
    state.cart.forEach(item => {
        message += `• ${item.name}`;
        if (item.type === 'dual') {
            message += ` (${item.adults}ad, ${item.children}ch)`;
        } else {
            message += ` (${item.quantity}p)`;
        }
        message += ` - ${convertPrice(item.subtotalUSD)}\n`;
    });

    const totalUSD = state.cart.reduce((sum, item) => sum + item.subtotalUSD, 0);
    message += `\n💰 *TOTAL: ${convertPrice(totalUSD)}*`;

    const comments = document.getElementById('customer-comments').value;
    if (comments) message += `\n📝 ${comments}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${CONFIG.whatsapp.phone}?text=${encodedMessage}`, '_blank');

    setTimeout(() => {
        state.cart = [];
        saveState();
        closeCartModal();
    }, 2000);
}

function showToast(type, title, message) {
    const container = document.getElementById('toast-container');
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><div class="toast-content"><div class="toast-title">${title}</div><div class="toast-message">${message}</div></div>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastSlide 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeCartModal();
});
