let state = {
    language: 'es',
    currentView: 'catalog',
    currentTour: null,
    adults: 0,
    children: 0,
    addOns: {},
    cart: [],
    checkoutMode: false,
    checkoutStep: 1
};

let TOURS = {};
let HOTELS = [];
let CONFIG = { emailjs: {}, whatsapp: {} };

let galleryState = { current: 0, total: 0 };
let galleryAutoSlide = null;
let heroRotationTimer = null;
let heroIndex = 0;
let revealObserver = null;
let bookingSubmissionInProgress = false;
let lastFocusedBeforeCartModal = null;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const I18N = {
    es: {
        from: 'Desde',
        viewDetails: 'Ver Detalles',
        backHome: 'Volver a Inicio',
        back: 'Volver',
        configureBooking: 'Configura tu Reservación',
        adultsLabel: 'Adultos (13+)',
        childrenLabel: 'Niños (5-12)',
        selectQuantity: 'Selecciona cantidad',
        perAdult: 'por adulto',
        perChild: 'por niño',
        addToCart: 'Agregar al Carrito',
        added: 'Agregado',
        select: 'Seleccionar',
        selected: 'Seleccionado',
        person: 'persona',
        total: 'Total',
        removed: 'Eliminado',
        removedMessage: 'Tour eliminado del carrito',
        addedMessage: 'Tour agregado al carrito',
        signedOut: 'Sesión cerrada',
        invalidCredentials: 'Credenciales incorrectas',
        adminAuthRequired: 'Inicia sesión para usar el panel de administración',
        sessionExpiredTitle: 'Sesión expirada',
        sessionExpiredMessage: 'Vuelve a iniciar sesión para continuar',
        cartEmpty: 'Tu carrito está vacío',
        adultUnit: 'adulto(s)',
        childUnit: 'niño(s)',
        maps: 'Mapa',
        mapsTitle: 'Ver en Google Maps',
        newBooking: '*NUEVA RESERVACIÓN*',
        tours: '*Tours:*',
        bookingSummary: 'Resumen de Reservación',
        name: 'Nombre',
        email: 'Email',
        phone: 'Teléfono',
        tourDate: 'Fecha del Tour',
        pickupTime: 'Hora de Recogida',
        hotel: 'Hotel',
        comments: 'Comentarios',
        notSpecified: 'No especificado',
        noComments: 'Sin comentarios',
        sendingBooking: 'Enviando reservación...',
        bookingSaved: 'Reservación guardada',
        bookingFailed: 'No se pudo enviar la reservación',
        bookingSentTitle: 'Reservación Enviada',
        bookingSentMessage: 'Te contactaremos pronto para confirmar.',
        bookingSavedForWhatsApp: 'Reservación guardada. Abriendo WhatsApp...',
        whatsappErrorTitle: 'Error en envío',
        whatsappErrorMessage: 'No se pudo guardar la reservación antes de abrir WhatsApp.',
        emailFallbackError: 'Error. Usa WhatsApp.',
        heroCta: 'Explorar Tours',
        bookingStatusIdle: '',
        bookingStatusLoading: 'Procesando y guardando tu reservación...',
        bookingStatusSuccess: 'Reservación enviada con éxito.',
        bookingStatusError: 'Ocurrió un error. Intenta nuevamente.',
        onlyJpgError: 'Solo se permiten imágenes JPG/JPEG en hero, card y galería.',
        invalidSlug: 'El slug del tour no es válido.',
        tourSaved: 'Tour guardado correctamente',
        saveError: 'No se pudo guardar el tour',
        totalToPay: 'Total a pagar',
        closeCart: 'Cerrar carrito',
        removeFromCartAria: 'Eliminar tour del carrito',
        confirmStepInvalid: 'Completa los campos obligatorios antes de confirmar.',
        confirmCustomerDetails: 'Datos del Cliente',
        confirmToursAndTotal: 'Tours y Total',
        confirmLineAdults: 'Adultos',
        confirmLineChildren: 'Niños',
        backToCart: 'Volver al carrito',
        editDetails: 'Editar datos'
    },
    en: {
        from: 'From',
        viewDetails: 'View Details',
        backHome: 'Back to Home',
        back: 'Back',
        configureBooking: 'Configure Your Booking',
        adultsLabel: 'Adults (13+)',
        childrenLabel: 'Children (5-12)',
        selectQuantity: 'Select quantity',
        perAdult: 'per adult',
        perChild: 'per child',
        addToCart: 'Add to Cart',
        added: 'Added',
        select: 'Select',
        selected: 'Selected',
        person: 'person',
        total: 'Total',
        removed: 'Removed',
        removedMessage: 'Tour removed from cart',
        addedMessage: 'Tour added to cart',
        signedOut: 'Signed out',
        invalidCredentials: 'Invalid credentials',
        adminAuthRequired: 'Please sign in to use the admin dashboard',
        sessionExpiredTitle: 'Session expired',
        sessionExpiredMessage: 'Sign in again to continue',
        cartEmpty: 'Your cart is empty',
        adultUnit: 'adult(s)',
        childUnit: 'child(ren)',
        maps: 'Maps',
        mapsTitle: 'Open in Google Maps',
        newBooking: '*NEW BOOKING*',
        tours: '*Tours:*',
        bookingSummary: 'Booking Summary',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        tourDate: 'Tour Date',
        pickupTime: 'Pickup Time',
        hotel: 'Hotel',
        comments: 'Comments',
        notSpecified: 'Not specified',
        noComments: 'No comments',
        sendingBooking: 'Sending booking...',
        bookingSaved: 'Booking saved',
        bookingFailed: 'Booking could not be sent',
        bookingSentTitle: 'Booking Sent',
        bookingSentMessage: 'We will contact you soon to confirm.',
        bookingSavedForWhatsApp: 'Booking saved. Opening WhatsApp...',
        whatsappErrorTitle: 'Send error',
        whatsappErrorMessage: 'Booking could not be saved before opening WhatsApp.',
        emailFallbackError: 'Error. Use WhatsApp.',
        heroCta: 'Explore Tours',
        bookingStatusIdle: '',
        bookingStatusLoading: 'Processing and saving your booking...',
        bookingStatusSuccess: 'Booking sent successfully.',
        bookingStatusError: 'An error occurred. Please try again.',
        onlyJpgError: 'Only JPG/JPEG images are allowed for hero, card, and gallery.',
        invalidSlug: 'The tour slug is invalid.',
        tourSaved: 'Tour saved successfully',
        saveError: 'Tour could not be saved',
        totalToPay: 'Total to pay',
        closeCart: 'Close cart',
        removeFromCartAria: 'Remove tour from cart',
        confirmStepInvalid: 'Complete required fields before confirming.',
        confirmCustomerDetails: 'Customer Details',
        confirmToursAndTotal: 'Tours and Total',
        confirmLineAdults: 'Adults',
        confirmLineChildren: 'Children',
        backToCart: 'Back to cart',
        editDetails: 'Edit details'
    }
};

var SVG = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>',
    cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    cart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    warning: '<svg class="warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>',
    arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>',
    sun: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/></svg>',
    glasses: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="15" r="4"/><circle cx="18" cy="15" r="4"/><path d="M10 15h4"/></svg>',
    hat: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 18h20"/><path d="M4 18v-4a8 8 0 0 1 16 0v4"/></svg>',
    water: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l5 10a5 5 0 0 1-10 0z"/></svg>',
    camera: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    swim: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20c2-1 4-1 6 0s4 1 6 0 4-1 6 0"/><circle cx="12" cy="7" r="3"/></svg>',
    back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>'
};

function t(key) {
    var dict = I18N[state.language] || I18N.es;
    return dict[key] || key;
}

function normalizeLanguage(lang) {
    return lang === 'en' ? 'en' : 'es';
}

function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttr(value) {
    return escapeHtml(value);
}

function safeText(value) {
    return String(value == null ? '' : value);
}

function safeInt(value, fallback) {
    var n = Number(value);
    return Number.isFinite(n) ? Math.round(n) : fallback;
}

function getDateFormatByLanguage() {
    return state.language === 'en' ? 'm/d/Y' : 'd/m/Y';
}

function isCartModalActive() {
    var modal = document.getElementById('cart-modal');
    return Boolean(modal && modal.classList.contains('active'));
}

function getModalFocusableElements() {
    var dialog = document.getElementById('cart-modal-dialog');
    if (!dialog) return [];

    var selector = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([type="hidden"]):not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    return Array.prototype.slice.call(dialog.querySelectorAll(selector)).filter(function (el) {
        return el.offsetParent !== null || document.activeElement === el;
    });
}

function trapCartModalFocus(event) {
    if (event.key !== 'Tab') return;
    var dialog = document.getElementById('cart-modal-dialog');
    if (!dialog) return;

    var focusable = getModalFocusableElements();
    if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
    }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    var active = document.activeElement;
    if (!dialog.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
    }

    if (event.shiftKey) {
        if (active === first) {
            event.preventDefault();
            last.focus();
        }
        return;
    }

    if (active === last) {
        event.preventDefault();
        first.focus();
    }
}

function focusCartModalPrimaryControl() {
    var dialog = document.getElementById('cart-modal-dialog');
    if (!dialog) return;

    var focusable = getModalFocusableElements();
    if (focusable.length > 0) {
        focusable[0].focus();
        return;
    }

    dialog.focus();
}

function hideBookingPreviews() {
    var whatsappPreview = document.getElementById('whatsapp-preview');
    var emailPreview = document.getElementById('email-preview');
    var whatsappContent = document.getElementById('whatsapp-message-content');
    var emailContent = document.getElementById('email-preview-content');

    if (whatsappPreview) whatsappPreview.style.display = 'none';
    if (emailPreview) emailPreview.style.display = 'none';
    if (whatsappContent) whatsappContent.textContent = '';
    if (emailContent) emailContent.replaceChildren();
}

function getTourForCartItem(item) {
    if (!item || !item.tourId) return null;
    return TOURS[item.tourId] || null;
}

function getCartItemName(item) {
    var tour = getTourForCartItem(item);
    if (tour && tour.hero && tour.hero.title) {
        return getLocalized(tour.hero.title, state.language);
    }
    if (item && item.name && typeof item.name === 'object') {
        return getLocalized(item.name, state.language);
    }
    return safeText(item && item.name);
}

