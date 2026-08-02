import { api, getUser, hasRole } from "../../lib/api.js";
import { formatDate, statusBadgeClass } from "../../lib/format.js";
import { escapeHtml } from "../../lib/escape.js";

export async function renderPatientDetail({ id }) {
  const { data: patient } = await api.get(`/patients/${id}`);
  const user = getUser();
  const isSelf = hasRole("patient") && user && patient.user.id === user.id;
  const canManage = hasRole("admin") || hasRole("doctor") || isSelf;
  const isDoctor = hasRole("doctor");

  return `
    <h2 class="h4 mb-3">${escapeHtml(patient.user.name)}</h2>
    <div class="section-card mb-3">
      <dl class="row mb-0">
        ${patient.public_id ? `<dt class="col-4">Patient ID</dt><dd class="col-8"><code>${escapeHtml(patient.public_id)}</code></dd>` : ""}
        <dt class="col-4">Email</dt><dd class="col-8">${escapeHtml(patient.user.email)}</dd>
        <dt class="col-4">Phone</dt><dd class="col-8">${escapeHtml(patient.user.phone || "—")}</dd>
        <dt class="col-4">Date of birth</dt><dd class="col-8">${formatDate(patient.date_of_birth) || "—"}</dd>
        <dt class="col-4">Gender</dt><dd class="col-8">${escapeHtml(patient.gender || "—")}</dd>
        <dt class="col-4">Blood group</dt><dd class="col-8">${escapeHtml(patient.blood_group || "—")}</dd>
        <dt class="col-4">Address</dt><dd class="col-8">${escapeHtml(patient.address || "—")}</dd>
        <dt class="col-4">Emergency contact</dt><dd class="col-8">${patient.emergency_contact_name ? `${escapeHtml(patient.emergency_contact_name)} (${escapeHtml(patient.emergency_contact || "—")})` : "—"}</dd>
        <dt class="col-4">Status</dt><dd class="col-8"><span class="badge ${statusBadgeClass(patient.status)}">${escapeHtml(patient.status)}</span></dd>
      </dl>
      <div class="d-flex flex-wrap gap-2 mt-3">
        ${canManage ? `<a href="/patients/${patient.public_id}/edit" data-link class="btn btn-outline-secondary">Edit</a>` : ""}
        <a href="/patients/${patient.public_id}/medical-history" data-link class="btn btn-outline-secondary">Medical History</a>
        <a href="/patients/${patient.public_id}/prescriptions" data-link class="btn btn-outline-secondary">Prescriptions</a>
        ${
          isDoctor
            ? `
          <a href="/prescriptions/new?patient_id=${patient.public_id}&patient_name=${encodeURIComponent(patient.user.name)}" data-link class="btn btn-outline-secondary">
            <i class="bi bi-capsule me-1"></i>Write Prescription
          </a>
          <a href="/medical-records/new?patient_id=${patient.public_id}&patient_name=${encodeURIComponent(patient.user.name)}" data-link class="btn btn-outline-secondary">
            <i class="bi bi-file-earmark-medical me-1"></i>Add Medical Record
          </a>
          <a href="/referrals?patient_id=${patient.public_id}&patient_name=${encodeURIComponent(patient.user.name)}" data-link class="btn btn-outline-secondary">
            <i class="bi bi-send me-1"></i>Refer to Another Doctor
          </a>
        `
            : ""
        }
      </div>
    </div>
  `;
}

// Referrals are sent from the Referrals tab; "Refer to Another Doctor" here is
// just a link that carries this patient over pre-selected.
