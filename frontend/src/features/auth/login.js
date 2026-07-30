import { icon } from '../../components/icons.js';
import { renderAuthSidePanel, renderPasswordField, bindPasswordToggles } from './auth-shell.js';

export function renderLogin() {
    return `
    <div class="auth-page">
        ${renderAuthSidePanel({
            title: 'Welcome back.',
            subtitle: 'Sign in to manage your appointments and records.',
            features: [
                '500+ verified specialists',
                'Instant appointment booking',
                'Real-time booking notifications',
                'Your data stays private and secure',
            ],
        })}
        <div class="auth-form-panel">
            <div class="auth-card">
                <div class="auth-header">
                    <h1>Sign In</h1>
                    <p>New to DocSlot? <a href="#/register">Create a free account &rarr;</a></p>
                </div>
                <form id="login-form" class="auth-form">
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" name="email" class="form-control" required placeholder="your@email.com" />
                    </div>
                    ${renderPasswordField({ id: 'password', label: 'Password', placeholder: 'Enter your password' })}
                    <div class="auth-form-links">
                        <a href="#/forgot-password">Forgot password?</a>
                    </div>
                    <div id="login-error" class="alert alert-danger" style="display:none"></div>
                    <button type="submit" id="login-btn" class="btn btn-primary btn-block btn-lg">Sign In to DocSlot</button>
                </form>
                <p class="auth-secure-note">${icon('lock', { size: 13 })} Secure, encrypted sign-in</p>
            </div>
        </div>
    </div>`;
}

export function initLogin() {
    const form = document.getElementById('login-form');
    const errorEl = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');

    bindPasswordToggles(form);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.style.display = 'none';
        btn.disabled = true;
        btn.textContent = 'Signing in...';

        try {
            const { authService } = await import('../../services/auth.js');
            const { syncLayoutFromAuth } = await import('../../utils/layout.js');
            await authService.login(
                form.email.value,
                form.password.value
            );

            syncLayoutFromAuth();
            window.location.hash = '#/dashboard';
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Sign In to DocSlot';
        }
    });
}