function getCartItemAddonNames(item) {
    if (!item || !Array.isArray(item.addOns)) return [];

    var names = [];
    var tour = getTourForCartItem(item);
    item.addOns.forEach(function (addon) {
        if (!addon) return;
        var label = '';

        if (tour && tour.addOns && Array.isArray(tour.addOns.options) && addon.id) {
            var option = tour.addOns.options.find(function (opt) {
                return opt.id === addon.id;
            });
            if (option) {
                label = getLocalized(option.title, state.language);
            }
        }

        if (!label && addon.name && typeof addon.name === 'object') {
            label = getLocalized(addon.name, state.language);
        }
        if (!label) {
            label = safeText(addon.name || addon.id);
        }
        if (label) names.push(label);
    });

    return names;
}

function safePathSegment(segment) {
    return encodeURIComponent(String(segment || '').replace(/\\/g, '/'));
}

function encodePath(pathValue) {
    return String(pathValue || '')
        .split('/')
        .filter(function (segment) { return segment.length > 0; })
        .map(safePathSegment)
        .join('/');
}

function buildImageUrl(folder, imageRef) {
    var safeFolder = encodePath(folder);
    var ref = String(imageRef == null ? '' : imageRef).trim();
    if (/^\d+$/.test(ref)) {
        return safeFolder + '/' + ref + '.jpg';
    }
    return safeFolder + '/' + safePathSegment(ref);
}

function sanitizeImageUrl(url) {
    return String(url || '').replace(/[^a-zA-Z0-9/_%.-]/g, '');
}

function getLocalized(localized, lang) {
    if (!localized || typeof localized !== 'object') return safeText(localized);
    if (lang === 'en') return safeText(localized.en || localized.es || '');
    return safeText(localized.es || localized.en || '');
}

function getLocalizedPack(localized, lang) {
    return {
        es: escapeAttr(getLocalized(localized, 'es')),
        en: escapeAttr(getLocalized(localized, 'en')),
        text: escapeHtml(getLocalized(localized, lang))
    };
}

function cssEscapeValue(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
        return window.CSS.escape(String(value));
    }
    return String(value).replace(/(["\\])/g, '\\$1');
}

function sanitizeSlugClient(input) {
    return String(input || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function getAdminToken() {
    return sessionStorage.getItem('admin_token') || '';
}

function clearAdminSession() {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_expires_at');
    sessionStorage.removeItem('admin_auth');
}

function isAdminLoggedIn() {
    return Boolean(getAdminToken());
}

async function adminFetch(url, options) {
    var token = getAdminToken();
    if (!token) {
        throw new Error(t('adminAuthRequired'));
    }

    var init = options || {};
    var headers = new Headers(init.headers || {});
    headers.set('Authorization', 'Bearer ' + token);

    var response = await fetch(url, Object.assign({}, init, { headers: headers }));
    if (response.status === 401) {
        clearAdminSession();
        navigateTo('admin');
        showToast('error', t('sessionExpiredTitle'), t('sessionExpiredMessage'));
        throw new Error(t('sessionExpiredMessage'));
    }
    return response;
}

document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    try {
        loadState();
    } catch (e) {
        console.warn('loadState error', e);
    }

    try {
        initLanguage();
    } catch (e2) {
        console.warn('initLanguage error', e2);
    }

    try {
        initDatePicker();
    } catch (e3) {
        console.warn('initDatePicker error', e3);
    }

    try {
        initTimePicker();
    } catch (e4) {
        console.warn('initTimePicker error', e4);
    }

    try {
        initCatalogHero();
    } catch (e5) {
        console.warn('initCatalogHero error', e5);
    }

    try {
        var data = await Promise.all([
            fetch('/api/tours').then(function (r) { return r.json(); }),
            fetch('/api/hotels').then(function (r) { return r.json(); }),
            fetch('/api/config').then(function (r) { return r.json(); })
        ]);

        var tours = data[0];
        var hotels = data[1];
        var config = data[2];

        TOURS = {};
        tours.forEach(function (tour) {
            TOURS[tour.id] = tour;
        });
        HOTELS = hotels;
        CONFIG = config;

        if (CONFIG.emailjs && CONFIG.emailjs.publicKey && typeof emailjs !== 'undefined') {
            emailjs.init(CONFIG.emailjs.publicKey);
        }
    } catch (e6) {
        console.error('API error', e6);
    }

    try {
        initHotelAutocomplete();
    } catch (e7) {
        console.warn('initHotelAutocomplete error', e7);
    }

    initRevealObserver();
    bindBookingPreviewListeners();

    var modal = document.getElementById('cart-modal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeCartModal();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (!isCartModalActive()) return;
        if (e.key === 'Escape') {
            e.preventDefault();
            closeCartModal();
            return;
        }
        trapCartModalFocus(e);
    });

    window.addEventListener('hashchange', handleHash);

    updateCartUI();
    setBookingStatus('idle');
    handleHash();
}

function handleHash() {
    var hash = window.location.hash.slice(1);

    if (hash === 'about') {
        showAbout();
        return;
    }

    if (hash === 'admin') {
        showAdminLogin();
        return;
    }

    if (hash === 'dashboard') {
        if (isAdminLoggedIn()) {
            showAdminDashboard();
        } else {
            navigateTo('admin');
        }
        return;
    }

    if (hash && TOURS[hash]) {
        showDetail(hash);
        return;
    }

    showCatalog();
}

function navigateTo(view, tourId) {
    if (view === 'catalog') window.location.hash = '';
    else if (view === 'detail' && tourId) window.location.hash = tourId;
    else if (view === 'about') window.location.hash = 'about';
    else if (view === 'admin') window.location.hash = 'admin';
    else if (view === 'dashboard') window.location.hash = 'dashboard';
}

function hideAllViews() {
    stopGallerySlider();

    var catalogHero = document.getElementById('catalog-hero');
    var mainView = document.getElementById('main-view');
    var detailView = document.getElementById('detail-view');
    var aboutView = document.getElementById('about-view');
    var adminLoginView = document.getElementById('admin-login-view');
    var adminDashboardView = document.getElementById('admin-dashboard-view');
    var testimonials = document.getElementById('testimonials');

    if (catalogHero) catalogHero.style.display = 'none';
    if (mainView) mainView.style.display = 'none';
    if (detailView) detailView.style.display = 'none';
    if (aboutView) aboutView.style.display = 'none';
    if (adminLoginView) adminLoginView.style.display = 'none';
    if (adminDashboardView) adminDashboardView.style.display = 'none';
    if (testimonials) testimonials.style.display = 'none';

    var floatingBack = document.getElementById('floating-back');
    if (floatingBack) floatingBack.remove();
}

function showCatalog() {
    state.currentView = 'catalog';
    state.currentTour = null;
    hideAllViews();

    document.getElementById('catalog-hero').style.display = '';
    document.getElementById('main-view').style.display = '';
    document.getElementById('testimonials').style.display = '';

    renderCatalog();
    applyLanguage({ rerender: false, persist: false });

    window.scrollTo(0, 0);
}

function showDetail(tourId) {
    var tour = TOURS[tourId];
    if (!tour) {
        showCatalog();
        return;
    }

    state.currentView = 'detail';
    state.currentTour = tourId;
    state.adults = 0;
    state.children = 0;
    state.addOns = {};

    hideAllViews();
    document.getElementById('detail-view').style.display = '';
    renderTourDetail(tour);

    window.scrollTo(0, 0);
}

function showAbout() {
    state.currentView = 'about';
    hideAllViews();
    document.getElementById('about-view').style.display = '';
    applyLanguage({ rerender: false, persist: false });
    window.scrollTo(0, 0);
}

function showAdminLogin() {
    state.currentView = 'admin';
    hideAllViews();
    document.getElementById('admin-login-view').style.display = '';
    document.getElementById('admin-login-error').style.display = 'none';
    applyLanguage({ rerender: false, persist: false });
    window.scrollTo(0, 0);
}

function showAdminDashboard() {
    if (!isAdminLoggedIn()) {
        navigateTo('admin');
        return;
    }

    state.currentView = 'dashboard';
    hideAllViews();
    document.getElementById('admin-dashboard-view').style.display = '';
    applyLanguage({ rerender: false, persist: false });
    window.scrollTo(0, 0);
}

async function handleAdminLogin(e) {
    e.preventDefault();

    var username = document.getElementById('admin-username').value.trim();
    var password = document.getElementById('admin-password').value.trim();
    var errorEl = document.getElementById('admin-login-error');
    var submitBtn = document.querySelector('.admin-login-submit');

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
    }

    try {
        var response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        });

        if (!response.ok) {
            throw new Error(t('invalidCredentials'));
        }

        var result = await response.json();
        sessionStorage.setItem('admin_token', result.token);
        sessionStorage.setItem('admin_expires_at', String(result.expiresAt || ''));

        document.getElementById('admin-login-form').reset();
        errorEl.style.display = 'none';
        navigateTo('dashboard');
    } catch (err) {
        console.error(err);
        errorEl.style.display = 'flex';
        errorEl.querySelector('span').textContent = t('invalidCredentials');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    }
}

async function adminLogout() {
    try {
        await adminFetch('/api/admin/logout', { method: 'POST' });
    } catch (_) {
        // Session may already be expired.
    }

    clearAdminSession();
    navigateTo('catalog');
    showToast('info', t('signedOut'), '');
}

function initLanguage() {
    var selector = document.getElementById('language-selector');
    if (!selector) return;

    selector.value = normalizeLanguage(state.language);
    selector.addEventListener('change', function (e) {
        changeLanguage(e.target.value, { rerender: true, persist: true });
    });

    document.addEventListener('click', function (e) {
        var wrapper = document.getElementById('language-selector-container');
        if (wrapper && !wrapper.contains(e.target)) {
            wrapper.classList.remove('open');
        }
    });

    applyLanguage({ rerender: false, persist: false });
}

function toggleLanguageDropdown() {
    var selector = document.getElementById('language-selector-container');
    if (!selector) return;
    selector.classList.toggle('open');
}

function applyLanguage(options) {
    changeLanguage(state.language, options || { rerender: false, persist: false });
}

