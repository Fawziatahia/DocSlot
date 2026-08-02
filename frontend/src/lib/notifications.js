import { api, isAuthenticated } from "./api.js";
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

/**
 * Where a notification should take you. Every type that carries an id gets a
 * destination — previously only appointments and patients did, so clicking a
 * prescription or medical-record notification did nothing at all.
 */
export function notificationTarget(n) {
  const data = n.data || {};
  if (data.appointment_id) return `/appointments/${data.appointment_id}`;
  if (data.prescription_id) return `/prescriptions/${data.prescription_id}`;
  if (data.medical_record_id) return `/medical-records/${data.medical_record_id}`;
  if (data.patient_id) return `/patients/${data.patient_id}`;
  if (data.doctor_id) return `/doctors/${data.doctor_id}`;
  return "";
}

function renderDropdownItems(items) {
  if (!items.length) {
    return `<div class="text-center text-muted small py-4">No notifications yet.</div>`;
  }

  return items
    .map((n) => {
      const target = notificationTarget(n);
      // A real anchor, so the router's own link handling drives navigation and
      // the row behaves like a link (hover, focus, middle-click).
      const tag = target ? "a" : "div";
      const linkAttrs = target ? `href="${escapeHtml(target)}" data-link` : "";

      return `
      <${tag}
        class="notification-dropdown-item ${n.is_read ? "" : "unread"}"
        ${linkAttrs}
        data-notif-id="${n.id}"
        data-notif-read="${n.is_read}"
      >
        <div class="small ${n.is_read ? "" : "fw-semibold"}">${escapeHtml(n.title)}</div>
        <div class="text-muted small">${escapeHtml(n.message)}</div>
        <div class="text-muted" style="font-size: 0.7rem;">${formatRelativeTime(n.created_at)}</div>
      </${tag}>
    `;
    })
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

/**
 * Marking-as-read runs alongside navigation rather than before it: the router
 * handles the anchor itself, so this must never block or swallow the click.
 */
async function markItemRead(item) {
  if (item.dataset.notifRead !== "false") return;

  item.classList.remove("unread");
  item.dataset.notifRead = "true";

  try {
    await api.post(`/notifications/${item.dataset.notifId}/read`);
    await refreshUnreadCount();
  } catch {
    // a failed read-receipt shouldn't affect what the user sees next
  }
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
    if (!item) return;

    markItemRead(item);

    // Items with a destination are anchors the router already handles; the
    // rest have nowhere to go, so at least close the menu.
    if (!item.hasAttribute("href")) {
      document.getElementById("notification-bell-toggle")?.click();
    }
  });
}
