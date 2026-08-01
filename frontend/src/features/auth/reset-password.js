import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { clearFormErrors, applyFormErrors, setSubmitting } from "../../lib/forms.js";

export function renderResetPassword() {
  const search = new URLSearchParams(window.location.search);
  const email = search.get("email") || "";

  if (!email) {
    return `
      <h1>Missing email</h1>
      <p class="auth-subtitle">We couldn't tell which account to reset. Please request a new code.</p>
      <a href="/forgot-password" data-link class="btn btn-primary w-100">Request a Reset Code</a>
    `;
  }

  return `
    <h1>Reset your password</h1>
    <p class="auth-subtitle">Enter the code we emailed to <strong>${email}</strong> and choose a new password.</p>
    <div class="alert alert-danger d-none" data-form-alert role="alert"></div>
    <form id="reset-password-form" novalidate>
      <input type="hidden" name="email" value="${email}" />
      <div class="mb-3">
        <label class="form-label" for="otp">Reset code</label>
        <input type="text" class="form-control" id="otp" name="otp" inputmode="numeric" pattern="\\d{6}" maxlength="6" required autofocus />
        <div class="invalid-feedback" data-server="otp"></div>
      </div>
      <div class="mb-3">
        <label class="form-label" for="password">New password</label>
        <input type="password" class="form-control" id="password" name="password" minlength="8" required />
        <div class="invalid-feedback" data-server="password"></div>
      </div>
      <div class="mb-3">
        <label class="form-label" for="password_confirmation">Confirm new password</label>
        <input type="password" class="form-control" id="password_confirmation" name="password_confirmation" minlength="8" required />
      </div>
      <button type="submit" class="btn btn-primary w-100" id="reset-password-submit">Reset Password</button>
    </form>
    <p class="text-center small text-muted mt-4 mb-0">
      Didn't get a code? <a href="/forgot-password" data-link>Request a new one</a>
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
        otp: form.otp.value,
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
