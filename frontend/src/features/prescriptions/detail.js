import { api, getUser, hasRole } from "../../lib/api.js";
import { formatDate, statusBadgeClass } from "../../lib/format.js";
import { escapeHtml } from "../../lib/escape.js";

export async function renderPrescriptionDetail({ id }) {
  const { data: p } = await api.get(`/prescriptions/${id}`);
  const myDoctorId = getUser()?.doctor?.id ?? null;
  const canEdit = hasRole("admin") || (myDoctorId !== null && myDoctorId === p.doctor?.id);

  const medRows = (p.medications || [])
    .map(
      (m) => `
        <tr>
          <td>${escapeHtml(m.medication_name)}</td>
          <td>${escapeHtml(m.dosage)}</td>
          <td>${escapeHtml(m.frequency)}</td>
          <td>${escapeHtml(m.duration || "—")}</td>
          <td>${escapeHtml(m.instructions || "—")}</td>
        </tr>
      `
    )
    .join("");

  return `
    <h2 class="h4 mb-3">Prescription</h2>
    <div class="section-card mb-3">
      <dl class="row mb-0">
        <dt class="col-3">Patient</dt><dd class="col-9">${
          (hasRole("doctor") || hasRole("admin")) && p.patient?.public_id
            ? `<a href="/patients/${p.patient.public_id}" data-link>${escapeHtml(p.patient.name)}</a>`
            : escapeHtml(p.patient?.name)
        }</dd>
        <dt class="col-3">Doctor</dt><dd class="col-9">${escapeHtml(p.doctor?.name)}</dd>
        <dt class="col-3">Diagnosis</dt><dd class="col-9">${escapeHtml(p.diagnosis)}</dd>
        <dt class="col-3">Notes</dt><dd class="col-9">${escapeHtml(p.notes || "—")}</dd>
        <dt class="col-3">Status</dt><dd class="col-9"><span class="badge ${statusBadgeClass(p.status)}">${escapeHtml(p.status)}</span></dd>
        <dt class="col-3">Date</dt><dd class="col-9">${formatDate(p.created_at)}</dd>
      </dl>
      ${canEdit ? `<a href="/prescriptions/${p.id}/edit" data-link class="btn btn-outline-secondary mt-2">Edit</a>` : ""}
    </div>
    <div class="section-card">
      <h3 class="h6 mb-3">Medications</h3>
      <div class="table-responsive">
        <table class="table table-sm align-middle">
          <thead><tr><th>Name</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead>
          <tbody>${medRows}</tbody>
        </table>
      </div>
    </div>
  `;
}
