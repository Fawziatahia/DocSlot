import { api } from "./api.js";
import { clearFormErrors, applyFormErrors, setSubmitting } from "./forms.js";
import { renderEntityPicker, attachEntityPicker } from "../components/entity-picker.js";
import { escapeHtml } from "./escape.js";

const PATIENT_PICKER_ID = "patient-picker";

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
              ${renderEntityPicker({
                id: PATIENT_PICKER_ID,
                name: "patient_id",
                label: "Patient",
                placeholder: "Search by name, patient ID, email or phone...",
                hint: "Start typing a name, or paste a patient ID such as <code>p7894622</code>.",
              })}
            </div>
            <input type="hidden" name="appointment_id" value="" />
          `;
}

/**
 * Activates the patient picker rendered by `renderPatientHeader`. Safe to call
 * when the patient is already fixed — the picker simply isn't on the page.
 */
export function bindPatientPicker() {
  return attachEntityPicker({
    id: PATIENT_PICKER_ID,
    search: async (query) => {
      const { data: patients } = await api.get("/patients", { q: query, per_page: 8 });
      return patients.map((p) => ({
        value: p.public_id,
        title: p.user.name,
        subtitle: [p.public_id, p.user.phone, p.user.email].filter(Boolean).join(" · "),
      }));
    },
  });
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
      // PHP doesn't parse multipart bodies on PUT, so an update carrying a
      // file goes out as POST with Laravel's _method override.
      let response;
      if (payload instanceof FormData) {
        if (id) payload.append("_method", "PUT");
        response = await api.post(id ? `/${resource}/${id}` : `/${resource}`, payload);
      } else {
        response = id ? await api.put(`/${resource}/${id}`, payload) : await api.post(`/${resource}`, payload);
      }
      const { data } = response;
      onSuccess(data);
    } catch (err) {
      applyFormErrors(form, err);
    } finally {
      setSubmitting(button, false, id ? savingLabel : createLabel);
    }
  });
}
