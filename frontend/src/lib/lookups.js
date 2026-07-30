import { api } from "./api.js";

export async function fetchDepartments() {
  const { data } = await api.get("/departments", { per_page: 100 });
  return data;
}

export async function fetchSpecializations() {
  const { data } = await api.get("/specializations", { per_page: 100 });
  return data;
}
