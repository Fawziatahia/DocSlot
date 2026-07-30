import { api, hasRole } from "../../lib/api.js";
import { formatDate } from "../../lib/format.js";
import { getMyDoctorId } from "../../lib/doctor.js";

const TYPE_LABELS = {
  lab_result: "Lab Result",
  imaging: "Imaging",
  note: "Note",
  report: "Report",
  other: "Other",
};

export async function renderMedicalRecordDetail({ id }) {
  const { data: r } = await api.get(`/medical-records/${id}`);
  const canViewPatientLink = hasRole("admin") || hasRole("doctor");
  const myDoctorId = hasRole("doctor") ? await getMyDoctorId() : null;
  const canEdit = hasRole("admin") || (myDoctorId !== null && myDoctorId === r.doctor?.id);

  return `
    <h2 class="h4 mb-3">${r.title}</h2>
    <div class="section-card">
      <dl class="row mb-0">
        <dt class="col-3">Patient</dt><dd class="col-9">${
          canViewPatientLink && r.patient?.id
            ? `<a href="/patients/${r.patient.id}" data-link>${r.patient.name}</a>`
            : r.patient?.name || ""
        }</dd>
        <dt class="col-3">Doctor</dt><dd class="col-9">${r.doctor?.name || ""}</dd>
        <dt class="col-3">Type</dt><dd class="col-9">${TYPE_LABELS[r.record_type] || r.record_type}</dd>
        <dt class="col-3">Description</dt><dd class="col-9">${r.description || "—"}</dd>
        <dt class="col-3">Notes</dt><dd class="col-9">${r.notes || "—"}</dd>
        ${r.file_path ? `<dt class="col-3">File</dt><dd class="col-9"><a href="${r.file_path}" target="_blank" rel="noopener">${r.file_path}</a></dd>` : ""}
        <dt class="col-3">Date</dt><dd class="col-9">${formatDate(r.created_at)}</dd>
      </dl>
      ${canEdit ? `<a href="/medical-records/${r.id}/edit" data-link class="btn btn-outline-secondary mt-2">Edit</a>` : ""}
    </div>
  `;
}
