export function renderLogin() {
    return `
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <h1>DocSlot</h1>
                <p>Sign in to your account</p>
            </div>
            <form id="login-form" class="auth-form">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" class="form-control" required placeholder="your@email.com" />
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" class="form-control" required placeholder="Enter your password" />
                </div>
                <div id="login-error" class="alert alert-danger" style="display:none"></div>
                <button type="submit" id="login-btn" class="btn btn-primary btn-block">Sign In</button>
            </form>
            <div class="auth-footer">
                <p>Don't have an account? <a href="#/register">Register</a></p>
                <p><a href="#/forgot-password">Forgot your password?</a></p>
            </div>
        </div>
    </div>`;
}

export function initLogin() {
    const form = document.getElementById('login-form');
    const errorEl = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');

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
            btn.textContent = 'Sign In';
        }
    });
}
