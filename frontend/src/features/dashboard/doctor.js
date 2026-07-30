import { api } from "../../lib/api.js";
import { renderStatGrid } from "../../components/stat-card.js";

export async function renderDoctorDashboard() {
  const { data: s } = await api.get("/dashboard/doctor");

  return renderStatGrid([
    { icon: "bi-calendar-check", label: "Total Appointments", value: s.total_appointments, accent: "primary" },
    { icon: "bi-calendar-day", label: "Today's Appointments", value: s.today_appointments, accent: "warning" },
    { icon: "bi-hourglass-split", label: "Pending Appointments", value: s.pending_appointments, accent: "warning" },
    { icon: "bi-check-circle", label: "Completed Appointments", value: s.completed_appointments, accent: "success" },
    { icon: "bi-capsule", label: "Total Prescriptions", value: s.total_prescriptions, accent: "info" },
  ]);
}
