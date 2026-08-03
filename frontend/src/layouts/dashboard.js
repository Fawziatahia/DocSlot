import { renderSidebar } from "../components/sidebar.js";
import { renderTopbar } from "../components/topbar.js";
import { renderMobileNav } from "../components/mobile-nav.js";

export function dashboardLayout(content, { title = "", activePath = "" } = {}) {
  return `
    <div class="dashboard-shell">
      ${renderSidebar(activePath)}
      <div class="dashboard-main">
        ${renderTopbar(title)}
        <div class="dashboard-content">${content}</div>
      </div>
      ${renderMobileNav(activePath)}
    </div>
  `;
}
