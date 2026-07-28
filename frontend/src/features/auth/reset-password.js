export function renderResetPassword() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || '';
    const email = params.get('email') || '';

    return `
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <h1>Reset Password</h1>
                <p>Enter your new password</p>
            </div>
            <form id="reset-password-form" class="auth-form">
                <input type="hidden" name="token" value="${token}" />
                <input type="hidden" name="email" value="${email}" />
                <div class="form-group">
                    <label for="password">New Password</label>
                    <input type="password" id="password" name="password" class="form-control" required minlength="8" placeholder="Min. 8 characters" />
                </div>
                <div class="form-group">
                    <label for="password_confirmation">Confirm Password</label>
                    <input type="password" id="password_confirmation" name="password_confirmation" class="form-control" required placeholder="Repeat password" />
                </div>
                <div id="reset-password-error" class="alert alert-danger" style="display:none"></div>
                <div id="reset-password-success" class="alert alert-success" style="display:none"></div>
                <button type="submit" id="reset-password-btn" class="btn btn-primary btn-block">Reset Password</button>
            </form>
            <div class="auth-footer">
                <p><a href="#/login">Back to sign in</a></p>
            </div>
        </div>
    </div>`;
}

export function initResetPassword() {
    const form = document.getElementById('reset-password-form');
    const errorEl = document.getElementById('reset-password-error');
    const successEl = document.getElementById('reset-password-success');
    const btn = document.getElementById('reset-password-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.style.display = 'none';
        successEl.style.display = 'none';
        btn.disabled = true;
        btn.textContent = 'Resetting...';

        try {
            const { authService } = await import('../../services/auth.js');
            const res = await authService.resetPassword({
                token: form.token.value,
                email: form.email.value,
                password: form.password.value,
                password_confirmation: form.password_confirmation.value,
            });
            successEl.textContent = res.message || 'Password has been reset successfully.';
            successEl.style.display = 'block';
            form.password.value = '';
            form.password_confirmation.value = '';

            setTimeout(() => {
                window.location.hash = '#/login';
            }, 2000);
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Reset Password';
        }
    });
}
