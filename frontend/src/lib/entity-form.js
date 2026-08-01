import { api } from "./api.js";
import { clearFormErrors, applyFormErrors, setSubmitting } from "./forms.js";
import { escapeHtml } from "./escape.js";

export function renderPatientHeader({ id, existing, patientId, appointmentId, patientName }) {
  if (id) {
    return `<p class="text-muted">Patient: <strong>${escapeHtml(existing.patient?.name)}</strong></p>`;
  }

  if (patientId) {
    return `
            <p class="text-muted">Patient: <strong>${escapeHtml(patientName || patientId)}</strong></p>
            <input type="hidden" name="patient_id" value="${escapeHtml(patientId)}" />
            <input type="hidden" name="appointment_id" value="${escapeHtml(appointmentId)}" />
          `;
  }

  return `
            <div class="mb-3">
              <label class="form-label" for="patient_id">Patient ID</label>
              <input type="text" class="form-control" id="patient_id" name="patient_id" placeholder="e.g. p7894622" required />
              <div class="form-text">Find the patient's ID on their profile page.</div>
              <div class="invalid-feedback" data-server="patient_id"></div>
            </div>
            <input type="hidden" name="appointment_id" value="" />
          `;
}

export function bindEntityFormSubmit({ formId, submitId, resource, id, createLabel, savingLabel = "Save Changes", buildPayload, onSuccess }) {
  const form = document.getElementById(formId);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormErrors(form);
    const button = document.getElementById(submitId);
    setSubmitting(button, true, id ? savingLabel : createLabel);

    const payload = buildPayload(form);

    try {
      const { data } = id ? await api.put(`/${resource}/${id}`, payload) : await api.post(`/${resource}`, payload);
      onSuccess(data);
    } catch (err) {
      applyFormErrors(form, err);
    } finally {
      setSubmitting(button, false, id ? savingLabel : createLabel);
    }
  });
}
