import { api, getUser, hasRole } from "../../lib/api.js";
import { formatDate, statusBadgeClass } from "../../lib/format.js";

export async function renderPatientDetail({ id }) {
  const { data: patient } = await api.get(`/patients/${id}`);
  const user = getUser();
  const isSelf = hasRole("patient") && user && patient.user.id === user.id;
  const canManage = hasRole("admin") || hasRole("doctor") || isSelf;

  return `
    <h2 class="h4 mb-3">${patient.user.name}</h2>
    <div class="section-card mb-3">
      <dl class="row mb-0">
        <dt class="col-4">Email</dt><dd class="col-8">${patient.user.email}</dd>
        <dt class="col-4">Phone</dt><dd class="col-8">${patient.user.phone || "—"}</dd>
        <dt class="col-4">Date of birth</dt><dd class="col-8">${formatDate(patient.date_of_birth) || "—"}</dd>
        <dt class="col-4">Gender</dt><dd class="col-8">${patient.gender || "—"}</dd>
        <dt class="col-4">Blood group</dt><dd class="col-8">${patient.blood_group || "—"}</dd>
        <dt class="col-4">Address</dt><dd class="col-8">${patient.address || "—"}</dd>
        <dt class="col-4">Emergency contact</dt><dd class="col-8">${patient.emergency_contact_name ? `${patient.emergency_contact_name} (${patient.emergency_contact || "—"})` : "—"}</dd>
        <dt class="col-4">Status</dt><dd class="col-8"><span class="badge ${statusBadgeClass(patient.status)}">${patient.status}</span></dd>
      </dl>
      <div class="d-flex flex-wrap gap-2 mt-3">
        ${canManage ? `<a href="/patients/${patient.id}/edit" data-link class="btn btn-outline-secondary">Edit</a>` : ""}
        <a href="/patients/${patient.id}/medical-history" data-link class="btn btn-outline-secondary">Medical History</a>
        <a href="/patients/${patient.id}/prescriptions" data-link class="btn btn-outline-secondary">Prescriptions</a>
      </div>
    </div>
  `;
}