function changeLanguage(lang, options) {
    var opts = Object.assign({ rerender: true, persist: true }, options || {});
    state.language = normalizeLanguage(lang);

    if (opts.persist) saveState();

    var selector = document.getElementById('language-selector');
    if (selector) selector.value = state.language;

    var flag = document.getElementById('lang-flag');
    var text = document.getElementById('lang-text');
    if (flag) flag.src = 'imagenes/flags/' + (state.language === 'es' ? 'es' : 'us') + '.jpg';
    if (text) text.textContent = state.language === 'es' ? 'Español' : 'English';

    document.querySelectorAll('.selector-option').forEach(function (opt) {
        opt.classList.toggle('active', opt.dataset.lang === state.language);
    });

    var wrapper = document.getElementById('language-selector-container');
    if (wrapper) wrapper.classList.remove('open');

    document.documentElement.lang = state.language;
    if (window.tourDatePicker) {
        window.tourDatePicker.set('locale', state.language === 'es' ? 'es' : 'default');
        window.tourDatePicker.set('dateFormat', getDateFormatByLanguage());
    }

    if (opts.rerender) {
        if (state.currentView === 'catalog') {
            renderCatalog();
        } else if (state.currentTour && TOURS[state.currentTour]) {
            renderTourDetail(TOURS[state.currentTour]);
        }
    }

    applyDataTranslations();
    if (isCartModalActive()) updateCartUI();
}

function applyDataTranslations() {
    document.querySelectorAll('[data-es]').forEach(function (el) {
        var value = el.getAttribute('data-' + state.language);
        if (value != null) el.textContent = value;
    });

    document.querySelectorAll('[data-placeholder-es]').forEach(function (el) {
        var placeholder = el.getAttribute('data-placeholder-' + state.language);
        if (placeholder != null) el.setAttribute('placeholder', placeholder);
    });

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var key = el.getAttribute('data-i18n');
        if (key) el.textContent = t(key);
    });

    var mapBtn = document.querySelector('.hotel-map-btn');
    if (mapBtn) {
        mapBtn.title = t('mapsTitle');
        var span = mapBtn.querySelector('span');
        if (span) span.textContent = t('maps');
    }

    var closeCartBtn = document.querySelector('.close-modal');
    if (closeCartBtn) {
        closeCartBtn.setAttribute('aria-label', t('closeCart'));
    }
}

function initRevealObserver() {
    if (prefersReducedMotion) return;

    revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.12
    });
}

function observeReveals(root) {
    var context = root || document;
    context.querySelectorAll('[data-reveal]').forEach(function (el) {
        if (prefersReducedMotion || !revealObserver) {
            el.classList.add('is-visible');
            return;
        }
        revealObserver.observe(el);
    });
}

function initCatalogHero() {
    var hero = document.getElementById('catalog-hero');
    var layerA = document.getElementById('catalog-hero-bg-a');
    var layerB = document.getElementById('catalog-hero-bg-b');
    if (!hero || !layerA || !layerB) return;

    var slides = [
        'imagenes/whale.jpg',
        'imagenes/servicios/tour_privado_tulum_ruinas/1.jpg',
        'imagenes/servicios/tulum_akumal_snorkel_tortugas/1.jpg'
    ];

    layerA.style.backgroundImage = 'url("' + slides[0] + '")';
    layerB.style.backgroundImage = 'url("' + slides[1] + '")';

    if (prefersReducedMotion) return;

    clearInterval(heroRotationTimer);
    heroRotationTimer = setInterval(function () {
        heroIndex = (heroIndex + 1) % slides.length;
        var nextIndex = (heroIndex + 1) % slides.length;

        if (layerA.classList.contains('active')) {
            layerB.style.backgroundImage = 'url("' + slides[nextIndex] + '")';
            layerA.classList.remove('active');
            layerB.classList.add('active');
        } else {
            layerA.style.backgroundImage = 'url("' + slides[nextIndex] + '")';
            layerB.classList.remove('active');
            layerA.classList.add('active');
        }
    }, 7000);
}

function scrollToTopTours() {
    var section = document.getElementById('catalog-grid');
    if (!section) return;
    section.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
}

function renderCatalog() {
    var grid = document.getElementById('catalog-grid');
    if (!grid) return;

    if (Object.keys(TOURS).length === 0) {
        grid.innerHTML = '<div class="skeleton-grid"><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div></div>';
        return;
    }

    var html = '';
    Object.values(TOURS).forEach(function (tour) {
        var title = getLocalizedPack(tour.card.title, state.language);
        var description = getLocalizedPack(tour.card.shortDescription, state.language);
        var imageUrl = escapeAttr(sanitizeImageUrl(buildImageUrl(tour.imageFolder, tour.card.thumbnail)));
        var tourId = escapeAttr(tour.id);

        html += '<article class="tour-card reveal" data-reveal data-tour-id="' + tourId + '" tabindex="0" role="button">';
        html += '<div class="tour-card-image" style="background-image:url(\'' + imageUrl + '\')"></div>';
        html += '<div class="tour-card-body">';
        html += '<h3 class="tour-card-title" data-es="' + title.es + '" data-en="' + title.en + '">' + title.text + '</h3>';
        html += '<p class="tour-card-desc" data-es="' + description.es + '" data-en="' + description.en + '">' + description.text + '</p>';
        html += '<div class="tour-card-footer">';
        html += '<span class="tour-card-price">' + t('from') + ' $' + safeInt(tour.card.priceFrom, 0) + ' USD</span>';
        html += '<span class="tour-card-cta">' + t('viewDetails') + ' &rarr;</span>';
        html += '</div></div></article>';
    });

    grid.innerHTML = html;

    grid.querySelectorAll('.tour-card').forEach(function (card) {
        var tourId = card.getAttribute('data-tour-id');
        card.addEventListener('click', function () {
            navigateTo('detail', tourId);
        });
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateTo('detail', tourId);
            }
        });
    });

    observeReveals(document.getElementById('main-view'));
    applyDataTranslations();
}

