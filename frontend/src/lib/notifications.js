import { api, isAuthenticated } from "./api.js";
import { navigate } from "./router.js";
import { escapeHtml } from "./escape.js";
import { formatRelativeTime } from "./format.js";

const POLL_INTERVAL_MS = 30000;

let unreadCount = 0;
let initialized = false;

export function getCachedUnreadCount() {
  return unreadCount;
}

function updateBadgeDom() {
  const badge = document.getElementById("notification-badge");
  if (!badge) return;
  badge.textContent = unreadCount > 9 ? "9+" : String(unreadCount);
  badge.classList.toggle("d-none", unreadCount === 0);
}

export async function refreshUnreadCount() {
  if (!isAuthenticated()) return;
  try {
    const { data } = await api.get("/notifications/unread-count");
    unreadCount = data.count || 0;
    updateBadgeDom();
  } catch {
    // transient/auth failures are non-fatal for a background badge refresh
  }
}

function notificationTarget(n) {
  if (n.data?.appointment_id) return `/appointments/${n.data.appointment_id}`;
  if (n.data?.patient_id) return `/patients/${n.data.patient_id}`;
  return "";
}

function renderDropdownItems(items) {
  if (!items.length) {
    return `<div class="text-center text-muted small py-4">No notifications yet.</div>`;
  }

  return items
    .map(
      (n) => `
      <div
        class="notification-dropdown-item ${n.is_read ? "" : "unread"}"
        data-notif-id="${n.id}"
        data-notif-read="${n.is_read}"
        data-notif-target="${escapeHtml(notificationTarget(n))}"
        role="button"
        tabindex="0"
      >
        <div class="small ${n.is_read ? "" : "fw-semibold"}">${escapeHtml(n.title)}</div>
        <div class="text-muted small">${escapeHtml(n.message)}</div>
        <div class="text-muted" style="font-size: 0.7rem;">${formatRelativeTime(n.created_at)}</div>
      </div>
    `
    )
    .join("");
}

async function loadDropdownList() {
  const list = document.getElementById("notification-dropdown-list");
  if (!list) return;

  list.innerHTML = `<div class="text-center text-muted small py-3"><span class="spinner-border spinner-border-sm"></span></div>`;

  try {
    const { data } = await api.get("/notifications", { per_page: 8 });
    list.innerHTML = renderDropdownItems(data);
  } catch {
    list.innerHTML = `<div class="text-center text-danger small py-3">Couldn't load notifications.</div>`;
  }
}

async function handleItemClick(item) {
  const target = item.dataset.notifTarget;
  const wasUnread = item.dataset.notifRead === "false";
  item.classList.remove("unread");
  item.dataset.notifRead = "true";

  if (wasUnread) {
    try {
      await api.post(`/notifications/${item.dataset.notifId}/read`);
    } catch {
      // ignore — still navigate below
    }
    await refreshUnreadCount();
  }

  if (target) navigate(target);
}

async function handleMarkAllRead(button) {
  button.disabled = true;
  try {
    await api.post("/notifications/mark-all-read");
    document.querySelectorAll(".notification-dropdown-item.unread").forEach((el) => {
      el.classList.remove("unread");
      el.dataset.notifRead = "true";
    });
    await refreshUnreadCount();
  } catch {
    // ignore
  } finally {
    button.disabled = false;
  }
}

export function initNotificationBell() {
  if (initialized || !isAuthenticated()) return;
  initialized = true;

  refreshUnreadCount();
  setInterval(refreshUnreadCount, POLL_INTERVAL_MS);

  document.addEventListener("show.bs.dropdown", (e) => {
    if (e.target?.id === "notification-bell-toggle") loadDropdownList();
  });

  document.addEventListener("click", (e) => {
    const markAllBtn = e.target.closest("#notification-mark-all-read");
    if (markAllBtn) {
      handleMarkAllRead(markAllBtn);
      return;
    }

    const item = e.target.closest(".notification-dropdown-item");
    if (item) handleItemClick(item);
  });
}
