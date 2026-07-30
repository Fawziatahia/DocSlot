import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { setSubmitting } from "../../lib/forms.js";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function renderDoctorSchedule({ id }) {
  const { data: schedules } = await api.get(`/doctors/${id}/schedule`);

  const rows = DAY_NAMES.map((name, dayIndex) => {
    const day = schedules.find((s) => s.day_of_week === dayIndex) || {};
    return `
      <tr>
        <td class="align-middle">
          <div class="form-check form-switch">
            <input class="form-check-input day-toggle" type="checkbox" data-day="${dayIndex}" ${day.is_available ? "checked" : ""} />
            <label class="form-check-label">${name}</label>
          </div>
        </td>
        <td><input type="time" class="form-control form-control-sm" data-field="start_time" data-day="${dayIndex}" value="${day.start_time?.slice(0, 5) || "09:00"}" /></td>
        <td><input type="time" class="form-control form-control-sm" data-field="end_time" data-day="${dayIndex}" value="${day.end_time?.slice(0, 5) || "17:00"}" /></td>
        <td><input type="number" min="15" max="120" class="form-control form-control-sm" data-field="slot_duration" data-day="${dayIndex}" value="${day.slot_duration || 30}" /></td>
        <td><input type="number" min="1" max="100" class="form-control form-control-sm" data-field="max_daily_appointments" data-day="${dayIndex}" value="${day.max_daily_appointments || 10}" /></td>
      </tr>
    `;
  }).join("");

  return `
    <div class="container py-4">
      <h1 class="h3 mb-4">Manage Schedule</h1>
      <div class="section-card">
        <div class="alert alert-danger d-none" data-form-alert role="alert"></div>
        <div class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Day</th>
                <th>Start</th>
                <th>End</th>
                <th>Slot (min)</th>
                <th>Max / day</th>
              </tr>
            </thead>
            <tbody id="schedule-body">${rows}</tbody>
          </table>
        </div>
        <button type="button" class="btn btn-primary" id="schedule-submit">Save Schedule</button>
      </div>
    </div>
  `;
}

export function afterDoctorSchedule({ id }) {
  const button = document.getElementById("schedule-submit");
  const alertBox = document.querySelector("[data-form-alert]");

  button.addEventListener("click", async () => {
    setSubmitting(button, true, "Save Schedule");
    alertBox.classList.add("d-none");

    const days = DAY_NAMES.map((_, dayIndex) => {
      const isAvailable = document.querySelector(`.day-toggle[data-day="${dayIndex}"]`).checked;
      const get = (field) => document.querySelector(`[data-field="${field}"][data-day="${dayIndex}"]`).value;
      return {
        day_of_week: dayIndex,
        start_time: get("start_time"),
        end_time: get("end_time"),
        slot_duration: Number(get("slot_duration")),
        max_daily_appointments: Number(get("max_daily_appointments")),
        is_available: isAvailable,
      };
    }).filter((d) => d.is_available);

    try {
      await api.put(`/doctors/${id}/schedule`, { days });
      navigate(`/doctors/${id}`);
    } catch (err) {
      alertBox.textContent = err.message || "Couldn't save the schedule.";
      alertBox.classList.remove("d-none");
    } finally {
      setSubmitting(button, false, "Save Schedule");
    }
  });
}
