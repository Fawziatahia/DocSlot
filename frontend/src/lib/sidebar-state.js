/**
 * Persisted collapse state for the dashboard sidebar. The whole dashboard
 * shell is re-rendered from a fresh HTML string on every navigation (see
 * lib/router.js), so this can't live in memory — it has to be read back out
 * of storage each time dashboardLayout() runs to survive page changes.
 */
const KEY = "docslot_sidebar_collapsed";

export function isSidebarCollapsed() {
  return localStorage.getItem(KEY) === "1";
}

export function setSidebarCollapsed(collapsed) {
  localStorage.setItem(KEY, collapsed ? "1" : "0");
}
