import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { formatCurrency } from "../../lib/format.js";
import { setSubmitting } from "../../lib/forms.js";

export async function renderBookAppointment({ doctorId }) {
  const { data: doctor } = await api.get(`/doctors/${doctorId}`);

  return `
    <div class="container py-4" style="max-width: 36rem;">
      <h1 class="h3 mb-1">Book an Appointment</h1>
      <p class="text-muted mb-4">with <strong>${doctor.user.name}</strong> &middot; ${doctor.specialization?.name || ""} &middot; ${formatCurrency(doctor.consultation_fee)}</p>

      <div class="section-card">
        <div class="alert alert-danger d-none" data-form-alert role="alert"></div>
        <div class="mb-3">
          <label class="form-label" for="book-date">Date</label>
          <input type="date" class="form-control" id="book-date" min="${new Date().toISOString().slice(0, 10)}" />
        </div>
        <div class="mb-3">
          <label class="form-label">Available slots</label>
          <div id="book-slots" class="d-flex flex-wrap gap-2">
            <span class="text-muted small">Pick a date to see available slots.</span>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="book-reason">Reason for visit (optional)</label>
          <textarea class="form-control" id="book-reason" rows="3"></textarea>
        </div>
        <button type="button" class="btn btn-primary w-100" id="book-submit" disabled>Confirm Booking</button>
      </div>
    </div>
  `;
}

export function afterBookAppointment({ doctorId }) {
  const dateInput = document.getElementById("book-date");
  const slotsBox = document.getElementById("book-slots");
  const submitBtn = document.getElementById("book-submit");
  const alertBox = document.querySelector("[data-form-alert]");
  let selected = null;

  const showError = (message) => {
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");
  };

  dateInput.addEventListener("change", async () => {
    selected = null;
    submitBtn.disabled = true;
    slotsBox.innerHTML = `<span class="text-muted small">Loading slots...</span>`;

    try {
      const { data: slots } = await api.get(`/doctors/${doctorId}/slots`, { date: dateInput.value });
      if (!slots.length) {
        slotsBox.innerHTML = `<span class="text-muted small">No slots available on this date.</span>`;
        return;
      }
      slotsBox.innerHTML = slots
        .map((s) => `<button type="button" class="btn btn-outline-primary btn-sm slot-btn" data-start="${s.start}" data-end="${s.end}">${s.start.slice(0, 5)}</button>`)
        .join("");
    } catch (err) {
      showError(err.message || "Couldn't load slots.");
    }
  });

  slotsBox.addEventListener("click", (e) => {
    const button = e.target.closest(".slot-btn");
    if (!button) return;
    slotsBox.querySelectorAll(".slot-btn").forEach((b) => b.classList.remove("btn-primary", "active"));
    button.classList.add("btn-primary", "active");
    selected = { start: button.dataset.start, end: button.dataset.end };
    submitBtn.disabled = false;
  });

  submitBtn.addEventListener("click", async () => {
    if (!selected) return;
    alertBox.classList.add("d-none");
    setSubmitting(submitBtn, true, "Confirm Booking");

    try {
      const { data } = await api.post("/appointments", {
        doctor_id: Number(doctorId),
        appointment_date: dateInput.value,
        start_time: selected.start,
        end_time: selected.end,
        reason: document.getElementById("book-reason").value || undefined,
      });
      navigate(`/appointments/${data.id}`);
    } catch (err) {
      showError(err.message || "Couldn't book the appointment.");
      setSubmitting(submitBtn, false, "Confirm Booking");
    }
  });
}
