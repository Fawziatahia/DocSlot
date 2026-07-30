import { getUser } from "../lib/api.js";

const NAV_BY_ROLE = {
  admin: [
    { href: "/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { href: "/doctors", label: "Doctors", icon: "bi-heart-pulse" },
    { href: "/patients", label: "Patients", icon: "bi-people" },
    { href: "/appointments", label: "Appointments", icon: "bi-calendar-check" },
    { href: "/admin/users", label: "Users", icon: "bi-person-lines-fill" },
    { href: "/admin/departments", label: "Departments", icon: "bi-building" },
    { href: "/admin/specializations", label: "Specializations", icon: "bi-tags" },
    { href: "/reports", label: "Reports", icon: "bi-graph-up-arrow" },
    { href: "/admin/settings", label: "Settings", icon: "bi-gear" },
  ],
  doctor: [
    { href: "/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { href: "/appointments", label: "Appointments", icon: "bi-calendar-check" },
    { href: "/prescriptions", label: "Prescriptions", icon: "bi-capsule" },
    { href: "/profile", label: "My Profile", icon: "bi-person-badge" },
  ],
  patient: [
    { href: "/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { href: "/doctors", label: "Find a Doctor", icon: "bi-heart-pulse" },
    { href: "/appointments", label: "My Appointments", icon: "bi-calendar-check" },
    { href: "/prescriptions", label: "Prescriptions", icon: "bi-capsule" },
    { href: "/medical-records", label: "Medical Records", icon: "bi-file-earmark-medical" },
  ],
};

export function renderSidebar(activePath) {
  const user = getUser();
  const items = NAV_BY_ROLE[user?.role] || [];

  const links = items
    .map(
      (item) => `
      <a href="${item.href}" data-link class="sidebar-link ${activePath === item.href ? "active" : ""}">
        <span class="sidebar-icon"><i class="bi ${item.icon}"></i></span>
        <span>${item.label}</span>
      </a>`
    )
    .join("");

  return `
    <aside class="dashboard-sidebar">
      <a href="/" data-link class="sidebar-brand">DocSlot</a>
      <nav class="sidebar-nav">${links}</nav>
    </aside>
  `;
}
