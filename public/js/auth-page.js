(function () {
    'use strict';

    var CUSTOMER_AUTH_SESSION_KEY = 'lindotours_customer_auth';
    var COPY = {
        loading: 'Procesando acceso...',
        loginLoading: 'Iniciando sesión...',
        registerLoading: 'Creando cuenta...',
        emailRequired: 'Ingresa tu correo electrónico.',
        passwordRules: 'La contraseña debe tener al menos 8 caracteres.',
        passwordMismatch: 'Las contraseñas no coinciden.',
        loginError: 'Correo o contraseña incorrectos.',
        registerError: 'Este correo ya está registrado.',
        loginSuccess: 'Sesión iniciada. Tus compras fueron restauradas.',
        registerSuccess: 'Cuenta creada. Tus compras ya están disponibles.',
        configError: 'No fue posible cargar la configuración de acceso.',
        googleUnavailable: 'Google Sign-In no está disponible en este momento.',
        googleSetupHint: 'Google Sign-In estará disponible cuando se configure GOOGLE_CLIENT_ID en el servidor.',
        googleReadyHint: 'También puedes entrar con Google en un solo paso.',
        googleLoadingHint: 'Estamos cargando Google Sign-In...',
        googleError: 'No se pudo completar el acceso con Google.',
        invalidSession: 'La sesión recibida no es válida.'
    };
    var authState = {
        mode: 'register',
        busy: false,
        googleClientId: '',
        googleEnabled: false,
        googleInitialized: false,
        googleRendered: false,
        configLoaded: false
    };

    function safeText(value) {
        return String(value == null ? '' : value).trim();
    }

    function getMode() {
        var body = document.body;
        var mode = safeText(body && body.dataset ? body.dataset.authMode : '').toLowerCase();
        return mode === 'login' ? 'login' : 'register';
    }

    function getAppRootPath() {
        return (window.location.pathname || '/').replace(/[^/]+$/, '');
    }

    function redirectToAccount() {
        window.location.replace(getAppRootPath() + '#account');
    }

    function setStatus(status, message) {
        var statusEl = document.getElementById('auth-status');
        if (!statusEl) return;

        statusEl.classList.remove('loading', 'success', 'error');
        if (!status || status === 'idle') {
            statusEl.textContent = '';
            return;
        }

        statusEl.textContent = message || '';
        if (status === 'loading' || status === 'success' || status === 'error') {
            statusEl.classList.add(status);
        }
    }

    function setGoogleNote(message) {
        var note = document.getElementById('auth-google-note');
        if (note) note.textContent = message || '';
    }

    function readStoredCustomerSession() {
        try {
            var raw = sessionStorage.getItem(CUSTOMER_AUTH_SESSION_KEY);
            if (!raw) return null;
            var session = JSON.parse(raw);
            if (!session || !session.token || !session.profile || !session.profile.publicId) return null;
            if (Date.parse(session.expiresAt || '') <= Date.now()) {
                sessionStorage.removeItem(CUSTOMER_AUTH_SESSION_KEY);
                return null;
            }
            return session;
        } catch (_) {
            sessionStorage.removeItem(CUSTOMER_AUTH_SESSION_KEY);
            return null;
        }
    }

    function rememberCustomerSession(result) {
        if (!result || !result.token || !result.profile || !result.profile.publicId) {
            throw new Error(COPY.invalidSession);
        }

        sessionStorage.setItem(CUSTOMER_AUTH_SESSION_KEY, JSON.stringify({
            token: safeText(result.token),
            expiresAt: safeText(result.expiresAt),
            profile: result.profile
        }));
    }

    function syncModeUI() {
        var isLogin = authState.mode === 'login';
        var fullNameGroup = document.getElementById('auth-full-name-group');
        var confirmGroup = document.getElementById('auth-confirm-password-group');
        var passwordInput = document.getElementById('auth-password-input');
        var confirmInput = document.getElementById('auth-confirm-password-input');
        var fullNameInput = document.getElementById('auth-full-name-input');

        if (fullNameGroup) fullNameGroup.hidden = isLogin;
        if (confirmGroup) confirmGroup.hidden = isLogin;
        if (confirmInput) confirmInput.required = !isLogin;
        if (passwordInput) passwordInput.setAttribute('autocomplete', isLogin ? 'current-password' : 'new-password');
        if (fullNameInput) fullNameInput.required = false;
    }

    function updateGoogleAvailabilityUI(options) {
        var opts = options || {};
        var fallback = document.getElementById('google-fallback');
        var container = document.getElementById('google-signin');

        if (!fallback || !container) return;

        fallback.hidden = Boolean(opts.hideFallback);
        fallback.classList.toggle('is-pending', Boolean(opts.pending));
        if (opts.clearContainer) {
            container.innerHTML = '';
            authState.googleRendered = false;
        }
        if (opts.note) setGoogleNote(opts.note);
    }

    function waitForGoogleIdentity(timeoutMs) {
        var startedAt = Date.now();
        return new Promise(function (resolve, reject) {
            (function check() {
                if (window.google && google.accounts && google.accounts.id) {
                    resolve();
                    return;
                }
                if (Date.now() - startedAt > timeoutMs) {
                    reject(new Error(COPY.googleUnavailable));
                    return;
                }
                window.setTimeout(check, 120);
            })();
        });
    }

    async function loadCustomerAuthConfig() {
        var response = await fetch('/api/config');
        var result = await response.json().catch(function () { return {}; });
        if (!response.ok || (result && result.error)) {
            throw new Error(COPY.configError);
        }
        return result && result.auth && result.auth.customer ? result.auth.customer : {};
    }

    async function ensureGoogleSignInUI() {
        var container = document.getElementById('google-signin');
        if (!container) return false;

        if (!authState.googleEnabled || !authState.googleClientId) {
            updateGoogleAvailabilityUI({
                hideFallback: false,
                pending: true,
                clearContainer: true,
                note: authState.configLoaded ? COPY.googleSetupHint : COPY.configError
            });
            return false;
        }

        updateGoogleAvailabilityUI({
            hideFallback: false,
            pending: true,
            note: COPY.googleLoadingHint
        });

        try {
            await waitForGoogleIdentity(8000);
            if (!authState.googleInitialized) {
                google.accounts.id.initialize({
                    client_id: authState.googleClientId,
                    callback: function (credentialResponse) {
                        setStatus('loading', COPY.loading);
                        handleGoogleCredentialResponse(credentialResponse).catch(function (error) {
                            console.error(error);
                            setStatus('error', error.message || COPY.googleError);
                        });
                    },
                    auto_select: false,
                    cancel_on_tap_outside: true
                });
                authState.googleInitialized = true;
            }

            if (!authState.googleRendered) {
                container.innerHTML = '';
                google.accounts.id.renderButton(container, {
                    theme: 'outline',
                    size: 'large',
                    shape: 'pill',
                    text: 'continue_with',
                    width: Math.max(240, Math.min(420, container.clientWidth || 360))
                });
                authState.googleRendered = true;
            }

            updateGoogleAvailabilityUI({
                hideFallback: true,
                pending: false,
                note: COPY.googleReadyHint
            });
            return true;
        } catch (error) {
            console.error(error);
            updateGoogleAvailabilityUI({
                hideFallback: false,
                pending: false,
                clearContainer: true,
                note: COPY.googleUnavailable
            });
            return false;
        }
    }

    async function handleGoogleCredentialResponse(payload) {
        if (!payload || !payload.credential) {
            throw new Error(COPY.googleError);
        }

        var response = await fetch('/api/auth/customer/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                credential: payload.credential
            })
        });
        var result = await response.json().catch(function () { return {}; });
        if (!response.ok || (result && result.error)) {
            throw new Error((result && result.error) || COPY.googleError);
        }

        rememberCustomerSession(result);
        setStatus('success', COPY.loginSuccess);
        redirectToAccount();
    }

    async function submitCustomerAuth(event) {
        if (event) event.preventDefault();
        if (authState.busy) return;

        var emailInput = document.getElementById('auth-email-input');
        var passwordInput = document.getElementById('auth-password-input');
        var fullNameInput = document.getElementById('auth-full-name-input');
        var confirmInput = document.getElementById('auth-confirm-password-input');
        var submitBtn = document.getElementById('auth-submit-btn');
        var payload = {
            fullName: safeText(fullNameInput && fullNameInput.value),
            email: safeText(emailInput && emailInput.value).toLowerCase(),
            password: passwordInput ? passwordInput.value : ''
        };
        var endpoint = authState.mode === 'login' ? '/api/auth/customer/login' : '/api/auth/customer/register';

        if (!payload.email) {
            setStatus('error', COPY.emailRequired);
            return;
        }
        if (!payload.password || payload.password.length < 8) {
            setStatus('error', COPY.passwordRules);
            return;
        }
        if (authState.mode !== 'login' && payload.password !== (confirmInput ? confirmInput.value : '')) {
            setStatus('error', COPY.passwordMismatch);
            return;
        }

        authState.busy = true;
        if (submitBtn) submitBtn.classList.add('loading');
        setStatus('loading', authState.mode === 'login' ? COPY.loginLoading : COPY.registerLoading);

        try {
            var response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            var result = await response.json().catch(function () { return {}; });
            if (!response.ok || (result && result.error)) {
                throw new Error((result && result.error) || (authState.mode === 'login' ? COPY.loginError : COPY.registerError));
            }

            rememberCustomerSession(result);
            setStatus('success', authState.mode === 'login' ? COPY.loginSuccess : COPY.registerSuccess);
            redirectToAccount();
        } catch (error) {
            console.error(error);
            setStatus('error', error.message || (authState.mode === 'login' ? COPY.loginError : COPY.registerError));
        } finally {
            authState.busy = false;
            if (submitBtn) submitBtn.classList.remove('loading');
        }
    }

    function bindEvents() {
        var form = document.getElementById('customer-auth-form');
        var googleFallback = document.getElementById('google-fallback');

        if (form) {
            form.addEventListener('submit', submitCustomerAuth);
        }
        if (googleFallback) {
            googleFallback.addEventListener('click', function () {
                if (!authState.googleEnabled || !authState.googleClientId) {
                    setStatus('error', COPY.googleSetupHint);
                    return;
                }
                setStatus('loading', COPY.googleLoadingHint);
                ensureGoogleSignInUI().then(function (ready) {
                    if (ready) setStatus('idle');
                });
            });
        }
    }

    async function initAuthPage() {
        authState.mode = getMode();
        syncModeUI();
        bindEvents();

        if (readStoredCustomerSession()) {
            redirectToAccount();
            return;
        }

        try {
            var config = await loadCustomerAuthConfig();
            authState.googleEnabled = Boolean(config.googleEnabled);
            authState.googleClientId = safeText(config.googleClientId);
            authState.configLoaded = true;
        } catch (error) {
            console.error(error);
            authState.googleEnabled = false;
            authState.googleClientId = '';
            authState.configLoaded = false;
            setGoogleNote(COPY.configError);
        }

        await ensureGoogleSignInUI();
    }

    initAuthPage().catch(function (error) {
        console.error(error);
        setStatus('error', 'No se pudo preparar la página.');
    });
})();
