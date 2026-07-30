import { api } from "../../lib/api.js";
import { renderStatGrid } from "../../components/stat-card.js";
import { formatCurrency } from "../../lib/format.js";

export async function renderAdminDashboard() {
  const { data: s } = await api.get("/dashboard/admin");

  return `
    ${renderStatGrid([
      { icon: "bi-heart-pulse", label: "Total Doctors", value: s.total_doctors, accent: "primary" },
      { icon: "bi-person-check", label: "Active Doctors", value: s.active_doctors, accent: "success" },
      { icon: "bi-people", label: "Total Patients", value: s.total_patients, accent: "info" },
      { icon: "bi-calendar-check", label: "Total Appointments", value: s.total_appointments, accent: "primary" },
      { icon: "bi-calendar-day", label: "Today's Appointments", value: s.today_appointments, accent: "warning" },
      { icon: "bi-hourglass-split", label: "Pending Appointments", value: s.pending_appointments, accent: "warning" },
      { icon: "bi-check-circle", label: "Completed Appointments", value: s.completed_appointments, accent: "success" },
      { icon: "bi-capsule", label: "Total Prescriptions", value: s.total_prescriptions, accent: "info" },
    ])}
    <div class="section-card mt-3">
      <div class="d-flex align-items-center gap-3">
        <div class="stat-icon text-bg-success"><i class="bi bi-cash-coin"></i></div>
        <div>
          <div class="stat-value">${formatCurrency(s.total_revenue)}</div>
          <div class="stat-label">Total Revenue (completed appointments)</div>
        </div>
      </div>
    </div>
  `;
}
