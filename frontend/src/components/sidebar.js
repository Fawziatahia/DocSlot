import { getUser } from "../lib/api.js";
import { isSidebarCollapsed } from "../lib/sidebar-state.js";
import logo from "../assets/logo.png";

export const NAV_BY_ROLE = {
  admin: [
    { href: "/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { href: "/doctors", label: "Doctors", icon: "bi-heart-pulse" },
    { href: "/patients", label: "Patients", icon: "bi-people" },
    { href: "/appointments", label: "Appointments", icon: "bi-calendar-check" },
    { href: "/prescriptions", label: "Prescriptions", icon: "bi-capsule" },
    { href: "/medical-records", label: "Medical Records", icon: "bi-file-earmark-medical" },
    { href: "/admin/users", label: "Users", icon: "bi-person-lines-fill" },
    { href: "/admin/departments", label: "Departments", icon: "bi-building" },
    { href: "/admin/specializations", label: "Specializations", icon: "bi-tags" },
    { href: "/reports", label: "Reports", icon: "bi-graph-up-arrow" },
    { href: "/admin/settings", label: "Settings", icon: "bi-gear" },
  ],
  doctor: [
    { href: "/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { href: "/appointments", label: "Appointments", icon: "bi-calendar-check" },
    { href: "/patients", label: "Patients", icon: "bi-people" },
    { href: "/prescriptions", label: "Prescriptions", icon: "bi-capsule" },
    { href: "/referrals", label: "Referrals", icon: "bi-send" },
    { href: "/profile", label: "My Profile", icon: "bi-person-badge" },
  ],
  patient: [
    { href: "/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { href: "/symptom-checker", label: "Symptom Checker", icon: "bi-clipboard2-pulse" },
    { href: "/doctors", label: "Find a Doctor", icon: "bi-heart-pulse" },
    { href: "/appointments", label: "My Appointments", icon: "bi-calendar-check" },
    { href: "/prescriptions", label: "Prescriptions", icon: "bi-capsule" },
    { href: "/medical-records", label: "Medical Records", icon: "bi-file-earmark-medical" },
    { href: "/profile", label: "My Profile", icon: "bi-person-badge" },
  ],
};

export function renderSidebar(activePath) {
  const user = getUser();
  const items = NAV_BY_ROLE[user?.role] || [];

  const links = items
    .map(
      (item) => `
      <a href="${item.href}" data-link class="sidebar-link ${activePath === item.href ? "active" : ""}" title="${item.label}">
        <span class="sidebar-icon"><i class="bi ${item.icon}"></i></span>
        <span class="sidebar-label">${item.label}</span>
      </a>`
    )
    .join("");

  const collapsed = isSidebarCollapsed();

  return `
    <aside class="dashboard-sidebar">
      <div class="sidebar-top">
        <button
          type="button"
          class="sidebar-brand"
          data-sidebar-toggle
          title="${collapsed ? "Expand sidebar" : "Collapse sidebar"}"
          aria-label="${collapsed ? "Expand sidebar" : "Collapse sidebar"}"
          aria-expanded="${collapsed ? "false" : "true"}"
        >
          <img src="${logo}" alt="DocSlot" width="218" height="180" />
        </button>
      </div>
      <nav class="sidebar-nav">${links}</nav>
    </aside>
  `;
}
