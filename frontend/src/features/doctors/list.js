import { api, hasRole } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { fetchDepartments, fetchSpecializations } from "../../lib/lookups.js";
import { renderDoctorCard } from "../../components/doctor-card.js";
import { renderPagination } from "../../components/pagination.js";

function buildHref(params, page) {
  const next = new URLSearchParams(params);
  next.set("page", page);
  return `/doctors?${next.toString()}`;
}

export async function renderDoctorsList() {
  const search = new URLSearchParams(window.location.search);
  const filters = {
    q: search.get("q") || "",
    specialization_id: search.get("specialization_id") || "",
    department_id: search.get("department_id") || "",
    min_fee: search.get("min_fee") || "",
    max_fee: search.get("max_fee") || "",
    per_page: 9,
    page: search.get("page") || 1,
  };

  const [{ data: doctors, meta }, departments, specializations] = await Promise.all([
    api.get("/doctors", filters),
    fetchDepartments(),
    fetchSpecializations(),
  ]);

  const specOptions = specializations
    .map((s) => `<option value="${s.id}" ${String(s.id) === filters.specialization_id ? "selected" : ""}>${s.name}</option>`)
    .join("");
  const deptOptions = departments
    .map((d) => `<option value="${d.id}" ${String(d.id) === filters.department_id ? "selected" : ""}>${d.name}</option>`)
    .join("");

  const cards = doctors.length
    ? doctors.map(renderDoctorCard).join("")
    : `<div class="col-12"><div class="alert alert-light border text-center">No doctors match your search.</div></div>`;

  const addButton = hasRole("admin")
    ? `<a href="/doctors/new" data-link class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i>Add Doctor</a>`
    : "";

  return `
    <div class="container py-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 class="h3 mb-0">Find a Doctor</h1>
        ${addButton}
      </div>

      <form id="doctor-filters" class="row g-2 mb-4">
        <div class="col-md-4">
          <input type="text" class="form-control" name="q" placeholder="Search by name..." value="${filters.q}" />
        </div>
        <div class="col-6 col-md-2">
          <select class="form-select" name="specialization_id">
            <option value="">All Specializations</option>
            ${specOptions}
          </select>
        </div>
        <div class="col-6 col-md-2">
          <select class="form-select" name="department_id">
            <option value="">All Departments</option>
            ${deptOptions}
          </select>
        </div>
        <div class="col-6 col-md-2">
          <input type="number" min="0" class="form-control" name="min_fee" placeholder="Min fee" value="${filters.min_fee}" />
        </div>
        <div class="col-6 col-md-2">
          <input type="number" min="0" class="form-control" name="max_fee" placeholder="Max fee" value="${filters.max_fee}" />
        </div>
        <div class="col-12">
          <button type="submit" class="btn btn-outline-primary">Apply Filters</button>
        </div>
      </form>

      <div class="row g-3">${cards}</div>
      ${renderPagination(meta, (page) => buildHref(filters, page))}
    </div>
  `;
}

export function afterDoctorsList() {
  document.getElementById("doctor-filters")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const params = new URLSearchParams();
    for (const [key, value] of form.entries()) {
      if (value) params.set(key, value);
    }
    navigate(`/doctors?${params.toString()}`);
  });
}
