import { api, setSession, getUser } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { clearFormErrors, applyFormErrors, setSubmitting } from "../../lib/forms.js";

export function renderRegister() {
  return `
    <h1>Create Your Account</h1>
    <p class="auth-subtitle">
      Already registered? <a href="/login" data-link>Sign in <i class="bi bi-arrow-right"></i></a>
    </p>
    <div class="alert alert-danger d-none" data-form-alert role="alert"></div>
    <form id="register-form" novalidate>
      <div class="row g-3">
        <div class="col-12">
          <label class="form-label" for="name">Full Name</label>
          <input type="text" class="form-control" id="name" name="name" required autofocus />
          <div class="invalid-feedback" data-server="name"></div>
        </div>
        <div class="col-sm-6">
          <label class="form-label" for="email">Email Address</label>
          <input type="email" class="form-control" id="email" name="email" required />
          <div class="invalid-feedback" data-server="email"></div>
        </div>
        <div class="col-sm-6">
          <label class="form-label" for="phone">Phone Number</label>
          <input type="tel" class="form-control" id="phone" name="phone" />
          <div class="invalid-feedback" data-server="phone"></div>
        </div>
        <div class="col-sm-6">
          <label class="form-label" for="date_of_birth">Date of Birth</label>
          <input type="date" class="form-control" id="date_of_birth" name="date_of_birth" />
          <div class="invalid-feedback" data-server="date_of_birth"></div>
        </div>
        <div class="col-sm-6">
          <label class="form-label" for="gender">Gender</label>
          <select class="form-select" id="gender" name="gender">
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <div class="invalid-feedback" data-server="gender"></div>
        </div>
        <div class="col-sm-6">
          <label class="form-label" for="password">Password</label>
          <input type="password" class="form-control" id="password" name="password" required />
          <div class="invalid-feedback" data-server="password"></div>
        </div>
        <div class="col-sm-6">
          <label class="form-label" for="password_confirmation">Confirm Password</label>
          <input type="password" class="form-control" id="password_confirmation" name="password_confirmation" required />
        </div>
      </div>
      <button type="submit" class="btn btn-primary w-100 mt-4" id="register-submit">Create My Account</button>
      <div class="form-check auth-terms mt-3">
        <input class="form-check-input" type="checkbox" id="terms" name="terms" required />
        <label class="form-check-label" for="terms">
          I agree to the Terms of Service and Privacy Policy
        </label>
        <div class="invalid-feedback">Please accept the terms to continue.</div>
      </div>
    </form>
    <p class="auth-note">
      <i class="bi bi-shield-lock"></i> Your data is encrypted and securely protected.
    </p>
  `;
}

export function afterRegister() {
  const form = document.getElementById("register-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormErrors(form);

    if (!form.terms.checked) {
      form.terms.classList.add("is-invalid");
      return;
    }

    const button = document.getElementById("register-submit");
    setSubmitting(button, true, "Create My Account");

    try {
      const { data } = await api.post("/auth/register", {
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value || undefined,
        date_of_birth: form.date_of_birth.value || undefined,
        gender: form.gender.value || undefined,
        password: form.password.value,
        password_confirmation: form.password_confirmation.value,
      });
      setSession(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      applyFormErrors(form, err);
    } finally {
      setSubmitting(button, false, "Create My Account");
    }
  });

  if (getUser()) navigate("/dashboard", true);
}
