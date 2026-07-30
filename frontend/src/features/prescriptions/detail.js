import { api, hasRole } from "../../lib/api.js";
import { formatDate, statusBadgeClass } from "../../lib/format.js";
import { getMyDoctorId } from "../../lib/doctor.js";

export async function renderPrescriptionDetail({ id }) {
  const { data: p } = await api.get(`/prescriptions/${id}`);
  const myDoctorId = hasRole("doctor") ? await getMyDoctorId() : null;
  const canEdit = hasRole("admin") || (myDoctorId !== null && myDoctorId === p.doctor?.id);

  const medRows = (p.medications || [])
    .map(
      (m) => `
        <tr>
          <td>${m.medication_name}</td>
          <td>${m.dosage}</td>
          <td>${m.frequency}</td>
          <td>${m.duration || "—"}</td>
          <td>${m.instructions || "—"}</td>
        </tr>
      `
    )
    .join("");

  return `
    <h2 class="h4 mb-3">Prescription</h2>
    <div class="section-card mb-3">
      <dl class="row mb-0">
        <dt class="col-3">Patient</dt><dd class="col-9">${
          (hasRole("doctor") || hasRole("admin")) && p.patient?.id
            ? `<a href="/patients/${p.patient.id}" data-link>${p.patient.name}</a>`
            : p.patient?.name || ""
        }</dd>
        <dt class="col-3">Doctor</dt><dd class="col-9">${p.doctor?.name || ""}</dd>
        <dt class="col-3">Diagnosis</dt><dd class="col-9">${p.diagnosis}</dd>
        <dt class="col-3">Notes</dt><dd class="col-9">${p.notes || "—"}</dd>
        <dt class="col-3">Status</dt><dd class="col-9"><span class="badge ${statusBadgeClass(p.status)}">${p.status}</span></dd>
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
