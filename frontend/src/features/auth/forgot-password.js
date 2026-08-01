import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { clearFormErrors, applyFormErrors, setSubmitting } from "../../lib/forms.js";

export function renderForgotPassword() {
  return `
    <h1>Forgot password</h1>
    <p class="auth-subtitle">Enter your email and we'll send you a password reset code.</p>
    <div class="alert alert-danger d-none" data-form-alert role="alert"></div>
    <form id="forgot-form" novalidate>
      <div class="mb-3">
        <label class="form-label" for="email">Email</label>
        <input type="email" class="form-control" id="email" name="email" required autofocus />
        <div class="invalid-feedback" data-server="email"></div>
      </div>
      <button type="submit" class="btn btn-primary w-100" id="forgot-submit">Send Reset Code</button>
    </form>
    <p class="text-center small text-muted mt-4 mb-0">
      Remembered it? <a href="/login" data-link>Back to sign in</a>
    </p>
  `;
}

export function afterForgotPassword() {
  const form = document.getElementById("forgot-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormErrors(form);
    const button = document.getElementById("forgot-submit");
    setSubmitting(button, true, "Send Reset Code");

    try {
      await api.post("/auth/forgot-password", { email: form.email.value });
      navigate(`/reset-password?email=${encodeURIComponent(form.email.value)}`);
    } catch (err) {
      applyFormErrors(form, err);
      setSubmitting(button, false, "Send Reset Code");
    }
  });
}
