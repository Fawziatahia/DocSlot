import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { clearFormErrors, applyFormErrors, setSubmitting } from "../../lib/forms.js";

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
        ${
          id
            ? `<p class="text-muted">Patient: <strong>${existing.patient?.name || ""}</strong></p>`
            : patientId
              ? `
            <p class="text-muted">Patient: <strong>${patientName || patientId}</strong></p>
            <input type="hidden" name="patient_id" value="${patientId}" />
            <input type="hidden" name="appointment_id" value="${appointmentId || ""}" />
          `
              : `
            <div class="mb-3">
              <label class="form-label" for="patient_id">Patient ID</label>
              <input type="text" class="form-control" id="patient_id" name="patient_id" placeholder="e.g. p7894622" required />
              <div class="form-text">Find the patient's ID on their profile page.</div>
              <div class="invalid-feedback" data-server="patient_id"></div>
            </div>
            <input type="hidden" name="appointment_id" value="" />
          `
        }
        <div class="mb-3">
          <label class="form-label" for="record_type">Type</label>
          <select class="form-select" id="record_type" name="record_type" required>${typeOptions}</select>
          <div class="invalid-feedback" data-server="record_type"></div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="title">Title</label>
          <input type="text" class="form-control" id="title" name="title" value="${existing?.title || ""}" required />
          <div class="invalid-feedback" data-server="title"></div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="description">Description</label>
          <textarea class="form-control" id="description" name="description" rows="3">${existing?.description || ""}</textarea>
          <div class="invalid-feedback" data-server="description"></div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="file_path">File URL (optional)</label>
          <input type="text" class="form-control" id="file_path" name="file_path" value="${existing?.file_path || ""}" placeholder="https://..." />
          <div class="invalid-feedback" data-server="file_path"></div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="notes">Notes</label>
          <textarea class="form-control" id="notes" name="notes" rows="2">${existing?.notes || ""}</textarea>
          <div class="invalid-feedback" data-server="notes"></div>
        </div>
        <button type="submit" class="btn btn-primary" id="record-form-submit">${id ? "Save Changes" : "Create Record"}</button>
      </form>
    </div>
  `;
}

export function afterMedicalRecordForm({ id } = {}) {
  const form = document.getElementById("record-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormErrors(form);
    const button = document.getElementById("record-form-submit");
    setSubmitting(button, true, id ? "Save Changes" : "Create Record");

    const payload = {
      record_type: form.record_type.value,
      title: form.title.value,
      description: form.description.value || undefined,
      file_path: form.file_path.value || undefined,
      notes: form.notes.value || undefined,
    };
    if (!id) {
      payload.patient_id = form.patient_id.value;
      payload.appointment_id = form.appointment_id.value ? Number(form.appointment_id.value) : undefined;
    }

    try {
      const { data } = id ? await api.put(`/medical-records/${id}`, payload) : await api.post("/medical-records", payload);
      navigate(`/medical-records/${data.id}`);
    } catch (err) {
      applyFormErrors(form, err);
    } finally {
      setSubmitting(button, false, id ? "Save Changes" : "Create Record");
    }
  });
}
