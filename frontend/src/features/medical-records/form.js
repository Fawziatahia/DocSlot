import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { formatFileSize } from "../../lib/format.js";
import { escapeHtml } from "../../lib/escape.js";
import { renderPatientHeader, bindEntityFormSubmit, bindPatientPicker } from "../../lib/entity-form.js";

const RECORD_TYPES = [
  ["lab_result", "Lab Result"],
  ["imaging", "Imaging"],
  ["note", "Note"],
  ["report", "Report"],
  ["other", "Other"],
];

export async function renderMedicalRecordForm({ id } = {}) {
  const search = new URLSearchParams(window.location.search);
  const patientId = search.get("patient_id");
  const appointmentId = search.get("appointment_id");
  const patientName = search.get("patient_name");

  const existing = id ? await api.get(`/medical-records/${id}`).then((r) => r.data) : null;

  const typeOptions = RECORD_TYPES.map(
    ([value, label]) => `<option value="${value}" ${existing?.record_type === value ? "selected" : ""}>${label}</option>`
  ).join("");

  return `
    <h2 class="h4 mb-3">${id ? "Edit Medical Record" : "New Medical Record"}</h2>
    <div class="section-card" style="max-width: 36rem;">
      <div class="alert alert-danger d-none" data-form-alert role="alert"></div>
      <form id="record-form" novalidate>
        ${renderPatientHeader({ id, existing, patientId, appointmentId, patientName })}
        <div class="mb-3">
          <label class="form-label" for="record_type">Type</label>
          <select class="form-select" id="record_type" name="record_type" required>${typeOptions}</select>
          <div class="invalid-feedback" data-server="record_type"></div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="title">Title</label>
          <input type="text" class="form-control" id="title" name="title" value="${escapeHtml(existing?.title)}" required />
          <div class="invalid-feedback" data-server="title"></div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="description">Description</label>
          <textarea class="form-control" id="description" name="description" rows="3">${escapeHtml(existing?.description)}</textarea>
          <div class="invalid-feedback" data-server="description"></div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="file">Attachment (optional)</label>
          ${
            existing?.file
              ? `
            <div class="attachment-current" id="current-attachment">
              <i class="bi ${existing.file.is_image ? "bi-file-earmark-image" : "bi-file-earmark-pdf"}"></i>
              <span class="attachment-name">${escapeHtml(existing.file.name)}</span>
              <span class="attachment-size">${formatFileSize(existing.file.size)}</span>
              <div class="form-check ms-auto mb-0">
                <input class="form-check-input" type="checkbox" id="remove_file" name="remove_file" />
                <label class="form-check-label small" for="remove_file">Remove</label>
              </div>
            </div>
          `
              : existing?.external_url
                ? `<p class="form-text mb-2">Currently linked: <a href="${escapeHtml(existing.external_url)}" target="_blank" rel="noopener">${escapeHtml(existing.external_url)}</a></p>`
                : ""
          }
          <input type="file" class="form-control" id="file" name="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*" />
          <div class="form-text">PDF or image (JPG, PNG, WEBP), up to 10 MB.${existing?.file ? " Choosing a new file replaces the current one." : ""}</div>
          <div class="invalid-feedback" data-server="file"></div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="notes">Notes</label>
          <textarea class="form-control" id="notes" name="notes" rows="2">${escapeHtml(existing?.notes)}</textarea>
          <div class="invalid-feedback" data-server="notes"></div>
        </div>
        <button type="submit" class="btn btn-primary" id="record-form-submit">${id ? "Save Changes" : "Create Record"}</button>
      </form>
    </div>
  `;
}

export function afterMedicalRecordForm({ id } = {}) {
  bindPatientPicker();

  bindEntityFormSubmit({
    formId: "record-form",
    submitId: "record-form-submit",
    resource: "medical-records",
    id,
    createLabel: "Create Record",
    buildPayload: (form) => {
      const file = form.file.files[0];
      const removeFile = form.remove_file?.checked;

      const fields = {
        record_type: form.record_type.value,
        title: form.title.value,
        description: form.description.value || undefined,
        notes: form.notes.value || undefined,
      };
      if (!id) {
        fields.patient_id = form.patient_id.value;
        fields.appointment_id = form.appointment_id.value ? Number(form.appointment_id.value) : undefined;
      }

      // Only switch to multipart when there is actually a file to carry.
      if (!file && !removeFile) return fields;

      const payload = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined) payload.append(key, value);
      });
      if (file) payload.append("file", file);
      if (removeFile && !file) payload.append("remove_file", "1");

      return payload;
    },
    onSuccess: (data) => navigate(`/medical-records/${data.id}`),
  });
}
