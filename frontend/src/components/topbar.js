import { getUser } from "../lib/api.js";

export function renderTopbar(title = "") {
  const user = getUser();

  return `
    <header class="dashboard-topbar">
      <h1 class="topbar-title">${title}</h1>
      <div class="d-flex align-items-center gap-3">
        <a href="/notifications" data-link class="topbar-icon-btn" title="Notifications"><i class="bi bi-bell"></i></a>
        <div class="dropdown">
          <button class="btn btn-light dropdown-toggle d-flex align-items-center gap-2" data-bs-toggle="dropdown">
            <span class="topbar-avatar">${(user?.name || "?").charAt(0).toUpperCase()}</span>
            <span class="d-none d-sm-inline">${user?.name || ""}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="/profile" data-link>My Profile</a></li>
            <li><hr class="dropdown-divider" /></li>
            <li><button class="dropdown-item" id="logout-btn" type="button">Log Out</button></li>
          </ul>
        </div>
      </div>
    </header>
  `;
}
