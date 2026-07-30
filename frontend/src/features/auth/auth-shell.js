import { icon } from '../../components/icons.js';

export function renderAuthSidePanel({ title, subtitle, features }) {
    return `
    <div class="auth-side-panel">
        <a href="#/" class="auth-side-brand">${icon('shield-check', { size: 18 })} DocSlot</a>
        <h1 class="auth-side-title">${title}</h1>
        <p class="auth-side-subtitle">${subtitle}</p>
        <ul class="auth-side-features">
            ${features.map(f => `<li>${icon('check-circle', { size: 16 })} ${f}</li>`).join('')}
        </ul>
        <div class="auth-side-blob"></div>
    </div>`;
}

export function renderPasswordField({ id, label, placeholder, minlength }) {
    return `
    <div class="form-group">
        <label for="${id}">${label}</label>
        <div class="password-field">
            <input type="password" id="${id}" name="${id}" class="form-control" required
                ${minlength ? `minlength="${minlength}"` : ''} placeholder="${placeholder}" />
            <button type="button" class="password-toggle-btn" data-target="${id}" aria-label="Show password">${icon('eye', { size: 16 })}</button>
        </div>
    </div>`;
}

export function bindPasswordToggles(root = document) {
    root.querySelectorAll('.password-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.dataset.target);
            if (!input) return;
            const showing = input.type === 'text';
            input.type = showing ? 'password' : 'text';
            btn.innerHTML = icon(showing ? 'eye' : 'eye-off', { size: 16 });
        });
    });
}
