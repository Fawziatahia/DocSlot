import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { formatDate } from "../../lib/format.js";
import { renderPagination } from "../../components/pagination.js";
import { pageHrefBuilder } from "../../components/data-table.js";
import { escapeHtml } from "../../lib/escape.js";

function currentPath() {
  return window.location.pathname + window.location.search;
}

export async function renderNotificationsList() {
  const search = new URLSearchParams(window.location.search);
  const unreadOnly = search.get("unread_only") === "1";
  const page = search.get("page") || 1;

  const { data: notifications, meta } = await api.get("/notifications", {
    unread_only: unreadOnly ? "true" : undefined,
    page,
    per_page: 15,
  });

  const tabs = `
    <a href="/notifications" data-link class="nav-link ${!unreadOnly ? "active" : ""}">All</a>
    <a href="/notifications?unread_only=1" data-link class="nav-link ${unreadOnly ? "active" : ""}">Unread</a>
  `;

  const items = notifications.length
    ? notifications
        .map(
          (n) => `
        <div class="notification-item ${n.is_read ? "" : "unread"}" data-id="${n.id}">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <div>
              <div class="fw-semibold">${escapeHtml(n.title)}</div>
              <div class="text-muted small">${escapeHtml(n.message)}</div>
              <div class="text-muted small mt-1">${formatDate(n.created_at)}</div>
              ${
                n.type === "patient_referral" && n.data?.patient_id
                  ? `<a href="/patients/${n.data.patient_id}" data-link class="small">View Patient Profile</a>`
                  : ""
              }
            </div>
            ${!n.is_read ? `<button class="btn btn-sm btn-outline-secondary flex-shrink-0" data-action="read" data-id="${n.id}">Mark read</button>` : ""}
          </div>
        </div>
      `
        )
        .join("")
    : `<div class="text-center text-muted py-4">No notifications.</div>`;

  return `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="h4 mb-0">Notifications</h2>
      <button class="btn btn-outline-primary" id="mark-all-read">Mark All Read</button>
    </div>
    <ul class="nav nav-pills mb-3">${tabs}</ul>
    <div class="section-card">
      <div class="alert alert-danger d-none" data-list-alert role="alert"></div>
      <div id="notifications-list">${items}</div>
      ${renderPagination(meta, pageHrefBuilder("/notifications"))}
    </div>
  `;
}

export function afterNotificationsList() {
  const alertBox = document.querySelector("[data-list-alert]");

  document.getElementById("notifications-list")?.addEventListener("click", async (e) => {
    const button = e.target.closest("button[data-action='read']");
    if (!button) return;
    button.disabled = true;
    try {
      await api.post(`/notifications/${button.dataset.id}/read`);
      navigate(currentPath(), true);
    } catch (err) {
      alertBox.textContent = err.message || "Couldn't mark notification as read.";
      alertBox.classList.remove("d-none");
      button.disabled = false;
    }
  });

  document.getElementById("mark-all-read")?.addEventListener("click", async (e) => {
    e.target.disabled = true;
    try {
      await api.post("/notifications/mark-all-read");
      navigate(currentPath(), true);
    } catch (err) {
      alertBox.textContent = err.message || "Couldn't mark notifications as read.";
      alertBox.classList.remove("d-none");
      e.target.disabled = false;
    }
  });
}
