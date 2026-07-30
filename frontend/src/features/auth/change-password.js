import { api, updateStoredUser, getUser } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { clearFormErrors, applyFormErrors, setSubmitting } from "../../lib/forms.js";

export function renderChangePassword() {
  const user = getUser();

  return `
    <h1>Set a new password</h1>
    <p class="auth-subtitle">
      ${user?.must_change_password ? "Your account was just created — choose a new password before continuing." : "Update your password."}
    </p>
    <div class="alert alert-danger d-none" data-form-alert role="alert"></div>
    <form id="change-password-form" novalidate>
      <div class="mb-3">
        <label class="form-label" for="current_password">Current password</label>
        <input type="password" class="form-control" id="current_password" name="current_password" required autofocus />
        <div class="invalid-feedback" data-server="current_password"></div>
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
      <button type="submit" class="btn btn-primary w-100" id="change-password-submit">Set New Password</button>
    </form>
    <p class="text-center small text-muted mt-4 mb-0">
      Wrong account? <button type="button" class="btn btn-link p-0 align-baseline" id="logout-btn">Log out</button>
    </p>
  `;
}

export function afterChangePassword() {
  const form = document.getElementById("change-password-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormErrors(form);
    const button = document.getElementById("change-password-submit");
    setSubmitting(button, true, "Set New Password");

    try {
      await api.post("/auth/change-password", {
        current_password: form.current_password.value,
        password: form.password.value,
        password_confirmation: form.password_confirmation.value,
      });
      updateStoredUser({ must_change_password: false });
      navigate("/dashboard");
    } catch (err) {
      applyFormErrors(form, err);
    } finally {
      setSubmitting(button, false, "Set New Password");
    }
  });
}
