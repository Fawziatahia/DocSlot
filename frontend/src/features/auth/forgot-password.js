export function renderForgotPassword() {
    return `
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <h1>Forgot Password</h1>
                <p>Enter your email and we'll send you a reset link</p>
            </div>
            <form id="forgot-password-form" class="auth-form">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" class="form-control" required placeholder="your@email.com" />
                </div>
                <div id="forgot-password-error" class="alert alert-danger" style="display:none"></div>
                <div id="forgot-password-success" class="alert alert-success" style="display:none"></div>
                <button type="submit" id="forgot-password-btn" class="btn btn-primary btn-block">Send Reset Link</button>
            </form>
            <div class="auth-footer">
                <p><a href="#/login">Back to sign in</a></p>
            </div>
        </div>
    </div>`;
}

export function initForgotPassword() {
    const form = document.getElementById('forgot-password-form');
    const errorEl = document.getElementById('forgot-password-error');
    const successEl = document.getElementById('forgot-password-success');
    const btn = document.getElementById('forgot-password-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.style.display = 'none';
        successEl.style.display = 'none';
        btn.disabled = true;
        btn.textContent = 'Sending...';

        try {
            const { authService } = await import('../../services/auth.js');
            const res = await authService.forgotPassword(form.email.value);
            successEl.textContent = res.message || 'Password reset link sent to your email.';
            successEl.style.display = 'block';
            form.email.value = '';
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Send Reset Link';
        }
    });
}
