import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { escapeHtml } from "../../lib/escape.js";
import { renderPatientHeader, bindEntityFormSubmit, bindPatientPicker } from "../../lib/entity-form.js";

function medicationRow(m = {}) {
  return `
    <div class="row g-2 medication-row mb-2">
      <div class="col-sm-3">
        <input type="text" class="form-control form-control-sm" data-field="medication_name" placeholder="Medication" value="${escapeHtml(m.medication_name)}" required />
      </div>
      <div class="col-sm-2">
        <input type="text" class="form-control form-control-sm" data-field="dosage" placeholder="Dosage" value="${escapeHtml(m.dosage)}" required />
      </div>
      <div class="col-sm-2">
        <input type="text" class="form-control form-control-sm" data-field="frequency" placeholder="Frequency" value="${escapeHtml(m.frequency)}" required />
      </div>
      <div class="col-sm-2">
        <input type="text" class="form-control form-control-sm" data-field="duration" placeholder="Duration" value="${escapeHtml(m.duration)}" />
      </div>
      <div class="col-sm-2">
        <input type="text" class="form-control form-control-sm" data-field="instructions" placeholder="Instructions" value="${escapeHtml(m.instructions)}" />
      </div>
      <div class="col-sm-1">
        <button type="button" class="btn btn-sm btn-outline-danger remove-medication">&times;</button>
      </div>
    </div>
  `;
}

export async function renderPrescriptionForm({ id } = {}) {
  const search = new URLSearchParams(window.location.search);
  const patientId = search.get("patient_id");
  const appointmentId = search.get("appointment_id");
  const patientName = search.get("patient_name");

  const existing = id ? await api.get(`/prescriptions/${id}`).then((r) => r.data) : null;
  const medications = existing?.medications?.length ? existing.medications : [{}];

  return `
    <h2 class="h4 mb-3">${id ? "Edit Prescription" : "New Prescription"}</h2>
    <div class="section-card" style="max-width: 44rem;">
      <div class="alert alert-danger d-none" data-form-alert role="alert"></div>
      <form id="prescription-form" novalidate>
        ${renderPatientHeader({ id, existing, patientId, appointmentId, patientName })}

        <div class="mb-3">
          <label class="form-label" for="diagnosis">Diagnosis</label>
          <textarea class="form-control" id="diagnosis" name="diagnosis" rows="2" required>${escapeHtml(existing?.diagnosis)}</textarea>
          <div class="invalid-feedback" data-server="diagnosis"></div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="notes">Notes</label>
          <textarea class="form-control" id="notes" name="notes" rows="2">${escapeHtml(existing?.notes)}</textarea>
          <div class="invalid-feedback" data-server="notes"></div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="advice">Advice</label>
          <textarea class="form-control" id="advice" name="advice" rows="2" placeholder="e.g. diet, rest, follow-up guidance for the patient">${escapeHtml(existing?.advice)}</textarea>
          <div class="invalid-feedback" data-server="advice"></div>
        </div>

        ${
          id
            ? `
          <div class="mb-3">
            <label class="form-label" for="status">Status</label>
            <select class="form-select" id="status" name="status">
              <option value="active" ${existing.status === "active" ? "selected" : ""}>Active</option>
              <option value="completed" ${existing.status === "completed" ? "selected" : ""}>Completed</option>
              <option value="cancelled" ${existing.status === "cancelled" ? "selected" : ""}>Cancelled</option>
            </select>
          </div>
        `
            : ""
        }

        <label class="form-label">Medications</label>
        <div id="medications-list">${medications.map(medicationRow).join("")}</div>
        <button type="button" class="btn btn-sm btn-outline-primary mb-3" id="add-medication">+ Add Medication</button>

        <div>
          <button type="submit" class="btn btn-primary" id="prescription-form-submit">${id ? "Save Changes" : "Create Prescription"}</button>
        </div>
      </form>
    </div>
  `;
}

export function afterPrescriptionForm({ id } = {}) {
  const form = document.getElementById("prescription-form");
  const list = document.getElementById("medications-list");

  bindPatientPicker();

  document.getElementById("add-medication").addEventListener("click", () => {
    list.insertAdjacentHTML("beforeend", `
      <div class="row g-2 medication-row mb-2">
        <div class="col-sm-3"><input type="text" class="form-control form-control-sm" data-field="medication_name" placeholder="Medication" required /></div>
        <div class="col-sm-2"><input type="text" class="form-control form-control-sm" data-field="dosage" placeholder="Dosage" required /></div>
        <div class="col-sm-2"><input type="text" class="form-control form-control-sm" data-field="frequency" placeholder="Frequency" required /></div>
        <div class="col-sm-2"><input type="text" class="form-control form-control-sm" data-field="duration" placeholder="Duration" /></div>
        <div class="col-sm-2"><input type="text" class="form-control form-control-sm" data-field="instructions" placeholder="Instructions" /></div>
        <div class="col-sm-1"><button type="button" class="btn btn-sm btn-outline-danger remove-medication">&times;</button></div>
      </div>
    `);
  });

  list.addEventListener("click", (e) => {
    if (e.target.closest(".remove-medication") && list.children.length > 1) {
      e.target.closest(".medication-row").remove();
    }
  });

  bindEntityFormSubmit({
    formId: "prescription-form",
    submitId: "prescription-form-submit",
    resource: "prescriptions",
    id,
    createLabel: "Create Prescription",
    buildPayload: (form) => {
      const medications = Array.from(list.querySelectorAll(".medication-row")).map((row) => ({
        medication_name: row.querySelector('[data-field="medication_name"]').value,
        dosage: row.querySelector('[data-field="dosage"]').value,
        frequency: row.querySelector('[data-field="frequency"]').value,
        duration: row.querySelector('[data-field="duration"]').value || undefined,
        instructions: row.querySelector('[data-field="instructions"]').value || undefined,
      }));

      const payload = {
        diagnosis: form.diagnosis.value,
        notes: form.notes.value || undefined,
        advice: form.advice.value || undefined,
        medications,
      };
      if (!id) {
        payload.patient_id = form.patient_id.value;
        payload.appointment_id = form.appointment_id.value ? Number(form.appointment_id.value) : undefined;
      } else {
        payload.status = form.status.value;
      }

      return payload;
    },
    onSuccess: (data) => navigate(`/prescriptions/${data.id}`),
  });
}