function renderTourDetail(tour) {
    var container = document.getElementById('detail-view');
    if (!container) return;

    var lang = state.language;
    var imageFolder = safeText(tour.imageFolder);

    if (tour.addOns && Array.isArray(tour.addOns.options)) {
        tour.addOns.options.forEach(function (option) {
            if (state.addOns[option.id] === undefined) state.addOns[option.id] = false;
        });
    }

    var heroTitle = getLocalizedPack(tour.hero.title, lang);
    var heroSubtitle = getLocalizedPack(tour.hero.subtitle, lang);
    var heroDescription = getLocalizedPack(tour.hero.description, lang);
    var galleryTitle = getLocalizedPack(tour.gallery.title, lang);

    var galleryImages = Array.isArray(tour.gallery.images) && tour.gallery.images.length > 0 ? tour.gallery.images : [1];

    var gallerySlides = '';
    var galleryDots = '';
    galleryImages.forEach(function (imageRef, index) {
        var imageUrl = escapeAttr(sanitizeImageUrl(buildImageUrl(imageFolder, imageRef)));
        gallerySlides += '<div class="gallery-slide" style="background-image:url(\'' + imageUrl + '\')"></div>';
        galleryDots += '<button class="gallery-dot' + (index === 0 ? ' active' : '') + '" onclick="goToGallerySlide(' + index + ')" aria-label="Slide ' + (index + 1) + '"></button>';
    });

    var tableRows = '';
    (tour.pricing.tiers || []).forEach(function (tier) {
        var adults = safeInt(tier.adults, 0);
        var adultPrice = safeInt(tier.adultPrice, 0);
        tableRows += '<tr data-adults="' + adults + '" onclick="selectTier(' + adults + ')"><td>' + adults + '</td><td>$' + adultPrice + ' USD</td><td>$' + safeInt(tour.pricing.childPriceFlat, 0) + ' USD</td></tr>';
    });

    var includesItems = '';
    (tour.includes.items || []).forEach(function (item) {
        var value = getLocalizedPack(item, lang);
        includesItems += '<li><span class="check-icon">' + SVG.check + '</span><span data-es="' + value.es + '" data-en="' + value.en + '">' + value.text + '</span></li>';
    });

    var excludesItems = '';
    (tour.includes.excludes || []).forEach(function (item) {
        var value = getLocalizedPack(item, lang);
        excludesItems += '<li><span class="cross-icon">' + SVG.cross + '</span><span data-es="' + value.es + '" data-en="' + value.en + '">' + value.text + '</span></li>';
    });

    var itineraryItems = '';
    (tour.itinerary.steps || []).forEach(function (step, index) {
        var value = getLocalizedPack(step, lang);
        itineraryItems += '<li class="itinerary-item"><span class="itinerary-number">' + (index + 1) + '.</span><span data-es="' + value.es + '" data-en="' + value.en + '">' + value.text + '</span></li>';
    });

    var addOnCards = '';
    if (tour.addOns && Array.isArray(tour.addOns.options) && tour.addOns.options.length > 0) {
        tour.addOns.options.forEach(function (option) {
            var selected = Boolean(state.addOns[option.id]);
            var title = getLocalizedPack(option.title, lang);
            var desc = getLocalizedPack(option.description, lang);
            var optionId = escapeAttr(option.id);
            addOnCards += '<div class="addon-card' + (selected ? ' selected' : '') + '" data-addon-id="' + optionId + '" onclick="toggleAddon(this.dataset.addonId)">';
            addOnCards += '<div class="addon-content"><div class="addon-header">';
            addOnCards += '<span class="addon-title" data-es="' + title.es + '" data-en="' + title.en + '">' + title.text + '</span>';
            addOnCards += '<span class="addon-price">+$' + safeInt(option.pricePerPerson, 0) + ' USD / ' + t('person') + '</span>';
            addOnCards += '</div>';
            addOnCards += '<p class="addon-description" data-es="' + desc.es + '" data-en="' + desc.en + '">' + desc.text + '</p>';
            addOnCards += '<div class="addon-toggle"><span class="addon-checkbox">' + SVG.check + '</span><span>' + (selected ? t('selected') : t('select')) + '</span></div>';
            addOnCards += '</div></div>';
        });
    }

    var packingItems = '';
    (tour.packingList.items || []).forEach(function (item) {
        var value = getLocalizedPack(item, lang);
        packingItems += '<div class="packing-item"><span class="packing-icon">' + (SVG[item.icon] || '') + '</span><span data-es="' + value.es + '" data-en="' + value.en + '">' + value.text + '</span></div>';
    });

    var pricingTitle = getLocalizedPack(tour.pricing.sectionTitle, lang);
    var adultsHeader = getLocalizedPack(tour.pricing.tableHeader.adults, lang);
    var adultPriceHeader = getLocalizedPack(tour.pricing.tableHeader.adultPrice, lang);
    var childPriceHeader = getLocalizedPack(tour.pricing.tableHeader.childPrice, lang);
    var pricingNote = getLocalizedPack(tour.pricing.pricingNote, lang);
    var freeChildNote = getLocalizedPack(tour.pricing.freeChildNote, lang);
    var groupNote = getLocalizedPack(tour.pricing.groupNote, lang);

    var includesTitle = getLocalizedPack(tour.includes.sectionTitle, lang);
    var excludesTitle = getLocalizedPack(tour.includes.excludesTitle, lang);

    var itineraryTitle = getLocalizedPack(tour.itinerary.sectionTitle, lang);
    var itineraryWarning = getLocalizedPack(tour.itinerary.warning, lang);

    var addOnsTitle = tour.addOns && tour.addOns.sectionTitle ? getLocalizedPack(tour.addOns.sectionTitle, lang) : null;
    var packingTitle = getLocalizedPack(tour.packingList.sectionTitle, lang);
    var bookingTitle = getLocalizedPack(tour.booking.sectionTitle, lang);
    var bookingDesc = getLocalizedPack(tour.booking.description, lang);

    var html = '';
    html += '<div class="detail-nav reveal" data-reveal><button class="back-btn" onclick="navigateTo(\'catalog\')">' + SVG.back + ' <span data-es="' + escapeAttr(I18N.es.backHome) + '" data-en="' + escapeAttr(I18N.en.backHome) + '">' + escapeHtml(t('backHome')) + '</span></button></div>';

    html += '<section class="tour-hero reveal" data-reveal style="background-image:url(\'' + escapeAttr(sanitizeImageUrl(buildImageUrl(imageFolder, tour.hero.heroImage))) + '\')">';
    html += '<div class="tour-hero-overlay"><div class="tour-hero-content">';
    html += '<h2 data-es="' + heroTitle.es + '" data-en="' + heroTitle.en + '">' + heroTitle.text + '</h2>';
    html += '<h3 data-es="' + heroSubtitle.es + '" data-en="' + heroSubtitle.en + '">' + heroSubtitle.text + '</h3>';
    html += '</div></div></section>';

    html += '<section class="tour-section reveal" data-reveal><div class="section-divider"></div><p class="tour-description-text" data-es="' + heroDescription.es + '" data-en="' + heroDescription.en + '">' + heroDescription.text + '</p></section>';

    html += '<section class="tour-gallery reveal" data-reveal><div class="tour-section"><div class="section-divider"></div>';
    html += '<h2 class="section-title" data-es="' + galleryTitle.es + '" data-en="' + galleryTitle.en + '">' + galleryTitle.text + '</h2>';
    html += '<div style="height:16px"></div><div class="gallery-container"><div class="gallery-slider" id="gallery-slider">' + gallerySlides + '</div>';
    html += '<button class="gallery-btn prev" onclick="moveGallery(-1)">' + SVG.arrowLeft + '</button>';
    html += '<button class="gallery-btn next" onclick="moveGallery(1)">' + SVG.arrowRight + '</button></div>';
    html += '<div class="gallery-dots" id="gallery-dots">' + galleryDots + '</div></div></section>';

    html += '<section class="pricing-section reveal" data-reveal><div class="tour-section"><div class="section-divider"></div>';
    html += '<h2 class="section-title" data-es="' + pricingTitle.es + '" data-en="' + pricingTitle.en + '">' + pricingTitle.text + '</h2>';
    html += '<div style="height:8px"></div><p class="pricing-note" data-es="' + pricingNote.es + '" data-en="' + pricingNote.en + '">' + pricingNote.text + '</p>';
    html += '<div class="pricing-table-wrapper"><table class="pricing-table" id="pricing-table"><thead><tr>';
    html += '<th data-es="' + adultsHeader.es + '" data-en="' + adultsHeader.en + '">' + adultsHeader.text + '</th>';
    html += '<th data-es="' + adultPriceHeader.es + '" data-en="' + adultPriceHeader.en + '">' + adultPriceHeader.text + '</th>';
    html += '<th data-es="' + childPriceHeader.es + '" data-en="' + childPriceHeader.en + '">' + childPriceHeader.text + '</th>';
    html += '</tr></thead><tbody>' + tableRows + '</tbody></table></div>';
    html += '<p class="pricing-note" data-es="' + freeChildNote.es + '" data-en="' + freeChildNote.en + '">' + freeChildNote.text + '</p>';
    html += '<p class="pricing-note-highlight" data-es="' + groupNote.es + '" data-en="' + groupNote.en + '">' + groupNote.text + '</p>';

    html += '<div class="booking-configurator">';
    html += '<h3 class="configurator-title" data-es="' + escapeAttr(I18N.es.configureBooking) + '" data-en="' + escapeAttr(I18N.en.configureBooking) + '">' + escapeHtml(t('configureBooking')) + '</h3>';
    html += '<div class="configurator-row"><div class="configurator-label"><span class="configurator-label-main" data-es="' + escapeAttr(I18N.es.adultsLabel) + '" data-en="' + escapeAttr(I18N.en.adultsLabel) + '">' + escapeHtml(t('adultsLabel')) + '</span><span class="configurator-label-sub" id="adult-price-label">' + escapeHtml(t('selectQuantity')) + '</span></div><div class="quantity-selector"><button class="qty-btn" onclick="updateAdults(-1)">-</button><span class="qty-value" id="qty-adults">0</span><button class="qty-btn" onclick="updateAdults(1)">+</button></div></div>';
    html += '<div class="configurator-row"><div class="configurator-label"><span class="configurator-label-main" data-es="' + escapeAttr(I18N.es.childrenLabel) + '" data-en="' + escapeAttr(I18N.en.childrenLabel) + '">' + escapeHtml(t('childrenLabel')) + '</span><span class="configurator-label-sub">$' + safeInt(tour.pricing.childPriceFlat, 0) + ' USD ' + escapeHtml(t('perChild')) + '</span></div><div class="quantity-selector"><button class="qty-btn" onclick="updateChildren(-1)">-</button><span class="qty-value" id="qty-children">0</span><button class="qty-btn" onclick="updateChildren(1)">+</button></div></div>';
    html += '<div class="configurator-total"><span class="configurator-total-label">' + escapeHtml(t('total')) + ':</span><span class="configurator-total-amount" id="configurator-total">$0 USD</span></div>';
    html += '<button class="add-to-cart-btn" id="btn-add-tour" onclick="addTourToCart()" disabled>' + SVG.cart + ' <span data-es="' + escapeAttr(I18N.es.addToCart) + '" data-en="' + escapeAttr(I18N.en.addToCart) + '">' + escapeHtml(t('addToCart')) + '</span></button>';
    html += '</div></div></section>';

    html += '<section class="includes-excludes-section reveal" data-reveal><div class="tour-section"><div class="section-divider"></div><div class="includes-grid"><div class="includes-col"><h4 data-es="' + includesTitle.es + '" data-en="' + includesTitle.en + '">' + includesTitle.text + '</h4><ul>' + includesItems + '</ul></div><div class="includes-col"><h4 data-es="' + excludesTitle.es + '" data-en="' + excludesTitle.en + '">' + excludesTitle.text + '</h4><ul>' + excludesItems + '</ul></div></div></div></section>';

    html += '<section class="itinerary-section reveal" data-reveal><div class="tour-section"><div class="section-divider"></div>';
    html += '<h2 class="section-title" data-es="' + itineraryTitle.es + '" data-en="' + itineraryTitle.en + '">' + itineraryTitle.text + '</h2><div style="height:16px"></div>';
    html += '<ul class="itinerary-list">' + itineraryItems + '</ul>';
    html += '<div class="itinerary-warning">' + SVG.warning + ' <span data-es="' + itineraryWarning.es + '" data-en="' + itineraryWarning.en + '">' + itineraryWarning.text + '</span></div>';
    if (tour.itinerary.comboNote) {
        var comboNote = getLocalizedPack(tour.itinerary.comboNote, lang);
        html += '<p class="itinerary-combo" data-es="' + comboNote.es + '" data-en="' + comboNote.en + '">' + comboNote.text + '</p>';
    }
    html += '</div></section>';

    if (addOnCards) {
        html += '<section class="addons-section reveal" data-reveal><div class="tour-section"><div class="section-divider"></div>';
        html += '<h2 class="section-title" data-es="' + addOnsTitle.es + '" data-en="' + addOnsTitle.en + '">' + addOnsTitle.text + '</h2>';
        html += '<div style="height:16px"></div><div class="addons-grid">' + addOnCards + '</div></div></section>';
    }

    html += '<section class="packing-section reveal" data-reveal><div class="tour-section"><div class="section-divider"></div>';
    html += '<h2 class="section-title" data-es="' + packingTitle.es + '" data-en="' + packingTitle.en + '">' + packingTitle.text + '</h2>';
    html += '<div style="height:16px"></div><div class="packing-grid">' + packingItems + '</div></div></section>';

    html += '<section class="booking-section reveal" data-reveal><div class="tour-section"><div class="section-divider"></div>';
    html += '<h2 class="section-title" data-es="' + bookingTitle.es + '" data-en="' + bookingTitle.en + '">' + bookingTitle.text + '</h2>';
    html += '<div style="height:16px"></div><p class="booking-text" data-es="' + bookingDesc.es + '" data-en="' + bookingDesc.en + '">' + bookingDesc.text + '</p></div></section>';

    container.innerHTML = html;
    observeReveals(container);

    var floatingBack = document.createElement('button');
    floatingBack.id = 'floating-back';
    floatingBack.className = 'floating-back-btn';
    floatingBack.onclick = function () { navigateTo('catalog'); };
    floatingBack.innerHTML = SVG.back + ' <span>' + escapeHtml(t('back')) + '</span>';
    document.body.appendChild(floatingBack);

    initGallerySlider();
    updateConfigurator();
    applyDataTranslations();
}

function stopGallerySlider() {
    clearInterval(galleryAutoSlide);
    galleryAutoSlide = null;
}

function initGallerySlider() {
    if (!state.currentTour) return;

    var tour = TOURS[state.currentTour];
    if (!tour || !tour.gallery || !Array.isArray(tour.gallery.images)) return;

    galleryState = { current: 0, total: tour.gallery.images.length || 1 };
    stopGallerySlider();

    if (!prefersReducedMotion && galleryState.total > 1) {
        galleryAutoSlide = setInterval(function () {
            moveGallery(1);
        }, 5000);
    }
}

function goToGallerySlide(index) {
    galleryState.current = index;
    var slider = document.getElementById('gallery-slider');
    if (slider) {
        slider.style.transform = 'translateX(-' + (index * 100) + '%)';
    }

    document.querySelectorAll('.gallery-dot').forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
    });
}

function moveGallery(direction) {
    if (!galleryState.total) return;
    var next = galleryState.current + direction;
    if (next < 0) next = galleryState.total - 1;
    if (next >= galleryState.total) next = 0;
    goToGallerySlide(next);
}

