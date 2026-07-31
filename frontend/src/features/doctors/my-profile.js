import { api } from "../../lib/api.js";
import { renderDoctorDetail } from "./detail.js";

export async function renderMyProfile() {
  const { data: user } = await api.get("/auth/me");
  const doctorPublicId = user.doctor?.public_id;

  if (!doctorPublicId) {
    return `<div class="alert alert-warning">We couldn't find your doctor profile.</div>`;
  }

  return renderDoctorDetail({ id: doctorPublicId });
}
