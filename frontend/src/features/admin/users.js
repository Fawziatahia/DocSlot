import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { formatDate } from "../../lib/format.js";
import { renderPagination } from "../../components/pagination.js";

const ROLES = ["", "admin", "doctor", "patient"];

function currentPath() {
  return window.location.pathname + window.location.search;
}

export async function renderUsersList() {
  const search = new URLSearchParams(window.location.search);
  const q = search.get("q") || "";
  const role = search.get("role") || "";
  const page = search.get("page") || 1;

  const { data: users, meta } = await api.get("/admin/users", { q: q || undefined, role: role || undefined, page, per_page: 15 });

  const roleOptions = ROLES.map((r) => `<option value="${r}" ${role === r ? "selected" : ""}>${r || "All roles"}</option>`).join("");

  const rows = users.length
    ? users
        .map(
          (u) => `
        <tr>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${(u.roles || []).map((r) => `<span class="badge bg-secondary-subtle text-secondary-emphasis me-1">${r}</span>`).join("")}</td>
          <td><span class="badge ${u.is_active ? "bg-success-subtle text-success-emphasis" : "bg-danger-subtle text-danger-emphasis"}">${u.is_active ? "Active" : "Inactive"}</span></td>
          <td>${u.last_login_at ? formatDate(u.last_login_at) : "Never"}</td>
          <td class="d-flex gap-1 flex-wrap">
            <button class="btn btn-sm btn-outline-warning" data-action="toggle" data-id="${u.id}">${u.is_active ? "Deactivate" : "Activate"}</button>
            ${!u.roles.includes("admin") ? `<button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${u.id}">Delete</button>` : ""}
          </td>
        </tr>
      `
        )
        .join("")
    : `<tr><td colspan="6" class="text-center text-muted py-4">No users found.</td></tr>`;

  return `
    <h2 class="h4 mb-3">Users</h2>
    <div class="section-card">
      <div class="alert alert-danger d-none" data-list-alert role="alert"></div>
      <form id="user-filters" class="row g-2 mb-3">
        <div class="col-sm-6 col-md-4">
          <input type="text" class="form-control" name="q" placeholder="Search name or email..." value="${q}" />
        </div>
        <div class="col-sm-4 col-md-3">
          <select class="form-select" name="role">${roleOptions}</select>
        </div>
        <div class="col-sm-2">
          <button type="submit" class="btn btn-outline-primary">Filter</button>
        </div>
      </form>
      <div class="table-responsive">
        <table class="table align-middle">
          <thead><tr><th>Name</th><th>Email</th><th>Roles</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
          <tbody id="users-body">${rows}</tbody>
        </table>
      </div>
      ${renderPagination(meta, (p) => {
        const params = new URLSearchParams(window.location.search);
        params.set("page", p);
        return `/admin/users?${params.toString()}`;
      })}
    </div>
  `;
}

export function afterUsersList() {
  const alertBox = document.querySelector("[data-list-alert]");

  document.getElementById("user-filters")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const params = new URLSearchParams();
    for (const [key, value] of form.entries()) {
      if (value) params.set(key, value);
    }
    navigate(`/admin/users?${params.toString()}`);
  });

  document.getElementById("users-body")?.addEventListener("click", async (e) => {
    const button = e.target.closest("button[data-action]");
    if (!button) return;
    const { action, id } = button.dataset;

    if (action === "delete" && !window.confirm("Delete this user? This cannot be undone.")) return;

    button.disabled = true;
    try {
      if (action === "toggle") {
        await api.patch(`/admin/users/${id}/status`);
      } else if (action === "delete") {
        await api.delete(`/admin/users/${id}`);
      }
      navigate(currentPath(), true);
    } catch (err) {
      alertBox.textContent = err.message || "Something went wrong.";
      alertBox.classList.remove("d-none");
      button.disabled = false;
    }
  });
}
