import { api, hasRole } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { formatDate, formatTime, statusBadgeClass } from "../../lib/format.js";
import { renderDataTable, pageHrefBuilder } from "../../components/data-table.js";
import { renderSearchBar, attachLiveSearch } from "../../components/live-search.js";
import { escapeHtml } from "../../lib/escape.js";

const STATUS_TABS = ["", "pending", "confirmed", "in_progress", "completed", "cancelled"];

function currentPath() {
  return window.location.pathname + window.location.search;
}

async function fetchResults(params) {
  const endpoint = hasRole("admin") ? "/appointments" : "/appointments/my";
  const { data: appointments, meta } = await api.get(endpoint, { ...params, per_page: 10 });

  const isPatientView = hasRole("patient");
  const isDoctorView = hasRole("doctor");
  const isAdminView = hasRole("admin");

  const rows = appointments.length
    ? appointments
        .map((a) => {
          const actions = [];
          if ((isDoctorView || isAdminView) && a.status === "pending") {
            actions.push(`<button class="btn btn-sm btn-outline-success" data-action="confirm" data-id="${a.id}">Confirm</button>`);
          }
          if ((isDoctorView || isAdminView) && a.status === "confirmed") {
            actions.push(`<button class="btn btn-sm btn-outline-primary" data-action="complete" data-id="${a.id}">Complete</button>`);
          }
          if (["pending", "confirmed"].includes(a.status)) {
            actions.push(`<button class="btn btn-sm btn-outline-danger" data-action="cancel" data-id="${a.id}">Cancel</button>`);
          }
          actions.push(`<a href="/appointments/${a.id}" data-link class="btn btn-sm btn-outline-secondary">View</a>`);

          return `
            <tr>
              <td>${
                isPatientView
                  ? escapeHtml(a.doctor?.name)
                  : a.patient?.public_id
                    ? `<a href="/patients/${a.patient.public_id}" data-link>${escapeHtml(a.patient.name)}</a>`
                    : ""
              }</td>
              <td>${formatDate(a.appointment_date)}</td>
              <td>${formatTime(a.start_time)} – ${formatTime(a.end_time)}</td>
              <td><span class="badge ${statusBadgeClass(a.status)}">${escapeHtml(a.status.replace("_", " "))}</span></td>
              <td class="d-flex gap-1 flex-wrap">${actions.join("")}</td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="5" class="text-center text-muted py-4">No appointments match your search.</td></tr>`;

  return renderDataTable({
    headers: [isPatientView ? "Doctor" : "Patient", "Date", "Time", "Status", "Actions"],
    body: rows,
    meta,
    pageHref: pageHrefBuilder(window.location.pathname),
  });
}

export async function renderAppointmentsList() {
  const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
  const results = await fetchResults(params);

  const isPatientView = hasRole("patient");

  const statusOptions = STATUS_TABS.map(
    (s) =>
      `<option value="${s}" ${(params.status || "") === s ? "selected" : ""}>${s ? s.replace("_", " ") : "Any status"}</option>`
  ).join("");

  const bookButton = isPatientView
    ? `<a href="/doctors" data-link class="btn btn-primary"><i class="bi bi-calendar-plus me-1"></i>Book Appointment</a>`
    : "";

  return `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <h2 class="h4 mb-0">Appointments</h2>
      ${bookButton}
    </div>
    ${renderSearchBar({
      id: "appointment-search",
      value: params.q || "",
      placeholder: isPatientView
        ? "Search by doctor name, doctor ID or reason..."
        : "Search by patient name, patient ID, appointment # or reason...",
      controls: `<select class="form-select search-control text-capitalize" name="status" aria-label="Status">${statusOptions}</select>`,
    })}
    <div id="appointment-results">${results}</div>
  `;
}

export function afterAppointmentsList() {
  attachLiveSearch({
    formId: "appointment-search",
    resultsId: "appointment-results",
    render: fetchResults,
  });

  document.getElementById("appointment-results")?.addEventListener("click", async (e) => {
    const button = e.target.closest("button[data-action]");
    if (!button) return;

    const { action, id } = button.dataset;
    let payload = {};

    if (action === "cancel") {
      const reason = window.prompt("Reason for cancellation (optional):") || "";
      payload = { cancellation_reason: reason };
    }

    // Re-queried per click: the alert lives inside the container that each
    // search replaces.
    const alertBox = document.querySelector("[data-list-alert]");
    button.disabled = true;
    try {
      await api.post(`/appointments/${id}/${action}`, payload);
      navigate(currentPath(), true);
    } catch (err) {
      alertBox.textContent = err.message || "Couldn't complete that action.";
      alertBox.classList.remove("d-none");
      button.disabled = false;
    }
  });
}
