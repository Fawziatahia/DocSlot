import { renderSidebar } from "../components/sidebar.js";
import { renderTopbar } from "../components/topbar.js";

export function dashboardLayout(content, { title = "", activePath = "" } = {}) {
  return `
    <div class="dashboard-shell">
      ${renderSidebar(activePath)}
      <div class="dashboard-main">
        ${renderTopbar(title)}
        <div class="dashboard-content">${content}</div>
      </div>
    </div>
  `;
}
