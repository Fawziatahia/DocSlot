import { getUser } from "../../lib/api.js";
import { escapeHtml } from "../../lib/escape.js";
import { renderAdminDashboard } from "./admin.js";
import { renderDoctorDashboard } from "./doctor.js";
import { renderPatientDashboard } from "./patient.js";

const RENDERERS = {
  admin: renderAdminDashboard,
  doctor: renderDoctorDashboard,
  patient: renderPatientDashboard,
};

export async function renderDashboard() {
  const user = getUser();
  const heading = `<h2 class="h4 mb-4">Welcome back, ${escapeHtml(user?.name)}</h2>`;
  const renderer = RENDERERS[user?.role];

  if (!renderer) {
    return `${heading}<div class="alert alert-warning">No dashboard is configured for your role yet.</div>`;
  }

  try {
    return `${heading}${await renderer()}`;
  } catch (err) {
    return `${heading}<div class="alert alert-danger">${escapeHtml(err.message || "Couldn't load your dashboard stats.")}</div>`;
  }
}
