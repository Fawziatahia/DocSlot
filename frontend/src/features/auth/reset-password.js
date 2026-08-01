import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { clearFormErrors, applyFormErrors, setSubmitting } from "../../lib/forms.js";

export function renderResetPassword() {
  const search = new URLSearchParams(window.location.search);
  const token = search.get("token") || "";
  const email = search.get("email") || "";

  if (!token || !email) {
    return `
      <h1>Invalid reset link</h1>
      <p class="auth-subtitle">This password reset link is missing or malformed. Please request a new one.</p>
      <a href="/forgot-password" data-link class="btn btn-primary w-100">Request a New Link</a>
    `;
  }

  return `
    <h1>Reset your password</h1>
    <p class="auth-subtitle">Choose a new password for <strong>${email}</strong>.</p>
    <div class="alert alert-danger d-none" data-form-alert role="alert"></div>
    <form id="reset-password-form" novalidate>
      <input type="hidden" name="token" value="${token}" />
      <input type="hidden" name="email" value="${email}" />
      <div class="mb-3">
        <label class="form-label" for="password">New password</label>
        <input type="password" class="form-control" id="password" name="password" minlength="8" required autofocus />
        <div class="invalid-feedback" data-server="password"></div>
      </div>
      <div class="mb-3">
        <label class="form-label" for="password_confirmation">Confirm new password</label>
        <input type="password" class="form-control" id="password_confirmation" name="password_confirmation" minlength="8" required />
      </div>
      <button type="submit" class="btn btn-primary w-100" id="reset-password-submit">Reset Password</button>
    </form>
    <p class="text-center small text-muted mt-4 mb-0">
      <a href="/login" data-link>Back to sign in</a>
    </p>
  `;
}

export function afterResetPassword() {
  const form = document.getElementById("reset-password-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormErrors(form);
    const button = document.getElementById("reset-password-submit");
    setSubmitting(button, true, "Reset Password");

    try {
      await api.post("/auth/reset-password", {
        token: form.token.value,
        email: form.email.value,
        password: form.password.value,
        password_confirmation: form.password_confirmation.value,
      });
      navigate("/login");
    } catch (err) {
      applyFormErrors(form, err);
      setSubmitting(button, false, "Reset Password");
    }
  });
}
