import { api } from "../../lib/api.js";
import { renderPatientDetail } from "./detail.js";

export async function renderMyProfile() {
  const { data: user } = await api.get("/auth/me");
  const patientPublicId = user.patient?.public_id;

  if (!patientPublicId) {
    return `<div class="alert alert-warning">We couldn't find your patient profile.</div>`;
  }

  return renderPatientDetail({ id: patientPublicId });
}
