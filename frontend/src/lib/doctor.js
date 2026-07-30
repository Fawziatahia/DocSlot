import { api, getUser } from "./api.js";

export async function getMyDoctorId() {
  const user = getUser();
  const { data: doctors } = await api.get("/doctors", { per_page: 100 });
  return doctors.find((d) => d.user.email === user?.email)?.id ?? null;
}
