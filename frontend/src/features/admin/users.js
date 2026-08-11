import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { formatDate } from "../../lib/format.js";
import { renderPagination } from "../../components/pagination.js";
import { renderSearchBar, attachLiveSearch } from "../../components/live-search.js";
import { escapeHtml } from "../../lib/escape.js";

const ROLES = ["", "admin", "doctor", "patient"];

const ROLE_BADGE = {
  admin: "bg-primary-subtle text-primary-emphasis",
  doctor: "bg-success-subtle text-success-emphasis",
  patient: "bg-info-subtle text-info-emphasis",
};

function currentPath() {
  return window.location.pathname + window.location.search;
}

async function fetchResults(params) {
  const { data: users, meta } = await api.get("/admin/users", { ...params, per_page: 15 });

  const rows = users.length
    ? users
        .map(
          (u) => `
        <tr>
          <td>${escapeHtml(u.name)}</td>
          <td>${escapeHtml(u.email)}</td>
          <td>${(u.roles || []).map((r) => `<span class="badge ${ROLE_BADGE[r] || "bg-secondary-subtle text-secondary-emphasis"} me-1">${escapeHtml(r)}</span>`).join("")}</td>
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
    : `<tr><td colspan="6" class="text-center text-muted py-4">No users match your search.</td></tr>`;

  return `
    <div class="alert alert-danger d-none" data-list-alert role="alert"></div>
    <div class="table-responsive">
      <table class="table align-middle">
        <thead><tr><th>Name</th><th>Email</th><th>Roles</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${renderPagination(meta, (p) => {
      const next = new URLSearchParams(window.location.search);
      next.set("page", p);
      return `/admin/users?${next.toString()}`;
    })}
  `;
}

export async function renderUsersList() {
  const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
  const results = await fetchResults(params);

  const roleOptions = ROLES.map(
    (r) => `<option value="${r}" ${(params.role || "") === r ? "selected" : ""}>${r || "All roles"}</option>`
  ).join("");

  return `
    <h2 class="h4 mb-3">Users</h2>
    ${renderSearchBar({
      id: "user-search",
      value: params.q || "",
      placeholder: "Search by name or email...",
      controls: `<select class="form-select search-control" name="role" aria-label="Role">${roleOptions}</select>`,
    })}
    <div class="section-card" id="user-results">${results}</div>
  `;
}

export function afterUsersList() {
  attachLiveSearch({
    formId: "user-search",
    resultsId: "user-results",
    render: fetchResults,
  });

  document.getElementById("user-results")?.addEventListener("click", async (e) => {
    const button = e.target.closest("button[data-action]");
    if (!button) return;
    const { action, id } = button.dataset;

    if (action === "delete" && !window.confirm("Delete this user? This cannot be undone.")) return;

    // Re-queried per click: the alert lives inside the container that each
    // search replaces.
    const alertBox = document.querySelector("[data-list-alert]");
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
