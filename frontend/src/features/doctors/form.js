import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { fetchDepartments, fetchSpecializations } from "../../lib/lookups.js";
import { clearFormErrors, applyFormErrors, setSubmitting } from "../../lib/forms.js";

function optionsFor(list, selectedId) {
  return list
    .map((item) => `<option value="${item.id}" ${String(item.id) === String(selectedId || "") ? "selected" : ""}>${item.name}</option>`)
    .join("");
}

export async function renderDoctorForm({ id } = {}) {
  const [departments, specializations, existing] = await Promise.all([
    fetchDepartments(),
    fetchSpecializations(),
    id ? api.get(`/doctors/${id}`).then((r) => r.data) : Promise.resolve(null),
  ]);

  const identityFields = id
    ? ""
    : `
      <div class="mb-3">
        <label class="form-label" for="name">Full name</label>
        <input type="text" class="form-control" id="name" name="name" required />
        <div class="invalid-feedback" data-server="name"></div>
      </div>
      <div class="mb-3">
        <label class="form-label" for="email">Email</label>
        <input type="email" class="form-control" id="email" name="email" required />
        <div class="invalid-feedback" data-server="email"></div>
      </div>
      <div class="mb-3">
        <label class="form-label" for="phone">Phone</label>
        <input type="tel" class="form-control" id="phone" name="phone" />
        <div class="invalid-feedback" data-server="phone"></div>
      </div>
      <div class="mb-3">
        <label class="form-label" for="license_number">License number</label>
        <input type="text" class="form-control" id="license_number" name="license_number" required />
        <div class="invalid-feedback" data-server="license_number"></div>
      </div>
    `;

  return `
    <div class="container py-4" style="max-width: 40rem;">
      <h1 class="h3 mb-4">${id ? "Edit Doctor" : "Add Doctor"}</h1>
      <div class="section-card">
        <div class="alert alert-danger d-none" data-form-alert role="alert"></div>
        <form id="doctor-form" novalidate>
          ${identityFields}
          <div class="row">
            <div class="col-sm-6 mb-3">
              <label class="form-label" for="specialization_id">Specialization</label>
              <select class="form-select" id="specialization_id" name="specialization_id" required>
                <option value="">Select</option>
                ${optionsFor(specializations, existing?.specialization?.id)}
              </select>
              <div class="invalid-feedback" data-server="specialization_id"></div>
            </div>
            <div class="col-sm-6 mb-3">
              <label class="form-label" for="department_id">Department</label>
              <select class="form-select" id="department_id" name="department_id" required>
                <option value="">Select</option>
                ${optionsFor(departments, existing?.department?.id)}
              </select>
              <div class="invalid-feedback" data-server="department_id"></div>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label" for="qualifications">Qualifications</label>
            <textarea class="form-control" id="qualifications" name="qualifications" rows="2">${existing?.qualifications || ""}</textarea>
            <div class="invalid-feedback" data-server="qualifications"></div>
          </div>
          <div class="mb-3">
            <label class="form-label" for="bio">Bio</label>
            <textarea class="form-control" id="bio" name="bio" rows="3">${existing?.bio || ""}</textarea>
            <div class="invalid-feedback" data-server="bio"></div>
          </div>
          <div class="mb-3">
            <label class="form-label" for="consultation_fee">Consultation fee (BDT)</label>
            <input type="number" min="0" step="0.01" class="form-control" id="consultation_fee" name="consultation_fee" value="${existing?.consultation_fee ?? ""}" />
            <div class="invalid-feedback" data-server="consultation_fee"></div>
          </div>
          <button type="submit" class="btn btn-primary" id="doctor-form-submit">${id ? "Save Changes" : "Create Doctor"}</button>
        </form>
      </div>
    </div>
  `;
}

export function afterDoctorForm({ id } = {}) {
  const form = document.getElementById("doctor-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormErrors(form);
    const button = document.getElementById("doctor-form-submit");
    setSubmitting(button, true, id ? "Save Changes" : "Create Doctor");

    const payload = {
      specialization_id: form.specialization_id.value,
      department_id: form.department_id.value,
      qualifications: form.qualifications.value || undefined,
      bio: form.bio.value || undefined,
      consultation_fee: form.consultation_fee.value || undefined,
    };
    if (!id) {
      payload.name = form.name.value;
      payload.email = form.email.value;
      payload.phone = form.phone.value || undefined;
      payload.license_number = form.license_number.value;
    }

    try {
      const { data } = id ? await api.put(`/doctors/${id}`, payload) : await api.post("/doctors", payload);
      navigate(`/doctors/${data.id}`);
    } catch (err) {
      applyFormErrors(form, err);
    } finally {
      setSubmitting(button, false, id ? "Save Changes" : "Create Doctor");
    }
  });
}
