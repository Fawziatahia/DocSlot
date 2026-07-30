import { formatDate, statusBadgeClass } from "../lib/format.js";

export function renderPrescriptionsTable(prescriptions, { showPatient = false, showDoctor = false } = {}) {
  if (!prescriptions.length) {
    return `<div class="alert alert-light border text-center mb-0">No prescriptions found.</div>`;
  }

  const rows = prescriptions
    .map(
      (p) => `
        <tr>
          ${showPatient ? `<td>${p.patient?.name || ""}</td>` : ""}
          ${showDoctor ? `<td>${p.doctor?.name || ""}</td>` : ""}
          <td>${p.diagnosis}</td>
          <td>${p.medications?.length ?? "—"}</td>
          <td><span class="badge ${statusBadgeClass(p.status)}">${p.status}</span></td>
          <td>${formatDate(p.created_at)}</td>
          <td><a href="/prescriptions/${p.id}" data-link class="btn btn-sm btn-outline-secondary">View</a></td>
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
            <th>Diagnosis</th>
            <th>Medications</th>
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}
