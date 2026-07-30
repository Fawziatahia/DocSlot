import { api, getUser, hasRole } from "../../lib/api.js";
import { formatDate, statusBadgeClass } from "../../lib/format.js";
import { setSubmitting } from "../../lib/forms.js";

export async function renderPatientDetail({ id }) {
  const { data: patient } = await api.get(`/patients/${id}`);
  const user = getUser();
  const isSelf = hasRole("patient") && user && patient.user.id === user.id;
  const canManage = hasRole("admin") || hasRole("doctor") || isSelf;
  const isDoctor = hasRole("doctor");

  let doctorOptions = "";
  if (isDoctor) {
    const { data: doctors } = await api.get("/doctors", { per_page: 100 });
    doctorOptions = doctors
      .filter((d) => d.user.email !== user.email)
      .map((d) => `<option value="${d.id}">${d.user.name} — ${d.specialization?.name || ""}</option>`)
      .join("");
  }

  return `
    <h2 class="h4 mb-3">${patient.user.name}</h2>
    <div class="section-card mb-3">
      <dl class="row mb-0">
        <dt class="col-4">Email</dt><dd class="col-8">${patient.user.email}</dd>
        <dt class="col-4">Phone</dt><dd class="col-8">${patient.user.phone || "—"}</dd>
        <dt class="col-4">Date of birth</dt><dd class="col-8">${formatDate(patient.date_of_birth) || "—"}</dd>
        <dt class="col-4">Gender</dt><dd class="col-8">${patient.gender || "—"}</dd>
        <dt class="col-4">Blood group</dt><dd class="col-8">${patient.blood_group || "—"}</dd>
        <dt class="col-4">Address</dt><dd class="col-8">${patient.address || "—"}</dd>
        <dt class="col-4">Emergency contact</dt><dd class="col-8">${patient.emergency_contact_name ? `${patient.emergency_contact_name} (${patient.emergency_contact || "—"})` : "—"}</dd>
        <dt class="col-4">Status</dt><dd class="col-8"><span class="badge ${statusBadgeClass(patient.status)}">${patient.status}</span></dd>
      </dl>
      <div class="d-flex flex-wrap gap-2 mt-3">
        ${canManage ? `<a href="/patients/${patient.id}/edit" data-link class="btn btn-outline-secondary">Edit</a>` : ""}
        <a href="/patients/${patient.id}/medical-history" data-link class="btn btn-outline-secondary">Medical History</a>
        <a href="/patients/${patient.id}/prescriptions" data-link class="btn btn-outline-secondary">Prescriptions</a>
        ${
          isDoctor
            ? `
          <a href="/prescriptions/new?patient_id=${patient.id}&patient_name=${encodeURIComponent(patient.user.name)}" data-link class="btn btn-outline-secondary">
            <i class="bi bi-capsule me-1"></i>Write Prescription
          </a>
          <a href="/medical-records/new?patient_id=${patient.id}&patient_name=${encodeURIComponent(patient.user.name)}" data-link class="btn btn-outline-secondary">
            <i class="bi bi-file-earmark-medical me-1"></i>Add Medical Record
          </a>
          <button type="button" class="btn btn-outline-secondary" id="toggle-refer"><i class="bi bi-send me-1"></i>Refer to Another Doctor</button>
        `
            : ""
        }
      </div>
    </div>

    ${
      isDoctor
        ? `
      <div class="section-card d-none" id="refer-panel">
        <h2 class="h6 mb-3">Refer to Another Doctor</h2>
        <div class="alert alert-danger d-none" data-refer-alert role="alert"></div>
        <div class="alert alert-success d-none" data-refer-success role="alert"></div>
        <div class="mb-3">
          <label class="form-label" for="refer-doctor">Doctor</label>
          <select class="form-select" id="refer-doctor">
            <option value="">Select a doctor</option>
            ${doctorOptions}
          </select>
        </div>
        <div class="mb-3">
          <label class="form-label" for="refer-note">Note (optional)</label>
          <textarea class="form-control" id="refer-note" rows="2"></textarea>
        </div>
        <button type="button" class="btn btn-primary" id="refer-submit">Send Referral</button>
      </div>
    `
        : ""
    }
  `;
}

export function afterPatientDetail({ id }) {
  const toggleBtn = document.getElementById("toggle-refer");
  const panel = document.getElementById("refer-panel");
  toggleBtn?.addEventListener("click", () => panel.classList.toggle("d-none"));

  document.getElementById("refer-submit")?.addEventListener("click", async () => {
    const doctorSelect = document.getElementById("refer-doctor");
    const noteInput = document.getElementById("refer-note");
    const alertBox = document.querySelector("[data-refer-alert]");
    const successBox = document.querySelector("[data-refer-success]");
    alertBox.classList.add("d-none");
    successBox.classList.add("d-none");

    if (!doctorSelect.value) {
      alertBox.textContent = "Please select a doctor.";
      alertBox.classList.remove("d-none");
      return;
    }

    const button = document.getElementById("refer-submit");
    setSubmitting(button, true, "Send Referral");

    try {
      await api.post(`/patients/${id}/refer`, {
        doctor_id: Number(doctorSelect.value),
        note: noteInput.value || undefined,
      });
      successBox.textContent = "Referral sent successfully.";
      successBox.classList.remove("d-none");
      doctorSelect.value = "";
      noteInput.value = "";
    } catch (err) {
      alertBox.textContent = err.message || "Couldn't send the referral.";
      alertBox.classList.remove("d-none");
    } finally {
      setSubmitting(button, false, "Send Referral");
    }
  });
}
