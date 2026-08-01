import { formatDate } from "../lib/format.js";
import { escapeHtml } from "../lib/escape.js";

const TYPE_LABELS = {
  lab_result: "Lab Result",
  imaging: "Imaging",
  note: "Note",
  report: "Report",
  other: "Other",
};

export function renderMedicalRecordsTable(records, { showPatient = false, showDoctor = false } = {}) {
  if (!records.length) {
    return `<div class="alert alert-light border text-center mb-0">No medical records found.</div>`;
  }

  const rows = records
    .map(
      (r) => `
        <tr>
          ${showPatient ? `<td>${r.patient?.public_id ? `<a href="/patients/${r.patient.public_id}" data-link>${escapeHtml(r.patient.name)}</a>` : escapeHtml(r.patient?.name)}</td>` : ""}
          ${showDoctor ? `<td>${escapeHtml(r.doctor?.name)}</td>` : ""}
          <td>${escapeHtml(r.title)}</td>
          <td><span class="badge bg-secondary-subtle text-secondary-emphasis">${TYPE_LABELS[r.record_type] || escapeHtml(r.record_type)}</span></td>
          <td>${formatDate(r.created_at)}</td>
          <td><a href="/medical-records/${r.id}" data-link class="btn btn-sm btn-outline-secondary">View</a></td>
        </tr>
      `
    )
    .join("");

  return `
    <div class="table-responsive">
      <table class="table align-middle">
        <thead>
          <tr>
            ${showPatient ? "<th>Patient</th>" : ""}
            ${showDoctor ? "<th>Doctor</th>" : ""}
            <th>Title</th>
            <th>Type</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}
