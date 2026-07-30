import { api, hasRole } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { formatDate, formatTime, statusBadgeClass } from "../../lib/format.js";
import { renderStarInput, bindStarInput } from "../../components/star-rating.js";
import { setSubmitting } from "../../lib/forms.js";

export async function renderAppointmentDetail({ id }) {
  const { data: a } = await api.get(`/appointments/${id}`);
  const isPatientView = hasRole("patient");
  const isDoctorOrAdmin = hasRole("doctor") || hasRole("admin");
  const canCancel = ["pending", "confirmed"].includes(a.status);
  const canReschedule = ["pending", "confirmed"].includes(a.status);

  return `
    <div class="container py-4" style="max-width: 40rem;">
      <h1 class="h3 mb-4">Appointment Details</h1>
      <div class="section-card mb-3">
        <div class="alert alert-danger d-none" data-detail-alert role="alert"></div>
        <dl class="row mb-0">
          <dt class="col-4">${isPatientView ? "Doctor" : "Patient"}</dt>
          <dd class="col-8">${
            isPatientView
              ? a.doctor?.name
              : `<a href="/patients/${a.patient.id}" data-link>${a.patient.name}</a>`
          }</dd>
          ${!isPatientView ? `<dt class="col-4">Doctor</dt><dd class="col-8">${a.doctor?.name} ${a.doctor?.specialization ? `(${a.doctor.specialization})` : ""}</dd>` : ""}
          <dt class="col-4">Date</dt>
          <dd class="col-8">${formatDate(a.appointment_date)}</dd>
          <dt class="col-4">Time</dt>
          <dd class="col-8">${formatTime(a.start_time)} – ${formatTime(a.end_time)}</dd>
          <dt class="col-4">Status</dt>
          <dd class="col-8"><span class="badge ${statusBadgeClass(a.status)}">${a.status.replace("_", " ")}</span></dd>
          <dt class="col-4">Reason</dt>
          <dd class="col-8">${a.reason || "—"}</dd>
          ${a.cancellation_reason ? `<dt class="col-4">Cancellation reason</dt><dd class="col-8">${a.cancellation_reason}</dd>` : ""}
          <dt class="col-4">Rescheduled</dt>
          <dd class="col-8">${a.reschedule_count || 0} time(s)</dd>
        </dl>

        <div class="d-flex flex-wrap gap-2 mt-4">
          ${isDoctorOrAdmin && a.status === "pending" ? `<button class="btn btn-outline-success" data-action="confirm">Confirm</button>` : ""}
          ${isDoctorOrAdmin && a.status === "confirmed" ? `<button class="btn btn-outline-primary" data-action="complete">Complete</button>` : ""}
          ${canCancel ? `<button class="btn btn-outline-danger" data-action="cancel">Cancel</button>` : ""}
          ${canReschedule ? `<button class="btn btn-outline-secondary" id="toggle-reschedule">Reschedule</button>` : ""}
          ${
            hasRole("doctor") && ["confirmed", "completed"].includes(a.status)
              ? `
            <a href="/prescriptions/new?patient_id=${a.patient.id}&appointment_id=${a.id}&patient_name=${encodeURIComponent(a.patient.name)}" data-link class="btn btn-outline-secondary">
              <i class="bi bi-capsule me-1"></i>Write Prescription
            </a>
            <a href="/medical-records/new?patient_id=${a.patient.id}&appointment_id=${a.id}&patient_name=${encodeURIComponent(a.patient.name)}" data-link class="btn btn-outline-secondary">
              <i class="bi bi-file-earmark-medical me-1"></i>Add Medical Record
            </a>
          `
              : ""
          }
        </div>
      </div>

      <div class="section-card d-none" id="reschedule-panel">
        <h2 class="h6 mb-3">Reschedule Appointment</h2>
        <div class="row g-2 align-items-end">
          <div class="col-sm-5">
            <label class="form-label">New date</label>
            <input type="date" class="form-control" id="reschedule-date" min="${new Date().toISOString().slice(0, 10)}" />
          </div>
          <div class="col-sm-5">
            <label class="form-label">Available slots</label>
            <select class="form-select" id="reschedule-slot" disabled>
              <option value="">Pick a date first</option>
            </select>
          </div>
          <div class="col-sm-2">
            <button type="button" class="btn btn-primary w-100" id="reschedule-submit" disabled>Save</button>
          </div>
        </div>
      </div>

      ${
        isPatientView && a.status === "completed" && a.doctor?.reviews_enabled
          ? a.rated
            ? `
          <div class="section-card mt-3">
            <p class="mb-0 text-muted"><i class="bi bi-check-circle text-success me-1"></i>You've already rated this appointment. Thank you!</p>
          </div>
        `
            : `
          <div class="section-card mt-3">
            <h2 class="h6 mb-3">Rate this appointment</h2>
            <div class="alert alert-danger d-none" data-rating-alert role="alert"></div>
            ${renderStarInput("score")}
            <div class="mb-3 mt-3">
              <label class="form-label" for="rating-comment">Comment (optional)</label>
              <textarea class="form-control" id="rating-comment" rows="2"></textarea>
            </div>
            <button type="button" class="btn btn-primary" id="rating-submit">Submit Rating</button>
          </div>
        `
          : ""
      }
    </div>
  `;
}

