import { api } from "../../lib/api.js";
import { clearFormErrors, applyFormErrors, setSubmitting } from "../../lib/forms.js";

const FIELDS = [
  ["appointment_cutoff_minutes", "Appointment cutoff (minutes before)"],
  ["max_reschedule_count", "Max reschedule count"],
  ["reminder_hours_before", "Reminder hours before appointment"],
  ["default_slot_duration", "Default slot duration (minutes)"],
  ["default_max_daily_appointments", "Default max daily appointments"],
];

export async function renderSettings() {
  const { data: settings } = await api.get("/admin/settings");

  const fields = FIELDS.map(
    ([key, label]) => `
      <div class="mb-3">
        <label class="form-label" for="${key}">${label}</label>
        <input type="number" class="form-control" id="${key}" name="${key}" value="${settings[key] ?? ""}" />
        <div class="invalid-feedback" data-server="${key}"></div>
      </div>
    `
  ).join("");

  return `
    <h2 class="h4 mb-3">System Settings</h2>
    <div class="alert alert-info">
      <i class="bi bi-info-circle me-1"></i>
      These settings are not yet persisted by the backend — changes apply for the current request only.
    </div>
    <div class="section-card" style="max-width: 32rem;">
      <div class="alert alert-danger d-none" data-form-alert role="alert"></div>
      <div class="alert alert-success d-none" data-success-alert role="alert"></div>
      <form id="settings-form" novalidate>
        ${fields}
        <button type="submit" class="btn btn-primary" id="settings-form-submit">Save Settings</button>
      </form>
    </div>
  `;
}

export function afterSettings() {
  const form = document.getElementById("settings-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormErrors(form);
    const button = document.getElementById("settings-form-submit");
    setSubmitting(button, true, "Save Settings");

    const payload = {};
    FIELDS.forEach(([key]) => {
      if (form[key].value) payload[key] = Number(form[key].value);
    });

    try {
      await api.put("/admin/settings", payload);
      const success = form.querySelector("[data-success-alert]");
      success.textContent = "Settings updated.";
      success.classList.remove("d-none");
    } catch (err) {
      applyFormErrors(form, err);
    } finally {
      setSubmitting(button, false, "Save Settings");
    }
  });
}
