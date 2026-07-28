import './assets/css/app.css';
import './assets/css/components.css';
import { initRouter, registerRoute, setCurrentLayout } from './router/router.js';
import { authService } from './services/auth.js';
import { storage } from './utils/storage.js';

// ── Route Registrations ──

// Auth routes (guest layout)
import { renderLogin, initLogin } from './features/auth/login.js';
import { renderRegister, initRegister } from './features/auth/register.js';
import { renderForgotPassword, initForgotPassword } from './features/auth/forgot-password.js';
import { renderResetPassword, initResetPassword } from './features/auth/reset-password.js';

registerRoute('/login', {
    render: renderLogin,
    init: initLogin,
    layout: 'guest',
});

registerRoute('/register', {
    render: renderRegister,
    init: initRegister,
    layout: 'guest',
});

registerRoute('/forgot-password', {
    render: renderForgotPassword,
    init: initForgotPassword,
    layout: 'guest',
});

registerRoute('/reset-password', {
    render: renderResetPassword,
    init: initResetPassword,
    layout: 'guest',
});

// Default route — redirect based on auth state
registerRoute('/', {
    render: () => {
        if (authService.isAuthenticated()) {
            window.location.hash = '#/dashboard';
            return '';
        }
        window.location.hash = '#/login';
        return '';
    },
    init: () => {},
    layout: 'guest',
});

// 404
registerRoute('/404', {
    render: () => `
        <div class="empty-state">
            <h2>404 — Page Not Found</h2>
            <p>The page you're looking for doesn't exist.</p>
            <a href="#/" class="btn btn-primary" style="margin-top: 1rem;">Go Home</a>
        </div>`,
    init: () => {},
    layout: 'guest',
});

// ── Global logout handler ──
document.addEventListener('click', async (e) => {
    const btn = e.target.closest('#logout-btn');
    if (!btn) return;

    e.preventDefault();
    try {
        await authService.logout();
    } catch {
        // Even if the API call fails, clear local state
        storage?.clearAuth();
    }
    window.location.hash = '#/login';
});

// ── Set layout based on auth state ──
if (authService.isAuthenticated()) {
    const user = authService.getUser();
    setCurrentLayout(user?.role === 'doctor' ? 'doctor' : 'patient');
} else {
    setCurrentLayout('guest');
}

// ── Boot the router ──
initRouter();
