import { api, setSession, getUser } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { clearFormErrors, applyFormErrors, setSubmitting } from "../../lib/forms.js";

export function renderLogin() {
  return `
    <h1>Sign In</h1>
    <p class="auth-subtitle">
      New to DocSlot? <a href="/register" data-link>Create a free account <i class="bi bi-arrow-right"></i></a>
    </p>
    <div class="alert alert-danger d-none" data-form-alert role="alert"></div>
    <form id="login-form" novalidate>
      <div class="mb-3">
        <label class="form-label" for="email">Email Address</label>
        <input type="email" class="form-control" id="email" name="email" placeholder="your@email.com" required autofocus />
        <div class="invalid-feedback" data-server="email"></div>
      </div>
      <div class="mb-2">
        <label class="form-label" for="password">Password</label>
        <input type="password" class="form-control" id="password" name="password" placeholder="Enter your password" required />
        <div class="invalid-feedback" data-server="password"></div>
      </div>
      <div class="d-flex justify-content-end mb-4">
        <a href="/forgot-password" data-link class="small">Forgot password?</a>
      </div>
      <button type="submit" class="btn btn-primary w-100" id="login-submit">Sign In to DocSlot</button>
    </form>
    <p class="auth-note">
      <i class="bi bi-shield-lock"></i> Secure, encrypted sign-in.
    </p>
  `;
}

export function afterLogin() {
  const form = document.getElementById("login-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormErrors(form);
    const button = document.getElementById("login-submit");
    setSubmitting(button, true, "Sign In to DocSlot");

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
      setSubmitting(button, false, "Sign In to DocSlot");
    }
  });

  if (getUser()) navigate("/dashboard", true);
}
