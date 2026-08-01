import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { clearFormErrors, applyFormErrors, setSubmitting } from "../../lib/forms.js";
import { escapeHtml } from "../../lib/escape.js";

export async function renderPatientForm({ id }) {
  const { data: patient } = await api.get(`/patients/${id}`);

  return `
    <h2 class="h4 mb-3">Edit Patient</h2>
    <div class="section-card" style="max-width: 32rem;">
      <div class="alert alert-danger d-none" data-form-alert role="alert"></div>
      <form id="patient-form" novalidate>
        <div class="row">
          <div class="col-sm-7 mb-3">
            <label class="form-label" for="date_of_birth">Date of birth</label>
            <input type="date" class="form-control" id="date_of_birth" name="date_of_birth" value="${escapeHtml(patient.date_of_birth)}" />
            <div class="invalid-feedback" data-server="date_of_birth"></div>
          </div>
          <div class="col-sm-5 mb-3">
            <label class="form-label" for="gender">Gender</label>
            <select class="form-select" id="gender" name="gender">
              <option value="">Select</option>
              <option value="male" ${patient.gender === "male" ? "selected" : ""}>Male</option>
              <option value="female" ${patient.gender === "female" ? "selected" : ""}>Female</option>
              <option value="other" ${patient.gender === "other" ? "selected" : ""}>Other</option>
            </select>
            <div class="invalid-feedback" data-server="gender"></div>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="blood_group">Blood group</label>
          <input type="text" class="form-control" id="blood_group" name="blood_group" value="${escapeHtml(patient.blood_group)}" placeholder="e.g. O+" />
          <div class="invalid-feedback" data-server="blood_group"></div>
        </div>
        <div class="mb-3">
          <label class="form-label" for="address">Address</label>
          <textarea class="form-control" id="address" name="address" rows="2">${escapeHtml(patient.address)}</textarea>
          <div class="invalid-feedback" data-server="address"></div>
        </div>
        <div class="row">
          <div class="col-sm-7 mb-3">
            <label class="form-label" for="emergency_contact_name">Emergency contact name</label>
            <input type="text" class="form-control" id="emergency_contact_name" name="emergency_contact_name" value="${escapeHtml(patient.emergency_contact_name)}" />
            <div class="invalid-feedback" data-server="emergency_contact_name"></div>
          </div>
          <div class="col-sm-5 mb-3">
            <label class="form-label" for="emergency_contact">Emergency phone</label>
            <input type="text" class="form-control" id="emergency_contact" name="emergency_contact" value="${escapeHtml(patient.emergency_contact)}" />
            <div class="invalid-feedback" data-server="emergency_contact"></div>
          </div>
        </div>
        <button type="submit" class="btn btn-primary" id="patient-form-submit">Save Changes</button>
      </form>
    </div>
  `;
}

export function afterPatientForm({ id }) {
  const form = document.getElementById("patient-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormErrors(form);
    const button = document.getElementById("patient-form-submit");
    setSubmitting(button, true, "Save Changes");

    try {
      await api.put(`/patients/${id}`, {
        date_of_birth: form.date_of_birth.value || undefined,
        gender: form.gender.value || undefined,
        blood_group: form.blood_group.value || undefined,
        address: form.address.value || undefined,
        emergency_contact_name: form.emergency_contact_name.value || undefined,
        emergency_contact: form.emergency_contact.value || undefined,
      });
      navigate(`/patients/${id}`);
    } catch (err) {
      applyFormErrors(form, err);
    } finally {
      setSubmitting(button, false, "Save Changes");
    }
  });
}
