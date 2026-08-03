import { api } from "../lib/api.js";
import { navigate } from "../lib/router.js";
import { formatCurrency, formatDate, formatTime, slotDurationMinutes } from "../lib/format.js";
import { setSubmitting } from "../lib/forms.js";
import { createDatePicker } from "./date-picker.js";
import { escapeHtml } from "../lib/escape.js";
import { refreshUnreadCount } from "../lib/notifications.js";
import { showModal } from "../lib/modal.js";

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function cancellationNote(cutoffMinutes) {
  if (!cutoffMinutes) return "";
  const hours = Math.round(cutoffMinutes / 60);
  const window = hours >= 1 ? `${hours}h` : `${cutoffMinutes} min`;
  return `Free cancellation up to ${window} before the appointment.`;
}

/**
 * The booking card that lives in the right rail of a doctor's profile:
 * calendar, slots for the picked date, a running summary, and confirm.
 * Pair with `attachBookingPanel` once the markup is in the DOM.
 */
export function renderBookingPanel(doctor, bookingSettings) {
  const minDate = addDays(new Date(), bookingSettings.min_booking_lead_days);
  const note = cancellationNote(bookingSettings.appointment_cutoff_minutes);

  return `
    <div class="section-card booking-panel">
      <h2 class="h6 mb-1">Book Appointment</h2>
      <p class="text-muted small mb-3">Select a date and time slot</p>
      <div class="alert alert-danger d-none" data-form-alert role="alert"></div>

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

      <div class="booking-label mt-3">Available time slots</div>
      <div id="book-slots" class="slot-grid">
        <div class="slot-empty"><i class="bi bi-calendar-week"></i>Pick a date to see available slots.</div>
      </div>

      <div class="booking-summary">
        <div class="booking-label">Appointment Summary</div>
        <div class="booking-summary-row">
          <span>Doctor</span><strong>${escapeHtml(doctor.user.name)}</strong>
        </div>
        <div class="booking-summary-row">
          <span>Specialty</span><strong>${escapeHtml(doctor.specialization?.name || "—")}</strong>
        </div>
        <div class="booking-summary-row">
          <span>Date</span><strong data-summary="date">Not selected</strong>
        </div>
        <div class="booking-summary-row">
          <span>Time</span><strong data-summary="time">Not selected</strong>
        </div>
        <div class="booking-summary-row">
          <span>Fee</span><strong>${formatCurrency(doctor.consultation_fee)}</strong>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label small" for="book-reason">Reason for visit (optional)</label>
        <textarea class="form-control form-control-sm" id="book-reason" rows="2"></textarea>
      </div>
      <button type="button" class="btn btn-primary w-100" id="book-submit" disabled>Confirm Booking</button>
      ${note ? `<p class="booking-note">${note}</p>` : ""}
    </div>
  `;
}

export function attachBookingPanel(doctorId) {
  const calendarEl = document.getElementById("book-calendar");
  if (!calendarEl) return;

  const slotsBox = document.getElementById("book-slots");
  const submitBtn = document.getElementById("book-submit");
  const alertBox = document.querySelector("[data-form-alert]");
  const dateSummary = document.querySelector('[data-summary="date"]');
  const timeSummary = document.querySelector('[data-summary="time"]');
  let selectedDate = null;
  let selectedSlot = null;

  const showError = (message) => {
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");
  };

  const clearSlotSelection = () => {
    selectedSlot = null;
    submitBtn.disabled = true;
    timeSummary.textContent = "Not selected";
  };

  const loadSlots = async (date) => {
    clearSlotSelection();
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
      dateSummary.textContent = formatDate(date);
      loadSlots(date);
    },
  });

  slotsBox.addEventListener("click", (e) => {
    const button = e.target.closest(".slot-btn");
    if (!button) return;
    slotsBox.querySelectorAll(".slot-btn").forEach((b) => b.classList.remove("slot-selected"));
    button.classList.add("slot-selected");
    selectedSlot = { start: button.dataset.start, end: button.dataset.end };
    timeSummary.textContent = formatTime(selectedSlot.start);
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
      setSubmitting(submitBtn, false, "Confirm Booking");
      showModal({
        variant: "success",
        title: "Booking Successful",
        message: `Your appointment on ${formatDate(selectedDate)} at ${formatTime(selectedSlot.start)} has been booked and is now pending the doctor's confirmation.`,
        primaryLabel: "View Appointment",
        onPrimary: () => navigate(`/appointments/${data.id}`),
        secondaryLabel: "Done",
        onSecondary: () => navigate("/appointments"),
      });
    } catch (err) {
      showError(err.message || "Couldn't book the appointment.");
      setSubmitting(submitBtn, false, "Confirm Booking");
    }
  });
}
