import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { formatDate, statusBadgeClass } from "../../lib/format.js";
import { renderDataTable, pageHrefBuilder } from "../../components/data-table.js";
import { escapeHtml } from "../../lib/escape.js";

function currentPath() {
  return window.location.pathname + window.location.search;
}

export async function renderPatientsList() {
  const search = new URLSearchParams(window.location.search);
  const page = search.get("page") || 1;

  const { data: patients, meta } = await api.get("/patients", { page, per_page: 15 });

  const rows = patients.length
    ? patients
        .map(
          (p) => `
          <tr>
            <td><code>${escapeHtml(p.public_id || "—")}</code></td>
            <td>${escapeHtml(p.user.name)}</td>
            <td>${escapeHtml(p.user.email)}</td>
            <td>${escapeHtml(p.gender || "—")}</td>
            <td>${escapeHtml(p.blood_group || "—")}</td>
            <td><span class="badge ${statusBadgeClass(p.status)}">${escapeHtml(p.status)}</span></td>
            <td class="d-flex gap-1 flex-wrap">
              <a href="/patients/${p.public_id}" data-link class="btn btn-sm btn-outline-secondary">View</a>
              <button class="btn btn-sm btn-outline-warning" data-action="toggle-status" data-id="${p.public_id}" data-status="${escapeHtml(p.status)}">
                ${p.status === "active" ? "Suspend" : "Activate"}
              </button>
            </td>
          </tr>
        `
        )
        .join("")
    : `<tr><td colspan="7" class="text-center text-muted py-4">No patients found.</td></tr>`;

  return `
    <h2 class="h4 mb-3">Patients</h2>
    ${renderDataTable({
      headers: ["Patient ID", "Name", "Email", "Gender", "Blood Group", "Status", "Actions"],
      body: rows,
      tbodyId: "patients-body",
      meta,
      pageHref: pageHrefBuilder("/patients"),
    })}
  `;
}

export function afterPatientsList() {
  const alertBox = document.querySelector("[data-list-alert]");

  document.getElementById("patients-body")?.addEventListener("click", async (e) => {
    const button = e.target.closest("button[data-action='toggle-status']");
    if (!button) return;

    const nextStatus = button.dataset.status === "active" ? "suspended" : "active";
    button.disabled = true;
    try {
      await api.patch(`/patients/${button.dataset.id}/status`, { status: nextStatus });
      navigate(currentPath(), true);
    } catch (err) {
      alertBox.textContent = err.message || "Couldn't update patient status.";
      alertBox.classList.remove("d-none");
      button.disabled = false;
    }
  });
}
