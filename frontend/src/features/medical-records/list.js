import { api, hasRole } from "../../lib/api.js";
import { renderMedicalRecordsTable } from "../../components/medical-record-table.js";
import { renderPagination } from "../../components/pagination.js";
import { pageHrefBuilder } from "../../components/data-table.js";

export async function renderMedicalRecordsList() {
  const search = new URLSearchParams(window.location.search);
  const page = search.get("page") || 1;
  const isAdmin = hasRole("admin");
  const isDoctor = hasRole("doctor");

  const addButton = isDoctor
    ? `<a href="/medical-records/new" data-link class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i>New Medical Record</a>`
    : "";

  if (isDoctor) {
    return `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 class="h4 mb-0">Medical Records</h2>
        ${addButton}
      </div>
      <div class="alert alert-light border">
        Records you create appear on each patient's profile. There isn't a combined list view for doctors yet —
        use "New Medical Record" above, or the "Add Medical Record" action on a confirmed appointment.
      </div>
    `;
  }

  const endpoint = isAdmin ? "/medical-records" : "/medical-records/my";
  const { data: records, meta } = await api.get(endpoint, { page, per_page: 10 });

  return `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <h2 class="h4 mb-0">Medical Records</h2>
      ${addButton}
    </div>
    <div class="section-card">
      ${renderMedicalRecordsTable(records, { showPatient: isAdmin, showDoctor: true })}
      ${renderPagination(meta, pageHrefBuilder("/medical-records"))}
    </div>
  `;
}