function getCurrentTour() {
    return state.currentTour ? TOURS[state.currentTour] : null;
}

function selectTier(adults) {
    state.adults = adults;
    var el = document.getElementById('qty-adults');
    if (el) el.textContent = adults;
    highlightTier();
    updateConfigurator();
}

function updateAdults(change) {
    state.adults = Math.max(0, Math.min(10, state.adults + change));
    var el = document.getElementById('qty-adults');
    if (el) el.textContent = state.adults;
    highlightTier();
    updateConfigurator();
}

function updateChildren(change) {
    state.children = Math.max(0, Math.min(10, state.children + change));
    var el = document.getElementById('qty-children');
    if (el) el.textContent = state.children;
    updateConfigurator();
}

function highlightTier() {
    document.querySelectorAll('#pricing-table tbody tr').forEach(function (row) {
        row.classList.toggle('selected', safeInt(row.dataset.adults, -1) === state.adults);
    });
}

function getAdultPrice() {
    var tour = getCurrentTour();
    if (!tour || state.adults === 0) return 0;

    var tier = (tour.pricing.tiers || []).find(function (item) {
        return safeInt(item.adults, -1) === state.adults;
    });
    return tier ? safeInt(tier.adultPrice, 0) : 0;
}

function calculateTotal() {
    var tour = getCurrentTour();
    if (!tour) return 0;

    var total = state.adults * getAdultPrice() + state.children * safeInt(tour.pricing.childPriceFlat, 0);
    var persons = state.adults + state.children;

    if (tour.addOns && Array.isArray(tour.addOns.options)) {
        tour.addOns.options.forEach(function (opt) {
            if (state.addOns[opt.id]) {
                total += safeInt(opt.pricePerPerson, 0) * persons;
            }
        });
    }

    return total;
}

function triggerNumberBump(elementId) {
    if (prefersReducedMotion) return;
    var el = document.getElementById(elementId);
    if (!el) return;
    el.classList.remove('is-bump');
    void el.offsetWidth;
    el.classList.add('is-bump');
}

function updateConfigurator() {
    var adultPrice = getAdultPrice();
    var label = document.getElementById('adult-price-label');
    if (label) {
        label.textContent = state.adults > 0
            ? ('$' + adultPrice + ' USD ' + t('perAdult'))
            : t('selectQuantity');
    }

    var totalEl = document.getElementById('configurator-total');
    if (totalEl) {
        totalEl.textContent = '$' + calculateTotal() + ' USD';
        triggerNumberBump('configurator-total');
    }

    var button = document.getElementById('btn-add-tour');
    if (button) {
        button.disabled = (state.adults + state.children) === 0;
    }
}

function toggleAddon(addonId) {
    if (!addonId) return;

    state.addOns[addonId] = !state.addOns[addonId];

    var selector = '.addon-card[data-addon-id="' + cssEscapeValue(addonId) + '"]';
    var card = document.querySelector(selector);
    if (card) {
        card.classList.toggle('selected', state.addOns[addonId]);
        var toggleLabel = card.querySelector('.addon-toggle span:last-child');
        if (toggleLabel) {
            toggleLabel.textContent = state.addOns[addonId] ? t('selected') : t('select');
        }
    }

    updateConfigurator();
}

function addTourToCart() {
    var tour = getCurrentTour();
    if (!tour || state.adults + state.children === 0) return;

    var selectedAddOns = [];
    if (tour.addOns && Array.isArray(tour.addOns.options)) {
        tour.addOns.options.forEach(function (option) {
            if (state.addOns[option.id]) {
                selectedAddOns.push({
                    id: option.id,
                    name: getLocalized(option.title, state.language),
                    pricePerPerson: safeInt(option.pricePerPerson, 0)
                });
            }
        });
    }

    var firstImage = tour.gallery && Array.isArray(tour.gallery.images) && tour.gallery.images.length > 0
        ? tour.gallery.images[0]
        : 1;

    state.cart.push({
        id: tour.id + '-' + Date.now(),
        tourId: tour.id,
        name: getLocalized(tour.hero.title, state.language),
        image: sanitizeImageUrl(buildImageUrl(tour.imageFolder, firstImage)),
        adults: state.adults,
        children: state.children,
        adultPriceUSD: getAdultPrice(),
        childPriceUSD: safeInt(tour.pricing.childPriceFlat, 0),
        addOns: selectedAddOns,
        subtotalUSD: calculateTotal()
    });

    state.adults = 0;
    state.children = 0;
    Object.keys(state.addOns).forEach(function (key) {
        state.addOns[key] = false;
    });

    var adultsEl = document.getElementById('qty-adults');
    var childrenEl = document.getElementById('qty-children');
    if (adultsEl) adultsEl.textContent = '0';
    if (childrenEl) childrenEl.textContent = '0';

    highlightTier();
    document.querySelectorAll('.addon-card').forEach(function (card) {
        card.classList.remove('selected');
        var toggleLabel = card.querySelector('.addon-toggle span:last-child');
        if (toggleLabel) toggleLabel.textContent = t('select');
    });

    updateConfigurator();
    saveState();
    updateCartUI();

    showToast('success', t('added'), t('addedMessage'));

    var button = document.getElementById('btn-add-tour');
    if (button) {
        button.classList.add('added');
        var original = button.innerHTML;
        button.innerHTML = SVG.check + ' <span>' + escapeHtml(t('added')) + '</span>';

        setTimeout(function () {
            button.classList.remove('added');
            button.innerHTML = original;
            applyDataTranslations();
        }, 1200);
    }
}

function removeFromCart(index) {
    if (index < 0 || index >= state.cart.length) return;
    state.cart.splice(index, 1);
    saveState();
    updateCartUI();
    showToast('info', t('removed'), t('removedMessage'));
}

function getCartTotalUSD() {
    return state.cart.reduce(function (sum, item) {
        return sum + safeInt(item.subtotalUSD, 0);
    }, 0);
}

function updateCartTotal() {
    var total = getCartTotalUSD();

    var amount = document.getElementById('cart-total-amount');
    if (amount) {
        amount.textContent = '$' + total + ' USD';
        triggerNumberBump('cart-total-amount');
    }

    var confirmAmount = document.getElementById('confirm-total-amount');
    if (confirmAmount) confirmAmount.textContent = '$' + total + ' USD';

    var mobileAmount = document.getElementById('mobile-summary-total');
    if (mobileAmount) mobileAmount.textContent = '$' + total + ' USD';

    var mobileLabel = document.getElementById('mobile-summary-label');
    if (mobileLabel) mobileLabel.textContent = t('totalToPay');
}

function loadState() {
    try {
        var cart = localStorage.getItem('lindotours_cart');
        var language = localStorage.getItem('lindotours_language');

        if (cart) state.cart = JSON.parse(cart);
        if (language) state.language = normalizeLanguage(language);
    } catch (e) {
        console.error('loadState error', e);
    }
}

function saveState() {
    try {
        localStorage.setItem('lindotours_cart', JSON.stringify(state.cart));
        localStorage.setItem('lindotours_language', state.language);
    } catch (e) {
        console.error('saveState error', e);
    }
}

function openCartModal() {
    var modal = document.getElementById('cart-modal');
    if (!modal) return;
    if (modal.classList.contains('active')) return;

    lastFocusedBeforeCartModal = document.activeElement;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    updateCartUI();
    focusCartModalPrimaryControl();
}

function closeCartModal() {
    var modal = document.getElementById('cart-modal');
    var wasOpen = Boolean(modal && modal.classList.contains('active'));
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }

    document.body.style.overflow = '';
    state.checkoutMode = false;
    state.checkoutStep = 1;

    hideBookingPreviews();
    setBookingStatus('idle');
    goToCheckoutStep(1, {
        skipValidation: true,
        manageFocus: false,
        scrollIntoView: false,
        preserveStatus: true
    });

    if (wasOpen && lastFocusedBeforeCartModal && document.contains(lastFocusedBeforeCartModal)) {
        lastFocusedBeforeCartModal.focus();
    }
    lastFocusedBeforeCartModal = null;
}

function updateCartUI() {
    var cartCount = document.getElementById('cart-count');
    var cartItems = document.getElementById('cart-items');
    var totalSection = document.getElementById('cart-total-section');
    var mobileSummaryBar = document.getElementById('mobile-summary-bar');

    if (!cartCount || !cartItems || !totalSection) return;

    var totalPeople = 0;
    state.cart.forEach(function (item) {
        totalPeople += safeInt(item.adults, 0) + safeInt(item.children, 0);
    });

    cartCount.textContent = String(totalPeople);
    cartCount.classList.toggle('empty', totalPeople === 0);

    if (state.cart.length === 0) {
        if (mobileSummaryBar) mobileSummaryBar.hidden = true;
        cartItems.innerHTML = '<div class="cart-empty">' +
            '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' +
            '<p>' + escapeHtml(t('cartEmpty')) + '</p></div>';

        totalSection.style.display = 'none';
        hideBookingPreviews();

        state.checkoutMode = false;
        state.checkoutStep = 1;
        setBookingStatus('idle');

        var customerSummary = document.getElementById('confirm-customer-summary');
        var cartSummary = document.getElementById('confirm-cart-summary');
        if (customerSummary) customerSummary.replaceChildren();
        if (cartSummary) cartSummary.replaceChildren();
    } else {
        if (mobileSummaryBar) mobileSummaryBar.hidden = false;
        var html = '';

        state.cart.forEach(function (item, index) {
            var adults = safeInt(item.adults, 0);
            var children = safeInt(item.children, 0);
            var qtyParts = [];
            if (adults > 0) qtyParts.push(adults + ' ' + t('adultUnit'));
            if (children > 0) qtyParts.push(children + ' ' + t('childUnit'));

            var addOnNames = getCartItemAddonNames(item);
            var qtyText = qtyParts.join(', ');
            if (addOnNames.length > 0) {
                qtyText += (qtyText ? ' + ' : '') + addOnNames.join(', ');
            }

            html += '<div class="cart-item">';
            html += '<div class="cart-item-image" style="background-image:url(\'' + escapeAttr(sanitizeImageUrl(item.image)) + '\')"></div>';
            html += '<div class="cart-item-details">';
            html += '<div class="cart-item-name">' + escapeHtml(getCartItemName(item)) + '</div>';
            html += '<div class="cart-item-qty">' + escapeHtml(qtyText) + '</div>';
            html += '</div>';
            html += '<div class="cart-item-price">$' + safeInt(item.subtotalUSD, 0) + ' USD</div>';
            html += '<button type="button" class="cart-item-remove" onclick="removeFromCart(' + index + ')" aria-label="' + escapeAttr(t('removeFromCartAria')) + '">&times;</button>';
            html += '</div>';
        });

        cartItems.innerHTML = html;
        totalSection.style.display = 'flex';
        if (state.checkoutStep < 1 || state.checkoutStep > 3) state.checkoutStep = 1;
    }

    updateCartTotal();
    goToCheckoutStep(state.checkoutStep, {
        skipValidation: true,
        manageFocus: false,
        scrollIntoView: false,
        preserveStatus: true
    });
}

