import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { formatCurrency, formatDate, formatTime, slotDurationMinutes } from "../../lib/format.js";
import { setSubmitting } from "../../lib/forms.js";
import { createDatePicker } from "../../components/date-picker.js";
import { escapeHtml } from "../../lib/escape.js";
import { refreshUnreadCount } from "../../lib/notifications.js";

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function renderBookAppointment({ doctorId }) {
  const [{ data: doctor }, { data: bookingSettings }] = await Promise.all([
    api.get(`/doctors/${doctorId}`),
    api.get("/booking-settings"),
  ]);
  const minDate = addDays(new Date(), bookingSettings.min_booking_lead_days);

  return `
    <div class="container py-4" style="max-width: 40rem;">
      <div class="section-card mb-3 py-3">
        <div class="d-flex align-items-center gap-2">
          <span class="doctor-avatar">${escapeHtml(doctor.user.name.charAt(0).toUpperCase())}</span>
          <div>
            <h1 class="h5 mb-0">${escapeHtml(doctor.user.name)}</h1>
            <p class="text-muted small mb-0">${escapeHtml(doctor.specialization?.name)} &middot; ${formatCurrency(doctor.consultation_fee)} per consultation</p>
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="alert alert-danger d-none" data-form-alert role="alert"></div>
        <div class="row g-3">
          <div class="col-sm-7">
            <label class="form-label small fw-semibold">Select a date</label>
            <div id="book-calendar" data-min-date="${minDate}" data-max-date="${bookingSettings.max_booking_date || ""}"></div>
            ${
              bookingSettings.min_booking_lead_days > 0
                ? `<div class="form-text small">Must be booked at least ${bookingSettings.min_booking_lead_days} day${bookingSettings.min_booking_lead_days === 1 ? "" : "s"} in advance.</div>`
                : ""
            }
            ${
              bookingSettings.max_booking_date
                ? `<div class="form-text small">Bookings are open through ${formatDate(bookingSettings.max_booking_date)}.</div>`
                : ""
            }
          </div>
          <div class="col-sm-5">
            <label class="form-label small fw-semibold">Available slots</label>
            <div id="book-slots" class="slot-grid" style="max-height: 19rem; overflow-y: auto;">
              <div class="slot-empty"><i class="bi bi-calendar-week"></i>Pick a date to see available slots.</div>
            </div>
          </div>
        </div>

        <hr class="my-3" />

        <div class="mb-3">
          <label class="form-label small" for="book-reason">Reason for visit (optional)</label>
          <textarea class="form-control form-control-sm" id="book-reason" rows="2"></textarea>
        </div>
        <button type="button" class="btn btn-primary btn-sm w-100" id="book-submit" disabled>Confirm Booking</button>
      </div>
    </div>
  `;
}

export function afterBookAppointment({ doctorId }) {
  const calendarEl = document.getElementById("book-calendar");
  const slotsBox = document.getElementById("book-slots");
  const submitBtn = document.getElementById("book-submit");
  const alertBox = document.querySelector("[data-form-alert]");
  let selectedDate = null;
  let selectedSlot = null;

  const showError = (message) => {
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");
  };

  const loadSlots = async (date) => {
    selectedSlot = null;
    submitBtn.disabled = true;
    slotsBox.innerHTML = `<div class="slot-empty"><span class="spinner-border spinner-border-sm"></span>Loading slots...</div>`;

    try {
      const { data: slots } = await api.get(`/doctors/${doctorId}/slots`, { date });
      if (!slots.length) {
        slotsBox.innerHTML = `<div class="slot-empty"><i class="bi bi-calendar-x"></i>No slots available on this date.</div>`;
        return;
      }
      slotsBox.innerHTML = slots
        .map(
          (s) => `
            <button type="button" class="slot-btn" data-start="${s.start}" data-end="${s.end}">
              <span class="slot-time">${formatTime(s.start)}</span>
              <span class="slot-duration">${slotDurationMinutes(s.start, s.end)} min</span>
            </button>
          `
        )
        .join("");
    } catch (err) {
      showError(err.message || "Couldn't load slots.");
    }
  };

  createDatePicker(calendarEl, {
    minDate: calendarEl.dataset.minDate,
    maxDate: calendarEl.dataset.maxDate || null,
    onSelect: (date) => {
      selectedDate = date;
      loadSlots(date);
    },
  });

  slotsBox.addEventListener("click", (e) => {
    const button = e.target.closest(".slot-btn");
    if (!button) return;
    slotsBox.querySelectorAll(".slot-btn").forEach((b) => b.classList.remove("slot-selected"));
    button.classList.add("slot-selected");
    selectedSlot = { start: button.dataset.start, end: button.dataset.end };
    submitBtn.disabled = false;
  });

  submitBtn.addEventListener("click", async () => {
    if (!selectedDate || !selectedSlot) return;
    alertBox.classList.add("d-none");
    setSubmitting(submitBtn, true, "Confirm Booking");

    try {
      const { data } = await api.post("/appointments", {
        doctor_id: doctorId,
        appointment_date: selectedDate,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        reason: document.getElementById("book-reason").value || undefined,
      });
      refreshUnreadCount();
      navigate(`/appointments/${data.id}`);
    } catch (err) {
      showError(err.message || "Couldn't book the appointment.");
      setSubmitting(submitBtn, false, "Confirm Booking");
    }
  });
}
