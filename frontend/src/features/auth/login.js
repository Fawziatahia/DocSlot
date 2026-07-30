import { api, setSession, getUser } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { clearFormErrors, applyFormErrors, setSubmitting } from "../../lib/forms.js";

export function renderLogin() {
  return `
    <h1>Welcome back</h1>
    <p class="auth-subtitle">Sign in to your DocSlot account.</p>
    <div class="alert alert-danger d-none" data-form-alert role="alert"></div>
    <form id="login-form" novalidate>
      <div class="mb-3">
        <label class="form-label" for="email">Email</label>
        <input type="email" class="form-control" id="email" name="email" required autofocus />
        <div class="invalid-feedback" data-server="email"></div>
      </div>
      <div class="mb-3">
        <label class="form-label" for="password">Password</label>
        <input type="password" class="form-control" id="password" name="password" required />
        <div class="invalid-feedback" data-server="password"></div>
      </div>
      <div class="d-flex justify-content-end mb-3">
        <a href="/forgot-password" data-link class="small">Forgot password?</a>
      </div>
      <button type="submit" class="btn btn-primary w-100" id="login-submit">Sign In</button>
    </form>
    <p class="text-center small text-muted mt-4 mb-0">
      Don't have an account? <a href="/register" data-link>Create one</a>
    </p>
  `;
}

export function afterLogin() {
  const form = document.getElementById("login-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormErrors(form);
    const button = document.getElementById("login-submit");
    setSubmitting(button, true, "Sign In");

    try {
      const { data } = await api.post("/auth/login", {
        email: form.email.value,
        password: form.password.value,
      });
      setSession(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      applyFormErrors(form, err);
    } finally {
      setSubmitting(button, false, "Sign In");
    }
  });

  if (getUser()) navigate("/dashboard", true);
}
