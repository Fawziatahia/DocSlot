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
        <dt class="col-3">Advice</dt><dd class="col-9">${escapeHtml(p.advice || "—")}</dd>
        <dt class="col-3">Status</dt><dd class="col-9"><span class="badge ${statusBadgeClass(p.status)}">${escapeHtml(p.status)}</span></dd>
        <dt class="col-3">Date</dt><dd class="col-9">${formatDate(p.created_at)}</dd>
      </dl>
      <div class="page-actions">
        <button type="button" class="btn btn-primary" data-download-pdf="${p.id}">
          <i class="bi bi-download me-1"></i>Download PDF
        </button>
        ${canEdit ? `<a href="/prescriptions/${p.id}/edit" data-link class="btn btn-outline-secondary">Edit</a>` : ""}
      </div>
    </div>
    <div class="section-card">
      <h3 class="h6 mb-3">Medications</h3>
      <div class="table-responsive">
        <table class="table align-middle">
          <thead><tr><th>Name</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead>
          <tbody>${medRows}</tbody>
        </table>
      </div>
    </div>
  `;
}

export function afterPrescriptionDetail() {
  const button = document.querySelector("[data-download-pdf]");
  if (!button) return;

  button.addEventListener("click", async () => {
    const id = button.dataset.downloadPdf;
    const original = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Preparing...`;

    try {
      // The PDF route is token-authenticated, so it must be fetched as a blob
      // rather than linked to directly.
      const blob = await api.blob(`/prescriptions/${id}/pdf`);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `prescription-${id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      button.insertAdjacentHTML("afterend", `<div class="text-danger small mt-2">Couldn't generate the PDF. Please try again.</div>`);
    } finally {
      button.disabled = false;
      button.innerHTML = original;
    }
  });
}
