/**
 * Hash-based SPA router.
 *
 * Routes — key is the hash fragment (without #), value is
 * { render: () => HTML string, init?: () => void, layout?: string }
 */

const routes = new Map();
let currentLayout = 'guest';

// Pre-imported layouts (Vite needs static imports for bundling)
import guestLayout from '../layouts/guest.js';
import patientLayout from '../layouts/patient.js';
import doctorLayout from '../layouts/doctor.js';
import adminLayout from '../layouts/admin.js';

const layouts = {
    guest: guestLayout,
    patient: patientLayout,
    doctor: doctorLayout,
    admin: adminLayout,
};

export function registerRoute(hash, config) {
    routes.set(hash, config);
}

export function setCurrentLayout(layout) {
    currentLayout = layout;
}

export function getCurrentLayout() {
    return currentLayout;
}

export function navigate(hash) {
    window.location.hash = hash;
}

export function getCurrentHash() {
    return window.location.hash.slice(1) || '/';
}

export function getLayoutContent(layoutName) {
    return layouts[layoutName] || layouts.guest || '';
}

export async function handleRoute() {
    const hash = getCurrentHash();

    // Try exact match first
    let handler = routes.get(hash);

    // Try dynamic match (e.g. /appointments/123)
    if (!handler) {
        for (const [pattern, h] of routes.entries()) {
            const regex = patternToRegex(pattern);
            const match = hash.match(regex);
            if (match) {
                handler = { ...h, params: match.groups || {} };
                break;
            }
        }
    }

    const app = document.getElementById('app');
    if (!app) return;

    if (!handler) {
        const fallback = routes.get('/404');
        if (fallback) {
            app.innerHTML = wrapWithLayout(fallback.render(), fallback.layout || currentLayout);
            fallback.init?.();
        }
        return;
    }

    // Switch layout if specified
    const layout = handler.layout || currentLayout;

    // Store handler params for the init function
    window.__routeParams = handler.params || {};

    app.innerHTML = wrapWithLayout(handler.render(), layout);
    handler.init?.();
}

function wrapWithLayout(content, layoutName) {
    const layout = getLayoutContent(layoutName);
    if (!layout) return content;
    return layout.replace(/<slot\/?>/, content);
}

function patternToRegex(pattern) {
    const escaped = pattern.replace(/[-[\]{}()+?.,\\^$|#\s]/g, '\\$&');
    const named = escaped.replace(/:(\w+)/g, (_, name) => `(?<${name}>[^/]+)`);
    return new RegExp(`^${named}$`);
}

// Init router
export function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}
