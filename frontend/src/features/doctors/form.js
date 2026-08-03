import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { fetchDepartments, fetchSpecializations } from "../../lib/lookups.js";
import { clearFormErrors, applyFormErrors, setSubmitting } from "../../lib/forms.js";
import { escapeHtml } from "../../lib/escape.js";

function optionsFor(list, selectedId) {
  return list
    .map((item) => `<option value="${item.id}" ${String(item.id) === String(selectedId || "") ? "selected" : ""}>${escapeHtml(item.name)}</option>`)
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
        <label class="form-label" for="password">Temporary password</label>
        <input type="text" class="form-control" id="password" name="password" minlength="8" required />
        <div class="form-text">Share this with the doctor — they'll be required to change it on first login.</div>
        <div class="invalid-feedback" data-server="password"></div>
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
            <label class="form-label" for="avatar">Profile photo</label>
            <div class="avatar-field">
              <span class="avatar-preview" id="avatar-preview">
                ${
                  existing?.user?.avatar
                    ? `<img src="${escapeHtml(existing.user.avatar)}" alt="Current photo" />`
                    : `<i class="bi bi-person"></i>`
                }
              </span>
              <div class="flex-grow-1">
                <input type="file" class="form-control" id="avatar" name="avatar" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" />
                <div class="form-text">JPG, PNG or WEBP, up to 2 MB.${existing?.user?.avatar ? " Choosing a new photo replaces the current one." : ""}</div>
                ${
                  existing?.user?.avatar
                    ? `<div class="form-check mt-1">
                         <input class="form-check-input" type="checkbox" id="remove_avatar" name="remove_avatar" />
                         <label class="form-check-label small" for="remove_avatar">Remove current photo</label>
                       </div>`
                    : ""
                }
                <div class="invalid-feedback d-block" data-server="avatar"></div>
              </div>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label" for="qualifications">Qualifications</label>
            <textarea class="form-control" id="qualifications" name="qualifications" rows="2">${escapeHtml(existing?.qualifications)}</textarea>
            <div class="invalid-feedback" data-server="qualifications"></div>
          </div>
          <div class="mb-3">
            <label class="form-label" for="bio">Bio</label>
            <textarea class="form-control" id="bio" name="bio" rows="3">${escapeHtml(existing?.bio)}</textarea>
            <div class="invalid-feedback" data-server="bio"></div>
          </div>
          <div class="mb-3">
            <label class="form-label" for="consultation_fee">Consultation fee (BDT)</label>
            <input type="number" min="0" step="0.01" class="form-control" id="consultation_fee" name="consultation_fee" value="${existing?.consultation_fee ?? ""}" />
            <div class="invalid-feedback" data-server="consultation_fee"></div>
          </div>
          ${
            id
              ? `
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" id="reviews_enabled" name="reviews_enabled" ${existing?.reviews_enabled !== false ? "checked" : ""} />
              <label class="form-check-label" for="reviews_enabled">Allow patients to rate and review me</label>
              <div class="form-text">Turning this off hides your reviews and stops new ones from being submitted.</div>
            </div>
          `
              : ""
          }
          <div class="form-actions">
            <a href="${id ? `/doctors/${id}` : "/doctors"}" data-link class="btn btn-outline-secondary">Cancel</a>
            <button type="submit" class="btn btn-primary" id="doctor-form-submit">${id ? "Save Changes" : "Create Doctor"}</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function afterDoctorForm({ id } = {}) {
  const form = document.getElementById("doctor-form");

  // Live preview of a newly chosen photo before it's uploaded.
  const fileInput = form.querySelector("#avatar");
  const preview = form.querySelector("#avatar-preview");
  fileInput?.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    preview.innerHTML = `<img src="${url}" alt="Selected photo" />`;
    const removeBox = form.querySelector("#remove_avatar");
    if (removeBox) removeBox.checked = false;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearFormErrors(form);
    const button = document.getElementById("doctor-form-submit");
    setSubmitting(button, true, id ? "Save Changes" : "Create Doctor");

    const fields = {
      specialization_id: form.specialization_id.value,
      department_id: form.department_id.value,
      qualifications: form.qualifications.value || undefined,
      bio: form.bio.value || undefined,
      consultation_fee: form.consultation_fee.value || undefined,
    };
    if (!id) {
      fields.name = form.name.value;
      fields.email = form.email.value;
      fields.password = form.password.value;
      fields.phone = form.phone.value || undefined;
      fields.license_number = form.license_number.value;
    } else {
      fields.reviews_enabled = form.reviews_enabled.checked ? "1" : "0";
    }

    const avatarFile = fileInput?.files[0];
    const removeAvatar = form.querySelector("#remove_avatar")?.checked;

    try {
      let data;
      // Only switch to multipart when a photo is actually being changed;
      // PHP can't parse multipart on PUT, so an edit spoofs the method.
      if (avatarFile || removeAvatar) {
        const payload = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          if (value !== undefined) payload.append(key, value);
        });
        if (avatarFile) payload.append("avatar", avatarFile);
        if (removeAvatar && !avatarFile) payload.append("remove_avatar", "1");
        if (id) payload.append("_method", "PUT");
        ({ data } = await api.post(id ? `/doctors/${id}` : "/doctors", payload));
      } else {
        ({ data } = id ? await api.put(`/doctors/${id}`, fields) : await api.post("/doctors", fields));
      }
      navigate(`/doctors/${data.public_id}`);
    } catch (err) {
      applyFormErrors(form, err);
    } finally {
      setSubmitting(button, false, id ? "Save Changes" : "Create Doctor");
    }
  });
}
