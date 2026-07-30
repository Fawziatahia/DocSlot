import { getMyDoctorId } from "../../lib/doctor.js";
import { renderDoctorDetail } from "./detail.js";

export async function renderMyProfile() {
  const doctorId = await getMyDoctorId();

  if (!doctorId) {
    return `<div class="alert alert-warning">We couldn't find your doctor profile.</div>`;
  }

  return renderDoctorDetail({ id: doctorId });
}