function showToast(type, title, message) {
    var container = document.getElementById('toast-container');
    if (!container) return;

    var icons = {
        success: SVG.check,
        error: SVG.cross,
        info: SVG.cart
    };

    var toast = document.createElement('div');
    toast.className = 'toast ' + type;

    var iconWrap = document.createElement('span');
    iconWrap.className = 'toast-icon';
    iconWrap.innerHTML = icons[type] || SVG.cart;

    var content = document.createElement('div');
    content.className = 'toast-content';

    var titleEl = document.createElement('div');
    titleEl.className = 'toast-title';
    titleEl.textContent = title || '';

    var msgEl = document.createElement('div');
    msgEl.className = 'toast-message';
    msgEl.textContent = message || '';

    content.appendChild(titleEl);
    content.appendChild(msgEl);
    toast.appendChild(iconWrap);
    toast.appendChild(content);
    container.appendChild(toast);

    setTimeout(function () {
        toast.style.animation = 'toastSlide 0.25s ease reverse';
        setTimeout(function () {
            toast.remove();
        }, 250);
    }, 4000);
}

function bindBookingPreviewListeners() {
    var formInputs = document.querySelectorAll('#booking-form input, #booking-form textarea, #booking-form select');
    formInputs.forEach(function (input) {
        input.addEventListener('input', updatePreviews);
        input.addEventListener('change', updatePreviews);
    });
}

function initDatePicker() {
    window.tourDatePicker = flatpickr('#tour-date', {
        locale: state.language === 'es' ? 'es' : 'default',
        minDate: 'today',
        dateFormat: getDateFormatByLanguage(),
        position: 'auto center',
        disableMobile: false,
        allowInput: false
    });
}

function initTimePicker() {
    var hour = document.getElementById('pickup-hour');
    var minute = document.getElementById('pickup-min');
    var meridian = document.getElementById('pickup-meridian');
    var hidden = document.getElementById('pickup-time');
    if (!hour || !minute || !hidden) return;

    function getMeridian(hourValue) {
        var hr = safeInt(hourValue, 0);
        if (hr >= 5 && hr <= 11) return 'AM';
        if (hr === 12 || hr === 1) return 'PM';
        return '';
    }

    function sync() {
        var currentMeridian = getMeridian(hour.value);
        if (meridian) meridian.textContent = currentMeridian || '--';

        if (hour.value && minute.value && currentMeridian) {
            hidden.value = hour.value + ':' + minute.value + ' ' + currentMeridian;
        } else {
            hidden.value = '';
        }
        updatePreviews();
    }

    hour.addEventListener('change', sync);
    minute.addEventListener('change', sync);
    sync();
}

function toggleOrderSummary() {
    var content = document.getElementById('order-summary-content');
    var toggle = document.getElementById('order-summary-toggle') || document.querySelector('.order-summary-toggle');
    if (!content || !toggle) return;

    var collapsed = content.classList.contains('collapsed');
    content.classList.toggle('collapsed', !collapsed);
    toggle.classList.toggle('collapsed', !collapsed);
    toggle.setAttribute('aria-expanded', String(collapsed));
}

function updateProgressIndicator(step) {
    for (var i = 1; i <= 3; i += 1) {
        var node = document.getElementById('step-' + i);
        if (!node) continue;
        node.classList.remove('active', 'completed');
        if (i < step) node.classList.add('completed');
        if (i === step) node.classList.add('active');
    }
}

function getCheckoutStepView(step) {
    return document.getElementById('checkout-step-' + step);
}

function appendConfirmSummaryRow(container, label, value) {
    if (!container) return;

    var row = document.createElement('div');
    row.className = 'confirm-summary-row';

    var labelEl = document.createElement('span');
    labelEl.className = 'confirm-summary-label';
    labelEl.textContent = label;

    var valueEl = document.createElement('span');
    valueEl.className = 'confirm-summary-value';
    valueEl.textContent = value;

    row.appendChild(labelEl);
    row.appendChild(valueEl);
    container.appendChild(row);
}

function renderConfirmSummary() {
    var customerSummary = document.getElementById('confirm-customer-summary');
    var cartSummary = document.getElementById('confirm-cart-summary');
    if (!customerSummary || !cartSummary) return;

    customerSummary.replaceChildren();
    cartSummary.replaceChildren();

    if (state.cart.length === 0) return;

    var pickupTime = document.getElementById('pickup-time').value || t('notSpecified');
    var hotel = document.getElementById('customer-hotel').value || t('notSpecified');
    var comments = document.getElementById('customer-comments').value.trim() || t('noComments');

    appendConfirmSummaryRow(customerSummary, t('name'), document.getElementById('customer-name').value);
    appendConfirmSummaryRow(customerSummary, t('email'), document.getElementById('customer-email').value);
    appendConfirmSummaryRow(customerSummary, t('phone'), document.getElementById('customer-phone').value);
    appendConfirmSummaryRow(customerSummary, t('tourDate'), document.getElementById('tour-date').value);
    appendConfirmSummaryRow(customerSummary, t('pickupTime'), pickupTime);
    appendConfirmSummaryRow(customerSummary, t('hotel'), hotel);
    appendConfirmSummaryRow(customerSummary, t('comments'), comments);

    state.cart.forEach(function (item) {
        var adults = safeInt(item.adults, 0);
        var children = safeInt(item.children, 0);
        var travelerParts = [];
        if (adults > 0) travelerParts.push(adults + ' ' + t('confirmLineAdults'));
        if (children > 0) travelerParts.push(children + ' ' + t('confirmLineChildren'));

        var addOnNames = getCartItemAddonNames(item);
        var summaryLabel = getCartItemName(item) + ' (' + travelerParts.join(', ') + ')';
        if (addOnNames.length > 0) summaryLabel += ' + ' + addOnNames.join(', ');

        appendConfirmSummaryRow(cartSummary, summaryLabel, '$' + safeInt(item.subtotalUSD, 0) + ' USD');
    });

    var confirmTotalAmount = document.getElementById('confirm-total-amount');
    if (confirmTotalAmount) confirmTotalAmount.textContent = '$' + getCartTotalUSD() + ' USD';
}

function focusCheckoutStep(step) {
    var target = null;
    if (step === 1) {
        target = document.getElementById('checkout-btn');
    } else if (step === 2) {
        target = document.getElementById('customer-name');
    } else if (step === 3) {
        target = document.getElementById('confirm-step-title');
        if (target) target.setAttribute('tabindex', '-1');
    }

    if (!target || target.offsetParent === null || target.disabled) {
        target = document.querySelector('.close-modal');
    }

    if (target) target.focus();
}

function goToCheckoutStep(step, options) {
    var opts = Object.assign({
        skipValidation: false,
        manageFocus: true,
        scrollIntoView: true,
        preserveStatus: false
    }, options || {});

    var nextStep = safeInt(step, 1);
    if (nextStep < 1 || nextStep > 3) nextStep = 1;
    if (state.cart.length === 0) nextStep = 1;

    var form = document.getElementById('booking-form');
    if (nextStep === 3 && !opts.skipValidation) {
        if (!form || !form.checkValidity()) {
            if (form) form.reportValidity();
            hideBookingPreviews();
            showToast('error', t('whatsappErrorTitle'), t('confirmStepInvalid'));
            return false;
        }
    }

    state.checkoutStep = nextStep;
    state.checkoutMode = nextStep > 1;

    for (var i = 1; i <= 3; i += 1) {
        var view = getCheckoutStepView(i);
        if (!view) continue;

        var isActive = i === nextStep;
        view.classList.toggle('active', isActive);
        view.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    }

    var checkoutForm = document.getElementById('checkout-form');
    var checkoutBtn = document.getElementById('checkout-btn');
    var confirmBtn = document.getElementById('confirm-btn');
    var backToCartBtn = document.getElementById('back-to-cart-btn');
    var editDetailsBtn = document.getElementById('edit-details-btn');
    var sendEmailBtn = document.getElementById('send-email-btn');
    var sendWhatsAppBtn = document.getElementById('send-whatsapp-btn');
    var hasItems = state.cart.length > 0;

    if (checkoutForm) checkoutForm.classList.toggle('active', nextStep === 2);
    if (checkoutBtn) checkoutBtn.style.display = hasItems && nextStep === 1 ? 'flex' : 'none';
    if (confirmBtn) confirmBtn.style.display = hasItems && nextStep === 2 ? 'flex' : 'none';
    if (backToCartBtn) backToCartBtn.style.display = hasItems && nextStep >= 2 ? 'flex' : 'none';
    if (editDetailsBtn) editDetailsBtn.style.display = hasItems && nextStep === 3 ? 'flex' : 'none';
    if (sendEmailBtn) sendEmailBtn.style.display = hasItems && nextStep === 3 ? 'flex' : 'none';
    if (sendWhatsAppBtn) sendWhatsAppBtn.style.display = hasItems && nextStep === 3 ? 'flex' : 'none';

    updateProgressIndicator(nextStep);

    if (nextStep >= 2) updatePreviews();
    if (nextStep === 3) renderConfirmSummary();

    if (!opts.preserveStatus) setBookingStatus('idle');

    if (opts.scrollIntoView) {
        var activeView = getCheckoutStepView(nextStep);
        if (activeView) {
            setTimeout(function () {
                activeView.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
            }, 80);
        }
    }

    if (opts.manageFocus) {
        setTimeout(function () {
            focusCheckoutStep(nextStep);
        }, 10);
    }

    return true;
}

