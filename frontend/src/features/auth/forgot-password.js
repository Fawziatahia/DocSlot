import { api } from "../../lib/api.js";
import { clearFormErrors, applyFormErrors, setSubmitting } from "../../lib/forms.js";

export function renderForgotPassword() {
  return `
    <h1>Forgot password</h1>
    <p class="auth-subtitle">Enter your email and we'll send you a reset link.</p>
    <div class="alert alert-danger d-none" data-form-alert role="alert"></div>
    <div class="alert alert-success d-none" data-success-alert role="alert"></div>
    <form id="forgot-form" novalidate>
      <div class="mb-3">
        <label class="form-label" for="email">Email</label>
        <input type="email" class="form-control" id="email" name="email" required autofocus />
        <div class="invalid-feedback" data-server="email"></div>
      </div>
      <button type="submit" class="btn btn-primary w-100" id="forgot-submit">Send Reset Link</button>
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
    setSubmitting(button, true, "Send Reset Link");

    try {
      const res = await api.post("/auth/forgot-password", { email: form.email.value });
      const success = form.querySelector("[data-success-alert]");
      success.textContent = res.message || "Check your email for a reset link.";
      success.classList.remove("d-none");
      form.reset();
    } catch (err) {
      applyFormErrors(form, err);
    } finally {
      setSubmitting(button, false, "Send Reset Link");
    }
  });
}
