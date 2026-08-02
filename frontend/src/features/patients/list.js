import { api, hasRole } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { statusBadgeClass } from "../../lib/format.js";
import { renderDataTable, pageHrefBuilder } from "../../components/data-table.js";
import { renderSearchBar, attachLiveSearch } from "../../components/live-search.js";
import { escapeHtml } from "../../lib/escape.js";

function currentPath() {
  return window.location.pathname + window.location.search;
}

async function fetchResults(params) {
  const isAdmin = hasRole("admin");
  const { data: patients, meta } = await api.get("/patients", { ...params, per_page: 15 });

  const rows = patients.length
    ? patients
        .map(
          (p) => `
          <tr>
            <td><code>${escapeHtml(p.public_id || "—")}</code></td>
            <td>${escapeHtml(p.user.name)}</td>
            <td>${escapeHtml(p.user.email)}</td>
            <td>${escapeHtml(p.user.phone || "—")}</td>
            <td>${escapeHtml(p.gender || "—")}</td>
            <td>${escapeHtml(p.blood_group || "—")}</td>
            <td><span class="badge ${statusBadgeClass(p.status)}">${escapeHtml(p.status)}</span></td>
            <td class="d-flex gap-1 flex-wrap">
              <a href="/patients/${p.public_id}" data-link class="btn btn-sm btn-outline-secondary">View</a>
              ${
                isAdmin
                  ? `<button class="btn btn-sm btn-outline-warning" data-action="toggle-status" data-id="${p.public_id}" data-status="${escapeHtml(p.status)}">
                      ${p.status === "active" ? "Suspend" : "Activate"}
                    </button>`
                  : ""
              }
            </td>
          </tr>
        `
        )
        .join("")
    : `<tr><td colspan="8" class="text-center text-muted py-4">No patients match your search.</td></tr>`;

  return renderDataTable({
    headers: ["Patient ID", "Name", "Email", "Phone", "Gender", "Blood Group", "Status", "Actions"],
    body: rows,
    meta,
    pageHref: pageHrefBuilder("/patients"),
  });
}

export async function renderPatientsList() {
  const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
  const results = await fetchResults(params);

  const controls = `
    <select class="form-select search-control" name="status" aria-label="Status">
      <option value="">Any status</option>
      <option value="active" ${params.status === "active" ? "selected" : ""}>Active</option>
      <option value="suspended" ${params.status === "suspended" ? "selected" : ""}>Suspended</option>
    </select>
  `;

  return `
    <h2 class="h4 mb-3">Patients</h2>
    ${renderSearchBar({
      id: "patient-search",
      value: params.q || "",
      placeholder: "Search by name, patient ID, email or phone...",
      hint: "Paste a patient ID such as <code>p7894622</code> to jump straight to that record.",
      controls,
    })}
    <div id="patient-results">${results}</div>
  `;
}

export function afterPatientsList() {
  attachLiveSearch({
    formId: "patient-search",
    resultsId: "patient-results",
    render: fetchResults,
  });

  document.getElementById("patient-results")?.addEventListener("click", async (e) => {
    const button = e.target.closest("button[data-action='toggle-status']");
    if (!button) return;

    // Re-queried per click: the alert lives inside the container that each
    // search replaces.
    const alertBox = document.querySelector("[data-list-alert]");
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
