import { api, hasRole } from "../../lib/api.js";
import { renderPrescriptionsTable } from "../../components/prescription-table.js";
import { renderPagination } from "../../components/pagination.js";
import { pageHrefBuilder } from "../../components/data-table.js";

export async function renderPrescriptionsList() {
  const search = new URLSearchParams(window.location.search);
  const page = search.get("page") || 1;
  const isAdmin = hasRole("admin");
  const isPatient = hasRole("patient");

  const endpoint = isAdmin ? "/prescriptions" : "/prescriptions/my";
  const { data: prescriptions, meta } = await api.get(endpoint, { page, per_page: 10 });

  const addButton = hasRole("doctor")
    ? `<a href="/prescriptions/new" data-link class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i>New Prescription</a>`
    : "";

  return `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <h2 class="h4 mb-0">Prescriptions</h2>
      ${addButton}
    </div>
    <div class="section-card">
      ${renderPrescriptionsTable(prescriptions, { showPatient: !isPatient, showDoctor: isPatient })}
      ${renderPagination(meta, pageHrefBuilder("/prescriptions"))}
    </div>
  `;
}
