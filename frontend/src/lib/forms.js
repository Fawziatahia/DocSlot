export function clearFormErrors(form) {
  form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
  form.querySelectorAll(".invalid-feedback[data-server]").forEach((el) => (el.textContent = ""));
  const alert = form.querySelector("[data-form-alert]");
  if (alert) {
    alert.classList.add("d-none");
    alert.textContent = "";
  }
}

export function applyFormErrors(form, error) {
  const alert = form.querySelector("[data-form-alert]");

  if (error.errors) {
    Object.entries(error.errors).forEach(([field, messages]) => {
      const input = form.querySelector(`[name="${field}"]`);
      const feedback = form.querySelector(`[data-server="${field}"]`);
      if (input) input.classList.add("is-invalid");
      if (feedback) feedback.textContent = messages[0];
    });
  }

  if (alert) {
    alert.textContent = error.message || "Something went wrong.";
    alert.classList.remove("d-none");
  }
}

export function setSubmitting(button, submitting, label) {
  button.disabled = submitting;
  button.innerHTML = submitting
    ? `<span class="spinner-border spinner-border-sm me-2"></span>${label}`
    : label;
}
