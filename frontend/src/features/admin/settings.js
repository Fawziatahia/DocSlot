import { api } from "../../lib/api.js";
import { formatDate } from "../../lib/format.js";
import { clearFormErrors, applyFormErrors, setSubmitting } from "../../lib/forms.js";

const FIELDS = [
  ["appointment_cutoff_minutes", "Appointment cutoff (minutes before)"],
  ["max_reschedule_count", "Max reschedule count"],
  ["reminder_hours_before", "Reminder hours before appointment"],
  ["default_slot_duration", "Default slot duration (minutes)"],
  ["default_max_daily_appointments", "Default max daily appointments"],
  ["min_booking_lead_days", "Minimum advance booking (days)"],
];

export async function renderSettings() {
  const { data: settings } = await api.get("/admin/settings");
  const isAuto = settings.booking_cutoff_mode === "auto";

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
    <div class="section-card" style="max-width: 32rem;">
      <div class="alert alert-danger d-none" data-form-alert role="alert"></div>
      <div class="alert alert-success d-none" data-success-alert role="alert"></div>
      <form id="settings-form" novalidate>
        ${fields}

        <div class="mb-3">
          <label class="form-label d-block">Booking cutoff</label>
          <div class="btn-group w-100" role="group">
            <input type="radio" class="btn-check" name="booking_cutoff_mode" id="mode-fixed" value="fixed" ${!isAuto ? "checked" : ""} autocomplete="off" />
            <label class="btn btn-outline-secondary" for="mode-fixed">Fixed date</label>

            <input type="radio" class="btn-check" name="booking_cutoff_mode" id="mode-auto" value="auto" ${isAuto ? "checked" : ""} autocomplete="off" />
            <label class="btn btn-outline-secondary" for="mode-auto">Auto (rolling window)</label>
          </div>

          <div id="cutoff-fixed-fields" class="mt-2 ${isAuto ? "d-none" : ""}">
            <input type="date" class="form-control" id="max_booking_date" name="max_booking_date" value="${settings.max_booking_date || ""}" />
            <div class="form-text">Leave blank to allow booking with no cutoff date.</div>
            <div class="invalid-feedback" data-server="max_booking_date"></div>
          </div>

          <div id="cutoff-auto-fields" class="mt-2 ${isAuto ? "" : "d-none"}">
            <div class="input-group">
              <input type="number" min="1" max="365" class="form-control" id="auto_booking_advance_days" name="auto_booking_advance_days" value="${settings.auto_booking_advance_days || 90}" />
              <span class="input-group-text">days ahead</span>
            </div>
            <div class="form-text">The booking window always stays open this many days from today — it shifts forward automatically, no manual updates needed.</div>
            <div class="invalid-feedback" data-server="auto_booking_advance_days"></div>
          </div>

          <div class="form-text mt-2" id="cutoff-preview">
            ${
              settings.effective_max_booking_date
                ? `Bookings are currently open through <strong>${formatDate(settings.effective_max_booking_date)}</strong>.`
                : "No cutoff is set — booking is open indefinitely."
            }
          </div>
        </div>

        <button type="submit" class="btn btn-primary" id="settings-form-submit">Save Settings</button>
      </form>
    </div>
  `;
}

export function afterSettings() {
  const form = document.getElementById("settings-form");
  const successBox = document.querySelector("[data-success-alert]");
  const fixedFields = document.getElementById("cutoff-fixed-fields");
  const autoFields = document.getElementById("cutoff-auto-fields");

  form.querySelectorAll('input[name="booking_cutoff_mode"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const isAuto = form.booking_cutoff_mode.value === "auto";
      fixedFields.classList.toggle("d-none", isAuto);
      autoFields.classList.toggle("d-none", !isAuto);
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormErrors(form);
    successBox?.classList.add("d-none");
    const button = document.getElementById("settings-form-submit");
    setSubmitting(button, true, "Save Settings");

    const mode = form.booking_cutoff_mode.value;
    const payload = { booking_cutoff_mode: mode };
    if (mode === "auto") {
      payload.auto_booking_advance_days = Number(form.auto_booking_advance_days.value) || 90;
    } else {
      payload.max_booking_date = form.max_booking_date.value || null;
    }
    FIELDS.forEach(([key]) => {
      if (form[key].value) payload[key] = Number(form[key].value);
    });

    try {
      const { data } = await api.put("/admin/settings", payload);
      const preview = document.getElementById("cutoff-preview");
      if (preview) {
        preview.innerHTML = data.effective_max_booking_date
          ? `Bookings are currently open through <strong>${formatDate(data.effective_max_booking_date)}</strong>.`
          : "No cutoff is set — booking is open indefinitely.";
      }
      if (successBox) {
        successBox.textContent = "Settings updated.";
        successBox.classList.remove("d-none");
      }
    } catch (err) {
      applyFormErrors(form, err);
    } finally {
      setSubmitting(button, false, "Save Settings");
    }
  });
}
