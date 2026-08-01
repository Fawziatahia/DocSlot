import { getUser } from "../lib/api.js";
import { escapeHtml } from "../lib/escape.js";
import { getCachedUnreadCount } from "../lib/notifications.js";

export function renderTopbar(title = "") {
  const user = getUser();
  const unreadCount = getCachedUnreadCount();

  return `
    <header class="dashboard-topbar">
      <h1 class="topbar-title">${title}</h1>
      <div class="d-flex align-items-center gap-3">
        <div class="dropdown">
          <button type="button" class="topbar-icon-btn" id="notification-bell-toggle" data-bs-toggle="dropdown" aria-expanded="false" title="Notifications">
            <i class="bi bi-bell"></i>
            <span class="notification-badge ${unreadCount ? "" : "d-none"}" id="notification-badge">${unreadCount > 9 ? "9+" : unreadCount}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end notification-dropdown" aria-labelledby="notification-bell-toggle">
            <li class="d-flex justify-content-between align-items-center px-3 py-2">
              <span class="fw-semibold small">Notifications</span>
              <button type="button" class="btn btn-link btn-sm p-0" id="notification-mark-all-read">Mark all as read</button>
            </li>
            <li><hr class="dropdown-divider my-0" /></li>
            <li>
              <div id="notification-dropdown-list" class="notification-dropdown-list">
                <div class="text-center text-muted small py-3"><span class="spinner-border spinner-border-sm"></span></div>
              </div>
            </li>
            <li><hr class="dropdown-divider my-0" /></li>
            <li><a class="dropdown-item text-center small" href="/notifications" data-link>View all</a></li>
          </ul>
        </div>
        <div class="dropdown">
          <button class="btn btn-light dropdown-toggle d-flex align-items-center gap-2" data-bs-toggle="dropdown">
            <span class="topbar-avatar">${escapeHtml((user?.name || "?").charAt(0).toUpperCase())}</span>
            <span class="d-none d-sm-inline">${escapeHtml(user?.name)}</span>
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
