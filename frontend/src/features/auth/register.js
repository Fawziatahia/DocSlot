import { renderAuthSidePanel, renderPasswordField, bindPasswordToggles } from './auth-shell.js';

export function renderRegister() {
    return `
    <div class="auth-page">
        ${renderAuthSidePanel({
            title: 'Join DocSlot Today.',
            subtitle: 'Free for patients, always.',
            features: [
                'Find the right specialist for you',
                'Book appointments in minutes',
                'Get reminders before every visit',
                'Rate and review your doctors',
            ],
        })}
        <div class="auth-form-panel">
            <div class="auth-card auth-card-lg">
                <div class="auth-header">
                    <h1>Create Your Account</h1>
                    <p>Already registered? <a href="#/login">Sign in &rarr;</a></p>
                </div>
                <form id="register-form" class="auth-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="name">Full Name</label>
                            <input type="text" id="name" name="name" class="form-control" required placeholder="John Doe" />
                        </div>
                        <div class="form-group">
                            <label for="email">Email Address</label>
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
                        ${renderPasswordField({ id: 'password', label: 'Password', placeholder: 'Min. 8 characters', minlength: 8 })}
                        ${renderPasswordField({ id: 'password_confirmation', label: 'Confirm Password', placeholder: 'Repeat password' })}
                    </div>
                    <label class="auth-terms-check">
                        <input type="checkbox" id="terms" required />
                        I agree to the Terms of Service and Privacy Policy
                    </label>
                    <div id="register-error" class="alert alert-danger" style="display:none"></div>
                    <button type="submit" id="register-btn" class="btn btn-primary btn-block btn-lg">Create My Account</button>
                </form>
            </div>
        </div>
    </div>`;
}

export function initRegister() {
    const form = document.getElementById('register-form');
    const errorEl = document.getElementById('register-error');
    const btn = document.getElementById('register-btn');

    bindPasswordToggles(form);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.style.display = 'none';
        btn.disabled = true;
        btn.textContent = 'Creating account...';

        try {
            const { authService } = await import('../../services/auth.js');
            const { syncLayoutFromAuth } = await import('../../utils/layout.js');
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

            syncLayoutFromAuth();
            window.location.hash = '#/dashboard';
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Create My Account';
        }
    });
}
