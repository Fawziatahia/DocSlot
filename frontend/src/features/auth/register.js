export function renderRegister() {
    return `
    <div class="auth-container">
        <div class="auth-card auth-card-lg">
            <div class="auth-header">
                <h1>Create Account</h1>
                <p>Join DocSlot today</p>
            </div>
            <form id="register-form" class="auth-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <input type="text" id="name" name="name" class="form-control" required placeholder="John Doe" />
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" class="form-control" required placeholder="your@email.com" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="phone">Phone (optional)</label>
                        <input type="tel" id="phone" name="phone" class="form-control" placeholder="+1234567890" />
                    </div>
                    <div class="form-group">
                        <label for="date_of_birth">Date of Birth (optional)</label>
                        <input type="date" id="date_of_birth" name="date_of_birth" class="form-control" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="gender">Gender (optional)</label>
                        <select id="gender" name="gender" class="form-control">
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="address">Address (optional)</label>
                        <input type="text" id="address" name="address" class="form-control" placeholder="Your address" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" class="form-control" required minlength="8" placeholder="Min. 8 characters" />
                    </div>
                    <div class="form-group">
                        <label for="password_confirmation">Confirm Password</label>
                        <input type="password" id="password_confirmation" name="password_confirmation" class="form-control" required placeholder="Repeat password" />
                    </div>
                </div>
                <div id="register-error" class="alert alert-danger" style="display:none"></div>
                <button type="submit" id="register-btn" class="btn btn-primary btn-block">Create Account</button>
            </form>
            <div class="auth-footer">
                <p>Already have an account? <a href="#/login">Sign in</a></p>
            </div>
        </div>
    </div>`;
}

export function initRegister() {
    const form = document.getElementById('register-form');
    const errorEl = document.getElementById('register-error');
    const btn = document.getElementById('register-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.style.display = 'none';
        btn.disabled = true;
        btn.textContent = 'Creating account...';

        try {
            const { authService } = await import('../../services/auth.js');
            await authService.register({
                name: form.name.value,
                email: form.email.value,
                password: form.password.value,
                password_confirmation: form.password_confirmation.value,
                phone: form.phone.value || undefined,
                date_of_birth: form.date_of_birth.value || undefined,
                gender: form.gender.value || undefined,
                address: form.address.value || undefined,
            });

            window.location.hash = '#/dashboard';
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Create Account';
        }
    });
}
