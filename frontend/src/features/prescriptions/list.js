import { api, hasRole } from "../../lib/api.js";
import { renderPrescriptionsTable } from "../../components/prescription-table.js";
import { renderPagination } from "../../components/pagination.js";
import { pageHrefBuilder } from "../../components/data-table.js";
import { renderSearchBar, attachLiveSearch } from "../../components/live-search.js";

async function fetchResults(params) {
  const isAdmin = hasRole("admin");
  const isPatient = hasRole("patient");
  const endpoint = isAdmin ? "/prescriptions" : "/prescriptions/my";

  const { data: prescriptions, meta } = await api.get(endpoint, { ...params, per_page: 10 });

  return `
    ${renderPrescriptionsTable(prescriptions, { showPatient: !isPatient, showDoctor: isPatient })}
    ${renderPagination(meta, pageHrefBuilder("/prescriptions"))}
  `;
}

export async function renderPrescriptionsList() {
  const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
  const results = await fetchResults(params);

  const addButton = hasRole("doctor")
    ? `<a href="/prescriptions/new" data-link class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i>New Prescription</a>`
    : "";

  // Patients look up their own prescriptions by who wrote them or what for;
  // doctors and admins look them up by patient.
  const placeholder = hasRole("patient")
    ? "Search by doctor, diagnosis or medication..."
    : "Search by patient name, patient ID, diagnosis or medication...";

  const controls = `
    <select class="form-select search-control" name="status" aria-label="Status">
      <option value="">Any status</option>
      <option value="active" ${params.status === "active" ? "selected" : ""}>Active</option>
      <option value="completed" ${params.status === "completed" ? "selected" : ""}>Completed</option>
      <option value="cancelled" ${params.status === "cancelled" ? "selected" : ""}>Cancelled</option>
    </select>
  `;

  return `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <h2 class="h4 mb-0">Prescriptions</h2>
      ${addButton}
    </div>
    ${renderSearchBar({
      id: "prescription-search",
      value: params.q || "",
      placeholder,
      controls,
    })}
    <div class="section-card" id="prescription-results">${results}</div>
  `;
}

export function afterPrescriptionsList() {
  attachLiveSearch({
    formId: "prescription-search",
    resultsId: "prescription-results",
    render: fetchResults,
  });
}