function buildWhatsAppMessage() {
    var lines = [];

    lines.push(t('newBooking'));
    lines.push('');
    lines.push('*' + document.getElementById('customer-name').value + '*');
    lines.push(document.getElementById('tour-date').value);

    var pickupTime = document.getElementById('pickup-time').value;
    if (pickupTime) lines.push(pickupTime + ' (MX Time)');

    lines.push(document.getElementById('customer-phone').value);
    lines.push('');
    lines.push(t('tours'));

    state.cart.forEach(function (item) {
        var line = '- ' + getCartItemName(item) + ' (' + safeInt(item.adults, 0) + ' ' + t('adultUnit') + ', ' + safeInt(item.children, 0) + ' ' + t('childUnit') + ')';
        var addOnNames = getCartItemAddonNames(item);
        if (addOnNames.length > 0) line += ' + ' + addOnNames.join(', ');
        line += ' - $' + safeInt(item.subtotalUSD, 0) + ' USD';
        lines.push(line);
    });

    var total = getCartTotalUSD();
    lines.push('');
    lines.push('*TOTAL: $' + total + ' USD*');

    var comments = document.getElementById('customer-comments').value.trim();
    if (comments) {
        lines.push('');
        lines.push(comments);
    }

    return lines.join('\n');
}

function appendEmailRow(container, label, value) {
    var row = document.createElement('div');
    row.className = 'email-row';

    var labelEl = document.createElement('span');
    labelEl.className = 'email-label';
    labelEl.textContent = label;

    var valueEl = document.createElement('span');
    valueEl.className = 'email-value';
    valueEl.textContent = value;

    row.appendChild(labelEl);
    row.appendChild(valueEl);
    container.appendChild(row);
}

function updatePreviews() {
    var form = document.getElementById('booking-form');
    if (!form || !form.checkValidity()) {
        hideBookingPreviews();
        return;
    }

    var whatsappPreview = document.getElementById('whatsapp-preview');
    var whatsappContent = document.getElementById('whatsapp-message-content');
    if (whatsappPreview && whatsappContent) {
        whatsappPreview.style.display = 'block';
        whatsappContent.textContent = buildWhatsAppMessage();
    }

    var emailPreview = document.getElementById('email-preview');
    var emailContent = document.getElementById('email-preview-content');
    if (!emailPreview || !emailContent) return;

    emailPreview.style.display = 'block';
    emailContent.replaceChildren();

    var title = document.createElement('h4');
    title.textContent = t('bookingSummary');
    emailContent.appendChild(title);

    var pickupTime = document.getElementById('pickup-time').value || t('notSpecified');
    var hotel = document.getElementById('customer-hotel').value || t('notSpecified');

    appendEmailRow(emailContent, t('name'), document.getElementById('customer-name').value);
    appendEmailRow(emailContent, t('email'), document.getElementById('customer-email').value);
    appendEmailRow(emailContent, t('phone'), document.getElementById('customer-phone').value);
    appendEmailRow(emailContent, t('tourDate'), document.getElementById('tour-date').value);
    appendEmailRow(emailContent, t('pickupTime'), pickupTime);
    appendEmailRow(emailContent, t('hotel'), hotel);

    var hr = document.createElement('hr');
    hr.style.border = 'none';
    hr.style.borderTop = '1px dashed #ddd';
    hr.style.margin = '12px 0';
    emailContent.appendChild(hr);

    state.cart.forEach(function (item) {
        appendEmailRow(emailContent, getCartItemName(item), '$' + safeInt(item.subtotalUSD, 0));
    });

    var total = getCartTotalUSD();

    var totalRow = document.createElement('div');
    totalRow.className = 'email-total';

    var left = document.createElement('span');
    left.textContent = 'TOTAL';
    var right = document.createElement('span');
    right.textContent = '$' + total + ' USD';

    totalRow.appendChild(left);
    totalRow.appendChild(right);
    emailContent.appendChild(totalRow);

    if (state.checkoutStep === 3) renderConfirmSummary();
}

function proceedToCheckout() {
    goToCheckoutStep(2);
}

function proceedToConfirmation() {
    goToCheckoutStep(3);
}

function buildBookingPayload() {
    var total = getCartTotalUSD();

    return {
        name: document.getElementById('customer-name').value,
        email: document.getElementById('customer-email').value,
        phone: document.getElementById('customer-phone').value,
        date: document.getElementById('tour-date').value,
        pickup_time: document.getElementById('pickup-time').value || '',
        hotel: document.getElementById('customer-hotel').value || '',
        comments: document.getElementById('customer-comments').value || '',
        cart: state.cart,
        total: total
    };
}

async function persistBooking(payload) {
    var response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        var message = t('bookingFailed');
        try {
            var body = await response.json();
            if (body && body.error) message = body.error;
        } catch (_) {
            // ignore json parse errors
        }
        throw new Error(message);
    }

    return response.json();
}

function setBookingButtonsLoading(loading) {
    var sendEmailBtn = document.getElementById('send-email-btn');
    var sendWhatsAppBtn = document.getElementById('send-whatsapp-btn');

    [sendEmailBtn, sendWhatsAppBtn].forEach(function (btn) {
        if (!btn) return;
        btn.disabled = loading;
        btn.classList.toggle('loading', loading);
    });
}

function setBookingStatus(status) {
    var statusEl = document.getElementById('booking-status');
    if (!statusEl) return;

    statusEl.classList.remove('loading', 'success', 'error');

    if (status === 'idle') {
        statusEl.textContent = '';
        return;
    }

    if (status === 'loading') {
        statusEl.textContent = t('bookingStatusLoading');
        statusEl.classList.add('loading');
    } else if (status === 'success') {
        statusEl.textContent = t('bookingStatusSuccess');
        statusEl.classList.add('success');
    } else if (status === 'error') {
        statusEl.textContent = t('bookingStatusError');
        statusEl.classList.add('error');
    }
}

function resetBookingForm() {
    var form = document.getElementById('booking-form');
    if (form) form.reset();

    if (window.tourDatePicker) {
        window.tourDatePicker.clear();
    }

    var pickupTime = document.getElementById('pickup-time');
    if (pickupTime) pickupTime.value = '';

    var pickupMeridian = document.getElementById('pickup-meridian');
    if (pickupMeridian) pickupMeridian.textContent = '--';

    var hotelInput = document.getElementById('customer-hotel');
    if (hotelInput) {
        delete hotelInput.dataset.hotel;
        delete hotelInput.dataset.zone;
    }

    hideMapBtn();
    closeAC();
    setHotelNoMatchHint(false);
    hideBookingPreviews();
}

function completeCheckout() {
    state.cart = [];
    resetBookingForm();
    saveState();
    state.checkoutMode = false;
    state.checkoutStep = 1;
    updateCartUI();
    goToCheckoutStep(1, {
        skipValidation: true,
        manageFocus: false,
        scrollIntoView: false,
        preserveStatus: true
    });

    setTimeout(function () {
        closeCartModal();
    }, 1500);
}

async function sendBookingEmail() {
    if (bookingSubmissionInProgress) return;
    if (state.cart.length === 0) return;
    if (state.checkoutStep !== 3) {
        if (!goToCheckoutStep(3)) return;
    }

    var form = document.getElementById('booking-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    updateProgressIndicator(3);
    bookingSubmissionInProgress = true;
    setBookingButtonsLoading(true);
    setBookingStatus('loading');

    try {
        var payload = buildBookingPayload();
        await persistBooking(payload);

        var summary = state.cart.map(function (item) {
            var line = getCartItemName(item) + ': ' + safeInt(item.adults, 0) + ' ' + t('adultUnit') + ', ' + safeInt(item.children, 0) + ' ' + t('childUnit');
            var addOnNames = getCartItemAddonNames(item);
            if (addOnNames.length > 0) line += ' + ' + addOnNames.join(', ');
            line += ' - $' + safeInt(item.subtotalUSD, 0) + ' USD';
            return line;
        }).join('\n');

        if (CONFIG.emailjs && CONFIG.emailjs.serviceId && CONFIG.emailjs.templateId && typeof emailjs !== 'undefined') {
            await emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.templateId, {
                customer_name: payload.name,
                customer_email: payload.email,
                customer_phone: payload.phone,
                tour_date: payload.date,
                pickup_time: payload.pickup_time || t('notSpecified'),
                customer_hotel: payload.hotel || t('notSpecified'),
                customer_comments: payload.comments || t('noComments'),
                cart_summary: summary,
                total_amount: '$' + payload.total + ' USD'
            });
        }

        setBookingStatus('success');
        showToast('success', t('bookingSentTitle'), t('bookingSentMessage'));
        completeCheckout();
    } catch (e) {
        console.error(e);
        setBookingStatus('error');
        showToast('error', t('whatsappErrorTitle'), e.message || t('emailFallbackError'));
    } finally {
        bookingSubmissionInProgress = false;
        setBookingButtonsLoading(false);
    }
}

