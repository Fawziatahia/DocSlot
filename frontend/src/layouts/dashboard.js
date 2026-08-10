import { renderSidebar } from "../components/sidebar.js";
import { renderTopbar } from "../components/topbar.js";
import { renderMobileNav } from "../components/mobile-nav.js";
import { isSidebarCollapsed } from "../lib/sidebar-state.js";

export function dashboardLayout(content, { title = "", activePath = "" } = {}) {
  const collapsedClass = isSidebarCollapsed() ? " dashboard-shell--collapsed" : "";

  return `
    <div class="dashboard-shell${collapsedClass}">
      ${renderSidebar(activePath)}
      <div class="dashboard-main">
        ${renderTopbar(title)}
        <div class="dashboard-content">${content}</div>
      </div>
      ${renderMobileNav(activePath)}
    </div>
  `;
}
