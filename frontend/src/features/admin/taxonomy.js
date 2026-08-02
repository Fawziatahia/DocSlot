import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { clearFormErrors, applyFormErrors, setSubmitting } from "../../lib/forms.js";
import { renderSearchBar, attachLiveSearch } from "../../components/live-search.js";
import { escapeHtml } from "../../lib/escape.js";

function currentPath() {
  return window.location.pathname + window.location.search;
}

export function createTaxonomyPages({ resource, label }) {
  async function fetchResults(params) {
    const { data: items } = await api.get(`/${resource}`, { ...params, per_page: 50 });

    const rows = items.length
      ? items
          .map(
            (item) => `
            <tr>
              <td>${escapeHtml(item.name)}</td>
              <td>${escapeHtml(item.description || "—")}</td>
              <td>${item.doctors_count ?? 0}</td>
              <td><span class="badge ${item.is_active ? "bg-success-subtle text-success-emphasis" : "bg-danger-subtle text-danger-emphasis"}">${item.is_active ? "Active" : "Inactive"}</span></td>
              <td class="d-flex gap-1 flex-wrap">
                <a href="/admin/${resource}/${item.id}/edit" data-link class="btn btn-sm btn-outline-secondary">Edit</a>
                <button class="btn btn-sm btn-outline-warning" data-action="toggle" data-id="${item.id}">${item.is_active ? "Deactivate" : "Activate"}</button>
                <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${item.id}">Delete</button>
              </td>
            </tr>
          `
          )
          .join("")
      : `<tr><td colspan="5" class="text-center text-muted py-4">No ${label.toLowerCase()} match your search.</td></tr>`;

    return `
      <div class="alert alert-danger d-none" data-list-alert role="alert"></div>
      <div class="table-responsive">
        <table class="table align-middle">
          <thead><tr><th>Name</th><th>Description</th><th>Doctors</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  async function renderList() {
    const params = Object.fromEntries(new URLSearchParams(window.location.search).entries());
    const results = await fetchResults(params);

    return `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="h4 mb-0">${label}</h2>
        <a href="/admin/${resource}/new" data-link class="btn btn-primary"><i class="bi bi-plus-lg me-1"></i>Add ${label.replace(/s$/, "")}</a>
      </div>
      ${renderSearchBar({
        id: "taxonomy-search",
        value: params.q || "",
        placeholder: `Search ${label.toLowerCase()} by name or description...`,
      })}
      <div class="section-card" id="taxonomy-results">${results}</div>
    `;
  }

  function afterList() {
    attachLiveSearch({
      formId: "taxonomy-search",
      resultsId: "taxonomy-results",
      render: fetchResults,
    });

    document.getElementById("taxonomy-results")?.addEventListener("click", async (e) => {
      const button = e.target.closest("button[data-action]");
      if (!button) return;
      const { action, id } = button.dataset;

      if (action === "delete" && !window.confirm(`Delete this ${label.toLowerCase().replace(/s$/, "")}?`)) return;

      // Re-queried per click: the alert lives inside the container that each
      // search replaces.
      const alertBox = document.querySelector("[data-list-alert]");
      button.disabled = true;
      try {
        if (action === "toggle") {
          await api.patch(`/${resource}/${id}/status`);
        } else if (action === "delete") {
          await api.delete(`/${resource}/${id}`);
        }
        navigate(currentPath(), true);
      } catch (err) {
        alertBox.textContent = err.message || "Something went wrong.";
        alertBox.classList.remove("d-none");
        button.disabled = false;
      }
    });
  }

  async function renderForm({ id } = {}) {
    const existing = id ? await api.get(`/${resource}/${id}`).then((r) => r.data) : null;

    return `
      <h2 class="h4 mb-3">${id ? `Edit ${label.replace(/s$/, "")}` : `Add ${label.replace(/s$/, "")}`}</h2>
      <div class="section-card" style="max-width: 32rem;">
        <div class="alert alert-danger d-none" data-form-alert role="alert"></div>
        <form id="taxonomy-form" novalidate>
          <div class="mb-3">
            <label class="form-label" for="name">Name</label>
            <input type="text" class="form-control" id="name" name="name" value="${escapeHtml(existing?.name)}" required />
            <div class="invalid-feedback" data-server="name"></div>
          </div>
          <div class="mb-3">
            <label class="form-label" for="description">Description</label>
            <textarea class="form-control" id="description" name="description" rows="3">${escapeHtml(existing?.description)}</textarea>
            <div class="invalid-feedback" data-server="description"></div>
          </div>
          <div class="form-check form-switch mb-3">
            <input class="form-check-input" type="checkbox" id="is_active" name="is_active" ${existing?.is_active !== false ? "checked" : ""} />
            <label class="form-check-label" for="is_active">Active</label>
          </div>
          <button type="submit" class="btn btn-primary" id="taxonomy-form-submit">${id ? "Save Changes" : "Create"}</button>
        </form>
      </div>
    `;
  }

  function afterForm({ id } = {}) {
    const form = document.getElementById("taxonomy-form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearFormErrors(form);
      const button = document.getElementById("taxonomy-form-submit");
      setSubmitting(button, true, id ? "Save Changes" : "Create");

      const payload = {
        name: form.name.value,
        description: form.description.value || undefined,
        is_active: form.is_active.checked,
      };

      try {
        id ? await api.put(`/${resource}/${id}`, payload) : await api.post(`/${resource}`, payload);
        navigate(`/admin/${resource}`);
      } catch (err) {
        applyFormErrors(form, err);
      } finally {
        setSubmitting(button, false, id ? "Save Changes" : "Create");
      }
    });
  }

  return { renderList, afterList, renderForm, afterForm };
}
