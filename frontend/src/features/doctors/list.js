import { api, hasRole } from "../../lib/api.js";
import { fetchDepartments, fetchSpecializations } from "../../lib/lookups.js";
import { renderDoctorCard } from "../../components/doctor-card.js";
import { renderPagination } from "../../components/pagination.js";
import { renderSearchBar, attachLiveSearch } from "../../components/live-search.js";
import { escapeHtml } from "../../lib/escape.js";

function pageHref(page) {
  const params = new URLSearchParams(window.location.search);
  params.set("page", page);
  return `/doctors?${params.toString()}`;
}

async function fetchResults(params) {
  const { data: doctors, meta } = await api.get("/doctors", { ...params, per_page: 9 });

  const cards = doctors.length
    ? doctors.map(renderDoctorCard).join("")
    : `<div class="col-12"><div class="alert alert-light border text-center mb-0">No doctors match your search.</div></div>`;

  return `
    <div class="row g-3">${cards}</div>
    ${renderPagination(meta, pageHref)}
  `;
}

export async function renderDoctorsList() {
  const search = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(search.entries());

  const [departments, specializations, results] = await Promise.all([
    fetchDepartments(),
    fetchSpecializations(),
    fetchResults(params),
  ]);

  const optionsFor = (list, selectedId) =>
    list
      .map((item) => `<option value="${item.id}" ${String(item.id) === String(selectedId || "") ? "selected" : ""}>${escapeHtml(item.name)}</option>`)
      .join("");

  const controls = `
    <select class="form-select search-control" name="specialization_id" aria-label="Specialization">
      <option value="">All Specializations</option>
      ${optionsFor(specializations, params.specialization_id)}
    </select>
    <select class="form-select search-control" name="department_id" aria-label="Department">
      <option value="">All Departments</option>
      ${optionsFor(departments, params.department_id)}
    </select>
    <input type="number" min="0" class="form-control search-control" name="min_fee" placeholder="Min fee" value="${escapeHtml(params.min_fee)}" aria-label="Minimum fee" />
    <input type="number" min="0" class="form-control search-control" name="max_fee" placeholder="Max fee" value="${escapeHtml(params.max_fee)}" aria-label="Maximum fee" />
  `;

  const addButton = hasRole("admin")
    ? `<a href="/doctors/new" data-link class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i>Add Doctor</a>`
    : "";

  return `
    <div class="container py-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 class="h3 mb-0">Find a Doctor</h1>
        ${addButton}
      </div>

      ${renderSearchBar({
        id: "doctor-search",
        value: params.q || "",
        placeholder: "Search by name, doctor ID, specialization or department...",
        hint: hasRole("admin")
          ? "Admins can also search by licence number or email, and see suspended doctors."
          : "",
        controls,
      })}

      <div id="doctor-results">${results}</div>
    </div>
  `;
}

export function afterDoctorsList() {
  attachLiveSearch({
    formId: "doctor-search",
    resultsId: "doctor-results",
    render: fetchResults,
  });
}
