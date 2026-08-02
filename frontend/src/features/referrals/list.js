import { api, getUser } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { formatDate } from "../../lib/format.js";
import { setSubmitting } from "../../lib/forms.js";
import { renderDataTable, pageHrefBuilder } from "../../components/data-table.js";
import { renderEntityPicker, attachEntityPicker } from "../../components/entity-picker.js";
import { escapeHtml } from "../../lib/escape.js";

function currentType() {
  return new URLSearchParams(window.location.search).get("type") === "sent" ? "sent" : "received";
}

async function fetchResults() {
  const search = new URLSearchParams(window.location.search);
  const type = currentType();
  const { data: referrals, meta } = await api.get("/referrals/my", {
    type,
    page: search.get("page") || 1,
    per_page: 15,
  });

  const rows = referrals.length
    ? referrals
        .map((r) => {
          const otherDoctor = type === "sent" ? r.receiving_doctor : r.referring_doctor;
          return `
            <tr>
              <td>
                <a href="/patients/${r.patient?.public_id}" data-link>${escapeHtml(r.patient?.name)}</a>
              </td>
              <td>${escapeHtml(otherDoctor?.name || "—")}</td>
              <td>${escapeHtml(r.note || "—")}</td>
              <td>${formatDate(r.created_at)}</td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="4" class="text-center text-muted py-4">No referrals here.</td></tr>`;

  return renderDataTable({
    headers: ["Patient", type === "sent" ? "Referred To" : "Referred By", "Note", "Date"],
    body: rows,
    meta,
    pageHref: pageHrefBuilder("/referrals", { type }),
    showAlert: false,
  });
}

export async function renderReferralsList() {
  const search = new URLSearchParams(window.location.search);
  const type = currentType();
  const results = await fetchResults();

  // Arriving from a patient's profile pre-selects them, so the doctor only
  // has to pick who they're referring to.
  const patientId = search.get("patient_id");
  const patientName = search.get("patient_name");
  const preselectedPatient = patientId ? { value: patientId, title: patientName || patientId } : null;

  const tabs = `
    <a href="/referrals?type=received" data-link class="nav-link ${type === "received" ? "active" : ""}">Received</a>
    <a href="/referrals?type=sent" data-link class="nav-link ${type === "sent" ? "active" : ""}">Sent</a>
  `;

  return `
    <h2 class="h4 mb-3">Referrals</h2>

    <div class="section-card mb-4">
      <h3 class="h6 mb-3"><i class="bi bi-send me-1 text-primary"></i>Refer a Patient</h3>
      <div class="alert alert-danger d-none" data-refer-alert role="alert"></div>
      <div class="alert alert-success d-none" data-refer-success role="alert"></div>

      <div class="row g-3">
        <div class="col-md-6">
          ${renderEntityPicker({
            id: "refer-patient",
            name: "refer_patient_id",
            label: "Patient",
            placeholder: "Patient name or ID...",
            selected: preselectedPatient,
          })}
        </div>
        <div class="col-md-6">
          ${renderEntityPicker({
            id: "refer-doctor",
            name: "refer_doctor_id",
            label: "Refer to doctor",
            placeholder: "Doctor name or ID...",
          })}
        </div>
        <div class="col-12">
          <label class="form-label" for="refer-note">Note (optional)</label>
          <textarea class="form-control" id="refer-note" rows="2" placeholder="Reason for the referral, relevant history..."></textarea>
        </div>
        <div class="col-12">
          <button type="button" class="btn btn-primary" id="refer-submit">
            <i class="bi bi-send me-1"></i>Send Referral
          </button>
        </div>
      </div>
    </div>

    <ul class="nav nav-pills mb-3">${tabs}</ul>
    <div id="referral-results">${results}</div>
  `;
}

export function afterReferralsList() {
  const currentEmail = getUser()?.email;

  const patientPicker = attachEntityPicker({
    id: "refer-patient",
    search: async (query) => {
      const { data: patients } = await api.get("/patients", { q: query, per_page: 8 });
      return patients.map((p) => ({
        value: p.public_id,
        title: p.user.name,
        subtitle: [p.public_id, p.user.phone, p.user.email].filter(Boolean).join(" · "),
      }));
    },
  });

  const doctorPicker = attachEntityPicker({
    id: "refer-doctor",
    search: async (query) => {
      const { data: doctors } = await api.get("/doctors", { q: query, per_page: 8 });
      return doctors
        .filter((d) => d.user.email !== currentEmail)
        .map((d) => ({
          value: d.public_id,
          title: d.user.name,
          subtitle: [d.specialization?.name, d.department?.name, d.public_id].filter(Boolean).join(" · "),
        }));
    },
  });

  document.getElementById("refer-submit")?.addEventListener("click", async (e) => {
    const button = e.currentTarget;
    const patientInput = document.querySelector('input[name="refer_patient_id"]');
    const doctorInput = document.querySelector('input[name="refer_doctor_id"]');
    const noteInput = document.getElementById("refer-note");
    const alertBox = document.querySelector("[data-refer-alert]");
    const successBox = document.querySelector("[data-refer-success]");

    alertBox.classList.add("d-none");
    successBox.classList.add("d-none");

    if (!patientInput.value || !doctorInput.value) {
      alertBox.textContent = !patientInput.value
        ? "Choose the patient you're referring."
        : "Choose the doctor to refer them to.";
      alertBox.classList.remove("d-none");
      return;
    }

    setSubmitting(button, true, "Send Referral");

    try {
      await api.post(`/patients/${patientInput.value}/refer`, {
        doctor_id: doctorInput.value,
        note: noteInput.value || undefined,
      });

      successBox.textContent = "Referral sent successfully.";
      successBox.classList.remove("d-none");
      patientPicker?.clear();
      doctorPicker?.clear();
      noteInput.value = "";

      // Show it immediately if they're looking at the Sent tab.
      if (currentType() === "sent") {
        document.getElementById("referral-results").innerHTML = await fetchResults();
      }
    } catch (err) {
      alertBox.textContent = err.message || "Couldn't send the referral.";
      alertBox.classList.remove("d-none");
    } finally {
      setSubmitting(button, false, "Send Referral");
    }
  });
}