async function sendToWhatsApp() {
    if (bookingSubmissionInProgress) return;
    if (state.cart.length === 0) return;
    if (state.checkoutStep !== 3) {
        if (!goToCheckoutStep(3)) return;
    }

    var form = document.getElementById('booking-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    updateProgressIndicator(3);
    bookingSubmissionInProgress = true;
    setBookingButtonsLoading(true);
    setBookingStatus('loading');

    try {
        var payload = buildBookingPayload();
        await persistBooking(payload);

        var message = buildWhatsAppMessage();
        window.open('https://wa.me/' + CONFIG.whatsapp.phone + '?text=' + encodeURIComponent(message), '_blank');

        setBookingStatus('success');
        showToast('success', t('bookingSentTitle'), t('bookingSavedForWhatsApp'));
        completeCheckout();
    } catch (e) {
        console.error(e);
        setBookingStatus('error');
        showToast('error', t('whatsappErrorTitle'), e.message || t('whatsappErrorMessage'));
    } finally {
        bookingSubmissionInProgress = false;
        setBookingButtonsLoading(false);
    }
}

var hotelAC = { wrap: null, list: null, hint: null, idx: -1, open: false };

function setHotelNoMatchHint(visible) {
    if (!hotelAC.hint) {
        hotelAC.hint = document.getElementById('hotel-no-match-hint');
    }
    if (!hotelAC.hint) return;

    if (visible) {
        hotelAC.hint.removeAttribute('hidden');
    } else {
        hotelAC.hint.setAttribute('hidden', '');
    }
}

function initHotelAutocomplete() {
    var input = document.getElementById('customer-hotel');
    if (!input || hotelAC.wrap) return;

    var wrap = document.createElement('div');
    wrap.className = 'ac-wrap';

    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    var list = document.createElement('ul');
    list.className = 'ac-list';
    wrap.appendChild(list);

    hotelAC.wrap = wrap;
    hotelAC.list = list;
    hotelAC.hint = document.getElementById('hotel-no-match-hint');
    input.setAttribute('autocomplete', 'off');
    setHotelNoMatchHint(false);

    input.addEventListener('input', function () {
        delete this.dataset.hotel;
        delete this.dataset.zone;
        filterHotels(this.value);
        hideMapBtn();
    });

    input.addEventListener('focus', function () {
        if (this.value.length >= 2) filterHotels(this.value);
    });

    input.addEventListener('blur', function () {
        var value = this.value.trim();
        setHotelNoMatchHint(false);
        setTimeout(function () {
            closeAC();
        }, 120);
        if (value.length > 2) {
            setTimeout(function () {
                showMapBtn(value);
            }, 300);
        }
    });

    input.addEventListener('keydown', function (e) {
        var items = list.querySelectorAll('.ac-item');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            hotelAC.idx = Math.min(hotelAC.idx + 1, items.length - 1);
            highlightAC(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            hotelAC.idx = Math.max(hotelAC.idx - 1, 0);
            highlightAC(items);
        } else if (e.key === 'Enter' && hotelAC.open && hotelAC.idx >= 0) {
            e.preventDefault();
            if (items[hotelAC.idx]) items[hotelAC.idx].dispatchEvent(new Event('mousedown'));
        } else if (e.key === 'Escape') {
            closeAC();
        }
    });

    document.addEventListener('click', function (e) {
        if (!wrap.contains(e.target)) closeAC();
    });
}

function createHighlightedName(text, query) {
    var fragment = document.createDocumentFragment();
    var source = safeText(text);
    var lower = source.toLowerCase();
    var q = safeText(query).toLowerCase();
    var idx = lower.indexOf(q);

    if (idx === -1 || !q) {
        fragment.appendChild(document.createTextNode(source));
        return fragment;
    }

    fragment.appendChild(document.createTextNode(source.slice(0, idx)));
    var strong = document.createElement('strong');
    strong.textContent = source.slice(idx, idx + q.length);
    fragment.appendChild(strong);
    fragment.appendChild(document.createTextNode(source.slice(idx + q.length)));
    return fragment;
}

function filterHotels(query) {
    var list = hotelAC.list;
    hotelAC.idx = -1;
    var normalized = safeText(query).trim();

    if (!list || normalized.length < 2) {
        closeAC();
        setHotelNoMatchHint(false);
        return;
    }

    var lower = normalized.toLowerCase();
    var results = HOTELS.filter(function (hotel) {
        return hotel.n.toLowerCase().indexOf(lower) !== -1 || hotel.z.toLowerCase().indexOf(lower) !== -1;
    }).slice(0, 12);

    if (results.length === 0) {
        closeAC();
        setHotelNoMatchHint(true);
        return;
    }

    setHotelNoMatchHint(false);
    list.innerHTML = '';

    results.forEach(function (hotel) {
        var item = document.createElement('li');
        item.className = 'ac-item';

        var name = document.createElement('span');
        name.className = 'ac-name';
        name.appendChild(createHighlightedName(hotel.n, lower));

        var zone = document.createElement('span');
        zone.className = 'ac-zone';
        zone.textContent = hotel.z;

        item.appendChild(name);
        item.appendChild(zone);

        item.addEventListener('mousedown', function (event) {
            event.preventDefault();
            selectHotel(hotel.n, hotel.z);
        });

        list.appendChild(item);
    });

    list.style.display = 'block';
    hotelAC.open = true;
}

function highlightAC(items) {
    items.forEach(function (item, index) {
        item.classList.toggle('ac-active', index === hotelAC.idx);
        if (index === hotelAC.idx) {
            item.scrollIntoView({ block: 'nearest' });
        }
    });
}

function selectHotel(name, zone) {
    var input = document.getElementById('customer-hotel');
    if (!input) return;

    input.value = name + ' (' + zone + ')';
    input.dataset.hotel = name;
    input.dataset.zone = zone;

    closeAC();
    setHotelNoMatchHint(false);
    showMapBtn(name);
    updatePreviews();
}

function closeAC() {
    if (hotelAC.list) {
        hotelAC.list.style.display = 'none';
    }
    hotelAC.open = false;
    hotelAC.idx = -1;
}

function showMapBtn(hotelName) {
    hideMapBtn();

    if (!hotelName || hotelName.length < 3) return;

    var wrap = hotelAC.wrap || document.getElementById('customer-hotel').parentNode;
    if (!wrap) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hotel-map-btn';
    btn.title = t('mapsTitle');
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> <span></span>';

    var label = btn.querySelector('span');
    if (label) label.textContent = t('maps');

    btn.onclick = function () {
        openHotelMap(hotelName);
    };

    wrap.appendChild(btn);
}

function hideMapBtn() {
    var existing = document.querySelector('.hotel-map-btn');
    if (existing) existing.remove();
}

function openHotelMap(name) {
    var query = encodeURIComponent(name + ' Cancun Mexico');
    window.open('https://www.google.com/maps/search/?api=1&query=' + query, '_blank');
}

function addAdminPricingRow() {
    var container = document.getElementById('admin-pricing-container');
    if (!container) return;

    var row = document.createElement('div');
    row.className = 'admin-dynamic-row pricing-row';
    row.innerHTML = '<input type="number" placeholder="Adults (e.g. 1)" class="p-adults" required><input type="number" placeholder="Price (e.g. 150)" class="p-price" required><button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">X</button>';
    container.appendChild(row);
}

function addAdminItineraryRow() {
    var container = document.getElementById('admin-itinerary-container');
    if (!container) return;

    var row = document.createElement('div');
    row.className = 'admin-dynamic-row itinerary-row';
    row.innerHTML = '<input type="text" placeholder="EN Step" class="i-en" required><input type="text" placeholder="ES Step" class="i-es" required><button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">X</button>';
    container.appendChild(row);
}

function addAdminInclRow(type) {
    var container = document.getElementById('admin-' + type + '-container');
    if (!container) return;

    var row = document.createElement('div');
    row.className = 'admin-dynamic-row ' + type + '-row';
    row.innerHTML = '<input type="text" placeholder="EN" class="inc-en" required><input type="text" placeholder="ES" class="inc-es" required><button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">X</button>';
    container.appendChild(row);
}

function filesAreJpg(fileList) {
    return Array.from(fileList || []).every(function (file) {
        if (!file) return true;
        var mime = String(file.type || '').toLowerCase();
        return mime === 'image/jpeg' || mime === 'image/jpg' || /\.jpe?g$/i.test(file.name || '');
    });
}

async function handleAdminAddTour(e) {
    e.preventDefault();

    var submitBtn = document.getElementById('admin-submit-tour-btn');
    if (submitBtn) submitBtn.disabled = true;

    try {
        if (!isAdminLoggedIn()) {
            throw new Error(t('adminAuthRequired'));
        }

        var rawSlug = document.getElementById('admin-tour-slug').value.trim();
        var slug = sanitizeSlugClient(rawSlug);
        if (!slug) throw new Error(t('invalidSlug'));

        var heroFile = document.getElementById('admin-img-hero').files[0];
        var cardFile = document.getElementById('admin-img-card').files[0];
        var galleryFiles = document.getElementById('admin-img-gallery').files;

        if (!filesAreJpg([heroFile, cardFile]) || !filesAreJpg(galleryFiles)) {
            throw new Error(t('onlyJpgError'));
        }

        var data = {
            slug: slug,
            price_from: safeInt(document.getElementById('admin-tour-price-from').value, 0),
            child_price_flat: safeInt(document.getElementById('admin-tour-child-price').value, 0),
            title_en: document.getElementById('admin-tour-title-en').value,
            title_es: document.getElementById('admin-tour-title-es').value,
            subtitle_en: document.getElementById('admin-tour-subtitle-en').value,
            subtitle_es: document.getElementById('admin-tour-subtitle-es').value,
            short_desc_en: document.getElementById('admin-tour-short-en').value,
            short_desc_es: document.getElementById('admin-tour-short-es').value,
            description_en: document.getElementById('admin-tour-desc-en').value,
            description_es: document.getElementById('admin-tour-desc-es').value,
            card_thumbnail: 2,
            hero_image: 1,
            pricing_tiers: [],
            itinerary: [],
            includes: [],
            excludes: [],
            gallery_images: []
        };

        document.querySelectorAll('.pricing-row').forEach(function (row) {
            data.pricing_tiers.push({
                adults: safeInt(row.querySelector('.p-adults').value, 0),
                adult_price: safeInt(row.querySelector('.p-price').value, 0)
            });
        });

        document.querySelectorAll('.itinerary-row').forEach(function (row) {
            data.itinerary.push({
                en: row.querySelector('.i-en').value,
                es: row.querySelector('.i-es').value
            });
        });

        document.querySelectorAll('.includes-row').forEach(function (row) {
            data.includes.push({
                en: row.querySelector('.inc-en').value,
                es: row.querySelector('.inc-es').value
            });
        });

        document.querySelectorAll('.excludes-row').forEach(function (row) {
            data.excludes.push({
                en: row.querySelector('.inc-en').value,
                es: row.querySelector('.inc-es').value
            });
        });

        var formData = new FormData();
        formData.append('slug', slug);

        if (heroFile) formData.append('images', heroFile, '1.jpg');
        if (cardFile) formData.append('images', cardFile, '2.jpg');

        for (var i = 0; i < galleryFiles.length; i += 1) {
            var num = i + 3;
            data.gallery_images.push(num);
            formData.append('images', galleryFiles[i], num + '.jpg');
        }

        formData.append('data', JSON.stringify(data));

        var response = await adminFetch('/api/tours', {
            method: 'POST',
            body: formData
        });

        var result = await response.json();
        if (!response.ok || result.status !== 'ok') {
            throw new Error(result.error || t('saveError'));
        }

        showToast('success', state.language === 'es' ? 'Éxito' : 'Success', t('tourSaved'));

        document.getElementById('admin-add-tour-form').reset();
        document.getElementById('admin-itinerary-container').innerHTML = '';
        document.getElementById('admin-pricing-container').innerHTML = '';
        document.getElementById('admin-includes-container').innerHTML = '';
        document.getElementById('admin-excludes-container').innerHTML = '';

        try {
            var refreshed = await fetch('/api/tours').then(function (r) { return r.json(); });
            TOURS = {};
            refreshed.forEach(function (tour) {
                TOURS[tour.id] = tour;
            });
            if (state.currentView === 'catalog') renderCatalog();
        } catch (_) {
            // Ignore refresh issues after successful save.
        }
    } catch (err) {
        console.error(err);
        showToast('error', state.language === 'es' ? 'Error' : 'Error', err.message || t('saveError'));
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}
