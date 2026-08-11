import { api, getUser, hasRole } from "../../lib/api.js";
import { formatDate, statusBadgeClass } from "../../lib/format.js";
import { escapeHtml } from "../../lib/escape.js";
import { renderAvatar } from "../../lib/avatar.js";

export async function renderPatientDetail({ id }) {
  const { data: patient } = await api.get(`/patients/${id}`);
  const user = getUser();
  const isSelf = hasRole("patient") && user && patient.user.id === user.id;
  const canManage = hasRole("admin") || hasRole("doctor") || isSelf;
  const isDoctor = hasRole("doctor");

  const headerActions = [canManage ? `<a href="/patients/${patient.public_id}/edit" data-link class="btn btn-outline-secondary"><i class="bi bi-pencil me-1"></i>Edit</a>` : ""]
    .filter(Boolean)
    .join("");

  const quickActions = [
    `<a href="/patients/${patient.public_id}/medical-history" data-link class="btn btn-outline-secondary"><i class="bi bi-file-earmark-medical me-1"></i>Medical History</a>`,
    `<a href="/patients/${patient.public_id}/prescriptions" data-link class="btn btn-outline-secondary"><i class="bi bi-capsule me-1"></i>Prescriptions</a>`,
    isDoctor
      ? `<a href="/prescriptions/new?patient_id=${patient.public_id}&patient_name=${encodeURIComponent(patient.user.name)}" data-link class="btn btn-outline-secondary"><i class="bi bi-capsule me-1"></i>Write Prescription</a>`
      : "",
    isDoctor
      ? `<a href="/medical-records/new?patient_id=${patient.public_id}&patient_name=${encodeURIComponent(patient.user.name)}" data-link class="btn btn-outline-secondary"><i class="bi bi-file-earmark-medical me-1"></i>Add Medical Record</a>`
      : "",
    isDoctor
      ? `<a href="/referrals?patient_id=${patient.public_id}&patient_name=${encodeURIComponent(patient.user.name)}" data-link class="btn btn-outline-secondary"><i class="bi bi-send me-1"></i>Refer to Another Doctor</a>`
      : "",
  ]
    .filter(Boolean)
    .join("");

  return `
    <div class="section-card doctor-hero mb-3">
      <div class="d-flex flex-wrap gap-4 justify-content-between align-items-start">
        <div class="d-flex gap-3 align-items-start">
          ${renderAvatar(patient.user, "doctor-avatar-lg")}
          <div>
            <h1 class="h4 mb-1">${escapeHtml(patient.user.name)}</h1>
            <p class="text-muted mb-2">
              ${escapeHtml(patient.user.email)}${patient.user.phone ? ` &middot; ${escapeHtml(patient.user.phone)}` : ""}
            </p>
            <div class="d-flex flex-wrap gap-2">
              ${patient.public_id ? `<span class="badge bg-secondary-subtle text-secondary-emphasis">ID: ${escapeHtml(patient.public_id)}</span>` : ""}
              <span class="badge ${statusBadgeClass(patient.status)} text-capitalize">${escapeHtml(patient.status)}</span>
              ${patient.blood_group ? `<span class="badge bg-danger-subtle text-danger-emphasis"><i class="bi bi-droplet-fill me-1"></i>${escapeHtml(patient.blood_group)}</span>` : ""}
            </div>
          </div>
        </div>
        ${headerActions ? `<div class="d-flex flex-wrap gap-2">${headerActions}</div>` : ""}
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="section-card h-100">
          <h2 class="h6 mb-3">Personal Information</h2>
          <dl class="row mb-0">
            <dt class="col-5">Date of birth</dt><dd class="col-7">${formatDate(patient.date_of_birth) || "—"}</dd>
            <dt class="col-5">Gender</dt><dd class="col-7 text-capitalize">${escapeHtml(patient.gender || "—")}</dd>
            <dt class="col-5">Address</dt><dd class="col-7">${escapeHtml(patient.address || "—")}</dd>
          </dl>
        </div>
      </div>
      <div class="col-md-6">
        <div class="section-card h-100">
          <h2 class="h6 mb-3">Emergency Contact</h2>
          <dl class="row mb-0">
            <dt class="col-5">Name</dt><dd class="col-7">${escapeHtml(patient.emergency_contact_name || "—")}</dd>
            <dt class="col-5">Phone</dt><dd class="col-7">${escapeHtml(patient.emergency_contact || "—")}</dd>
          </dl>
        </div>
      </div>
    </div>

    <div class="section-card mt-3">
      <h2 class="h6 mb-3">Quick Actions</h2>
      <div class="d-flex flex-wrap gap-2">${quickActions}</div>
    </div>
  `;
}

// Referrals are sent from the Referrals tab; "Refer to Another Doctor" here is
// just a link that carries this patient over pre-selected.
