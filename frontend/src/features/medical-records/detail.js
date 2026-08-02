import { api, getUser, hasRole } from "../../lib/api.js";
import { formatDate, formatFileSize } from "../../lib/format.js";
import { escapeHtml } from "../../lib/escape.js";

const TYPE_LABELS = {
  lab_result: "Lab Result",
  imaging: "Imaging",
  note: "Note",
  report: "Report",
  other: "Other",
};

function renderAttachment(record) {
  if (record.file) {
    return `
      <div class="attachment-panel" data-attachment="${record.file.url}" data-name="${escapeHtml(record.file.name)}" data-is-image="${record.file.is_image ? "1" : ""}">
        <div class="attachment-head">
          <i class="bi ${record.file.is_image ? "bi-file-earmark-image" : "bi-file-earmark-pdf"}"></i>
          <div>
            <div class="attachment-name">${escapeHtml(record.file.name)}</div>
            <div class="attachment-size">${formatFileSize(record.file.size)}</div>
          </div>
          <div class="d-flex gap-2 ms-auto">
            <button type="button" class="btn btn-sm btn-outline-secondary" data-file-action="open">
              <i class="bi bi-box-arrow-up-right me-1"></i>Open
            </button>
            <button type="button" class="btn btn-sm btn-primary" data-file-action="download">
              <i class="bi bi-download me-1"></i>Download
            </button>
          </div>
        </div>
        <div class="attachment-preview" data-preview></div>
      </div>
    `;
  }

  if (record.external_url) {
    return `<a href="${escapeHtml(record.external_url)}" target="_blank" rel="noopener">${escapeHtml(record.external_url)}</a>`;
  }

  return `<span class="text-muted">No file attached.</span>`;
}

export async function renderMedicalRecordDetail({ id }) {
  const { data: r } = await api.get(`/medical-records/${id}`);
  const canViewPatientLink = hasRole("admin") || hasRole("doctor");
  const myDoctorId = getUser()?.doctor?.id ?? null;
  const canEdit = hasRole("admin") || (myDoctorId !== null && myDoctorId === r.doctor?.id);

  return `
    <h2 class="h4 mb-3">${escapeHtml(r.title)}</h2>
    <div class="section-card">
      <dl class="row mb-0">
        <dt class="col-3">Patient</dt><dd class="col-9">${
          canViewPatientLink && r.patient?.public_id
            ? `<a href="/patients/${r.patient.public_id}" data-link>${escapeHtml(r.patient.name)}</a>`
            : escapeHtml(r.patient?.name)
        }</dd>
        <dt class="col-3">Doctor</dt><dd class="col-9">${escapeHtml(r.doctor?.name)}</dd>
        <dt class="col-3">Type</dt><dd class="col-9">${TYPE_LABELS[r.record_type] || escapeHtml(r.record_type)}</dd>
        <dt class="col-3">Description</dt><dd class="col-9">${escapeHtml(r.description || "—")}</dd>
        <dt class="col-3">Notes</dt><dd class="col-9">${escapeHtml(r.notes || "—")}</dd>
        <dt class="col-3">Attachment</dt><dd class="col-9">${renderAttachment(r)}</dd>
        <dt class="col-3">Date</dt><dd class="col-9">${formatDate(r.created_at)}</dd>
      </dl>
      ${canEdit ? `<a href="/medical-records/${r.id}/edit" data-link class="btn btn-outline-secondary mt-2">Edit</a>` : ""}
    </div>
  `;
}

export function afterMedicalRecordDetail() {
  const panel = document.querySelector("[data-attachment]");
  if (!panel) return;

  const path = panel.dataset.attachment;
  const fileName = panel.dataset.name;
  const isImage = Boolean(panel.dataset.isImage);
  const preview = panel.querySelector("[data-preview]");

  // The file sits on the private disk behind a token-authenticated route, so
  // it has to be fetched as a blob rather than linked to directly.
  let objectUrl = null;
  const load = async () => {
    if (objectUrl) return objectUrl;
    const blob = await api.blob(path);
    objectUrl = URL.createObjectURL(blob);
    return objectUrl;
  };

  if (isImage) {
    preview.innerHTML = `<div class="text-muted small"><span class="spinner-border spinner-border-sm me-2"></span>Loading preview...</div>`;
    load()
      .then((url) => {
        preview.innerHTML = `<img src="${url}" alt="${escapeHtml(fileName)}" class="attachment-image" />`;
      })
      .catch(() => {
        preview.innerHTML = `<div class="text-danger small">Couldn't load the preview.</div>`;
      });
  }

  panel.addEventListener("click", async (e) => {
    const button = e.target.closest("[data-file-action]");
    if (!button) return;

    button.disabled = true;
    try {
      const url = await load();
      if (button.dataset.fileAction === "download") {
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.click();
      } else {
        window.open(url, "_blank", "noopener");
      }
    } catch {
      preview.innerHTML = `<div class="text-danger small">Couldn't open the file.</div>`;
    } finally {
      button.disabled = false;
    }
  });

  window.addEventListener("beforeunload", () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  });
}
