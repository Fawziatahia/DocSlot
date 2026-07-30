import { api, getUser } from "../../lib/api.js";
import { renderDoctorDetail } from "./detail.js";

export async function renderMyProfile() {
  const user = getUser();
  const { data: doctors } = await api.get("/doctors", { per_page: 100 });
  const mine = doctors.find((d) => d.user.email === user.email);

  if (!mine) {
    return `<div class="alert alert-warning">We couldn't find your doctor profile.</div>`;
  }

  return renderDoctorDetail({ id: mine.id });
}