export function afterAppointmentDetail({ id }) {
  const alertBox = document.querySelector("[data-detail-alert]");

  const showError = (err) => {
    alertBox.textContent = err.message || "Something went wrong.";
    alertBox.classList.remove("d-none");
  };

  document.querySelectorAll("button[data-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const action = button.dataset.action;
      let payload = {};
      if (action === "cancel") {
        payload = { cancellation_reason: window.prompt("Reason for cancellation (optional):") || "" };
      }
      button.disabled = true;
      try {
        await api.post(`/appointments/${id}/${action}`, payload);
        navigate(`/appointments/${id}`, true);
      } catch (err) {
        showError(err);
        button.disabled = false;
      }
    });
  });

  const toggleBtn = document.getElementById("toggle-reschedule");
  const panel = document.getElementById("reschedule-panel");
  toggleBtn?.addEventListener("click", () => panel.classList.toggle("d-none"));

  const dateInput = document.getElementById("reschedule-date");
  const slotSelect = document.getElementById("reschedule-slot");
  const submitBtn = document.getElementById("reschedule-submit");

  dateInput?.addEventListener("change", async () => {
    slotSelect.disabled = true;
    submitBtn.disabled = true;
    slotSelect.innerHTML = `<option value="">Loading...</option>`;

    try {
      const { data: appointment } = await api.get(`/appointments/${id}`);
      const { data: slots } = await api.get(`/doctors/${appointment.doctor.id}/slots`, { date: dateInput.value });

      if (!slots.length) {
        slotSelect.innerHTML = `<option value="">No slots available</option>`;
        return;
      }

      slotSelect.innerHTML =
        `<option value="">Select a time</option>` +
        slots.map((s) => `<option value="${s.start}|${s.end}">${s.start.slice(0, 5)} – ${s.end.slice(0, 5)}</option>`).join("");
      slotSelect.disabled = false;
    } catch (err) {
      showError(err);
    }
  });

  slotSelect?.addEventListener("change", () => {
    submitBtn.disabled = !slotSelect.value;
  });

  submitBtn?.addEventListener("click", async () => {
    const [start_time, end_time] = slotSelect.value.split("|");
    submitBtn.disabled = true;
    try {
      await api.post(`/appointments/${id}/reschedule`, {
        appointment_date: dateInput.value,
        start_time,
        end_time,
      });
      navigate(`/appointments/${id}`, true);
    } catch (err) {
      showError(err);
      submitBtn.disabled = false;
    }
  });

  const starInput = document.querySelector(".star-input");
  if (starInput) bindStarInput(starInput);

  const ratingAlert = document.querySelector("[data-rating-alert]");
  document.getElementById("rating-submit")?.addEventListener("click", async () => {
    const score = starInput.querySelector('input[type="hidden"]').value;
    ratingAlert.classList.add("d-none");

    if (!score) {
      ratingAlert.textContent = "Please select a star rating.";
      ratingAlert.classList.remove("d-none");
      return;
    }

    const button = document.getElementById("rating-submit");
    setSubmitting(button, true, "Submit Rating");

    try {
      await api.post(`/appointments/${id}/rate`, {
        score: Number(score),
        comment: document.getElementById("rating-comment").value || undefined,
      });
      navigate(`/appointments/${id}`, true);
    } catch (err) {
      ratingAlert.textContent = err.message || "Couldn't submit your rating.";
      ratingAlert.classList.remove("d-none");
      setSubmitting(button, false, "Submit Rating");
    }
  });
}
