import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { formatDate, statusBadgeClass } from "../../lib/format.js";
import { renderPagination } from "../../components/pagination.js";

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
            <td><code>${p.public_id || "—"}</code></td>
            <td>${p.user.name}</td>
            <td>${p.user.email}</td>
            <td>${p.gender || "—"}</td>
            <td>${p.blood_group || "—"}</td>
            <td><span class="badge ${statusBadgeClass(p.status)}">${p.status}</span></td>
            <td class="d-flex gap-1 flex-wrap">
              <a href="/patients/${p.public_id}" data-link class="btn btn-sm btn-outline-secondary">View</a>
              <button class="btn btn-sm btn-outline-warning" data-action="toggle-status" data-id="${p.public_id}" data-status="${p.status}">
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
    <div class="section-card">
      <div class="alert alert-danger d-none" data-list-alert role="alert"></div>
      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr><th>Patient ID</th><th>Name</th><th>Email</th><th>Gender</th><th>Blood Group</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody id="patients-body">${rows}</tbody>
        </table>
      </div>
      ${renderPagination(meta, (p) => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", p);
        return `/patients?${params.toString()}`;
      })}
    </div>
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
