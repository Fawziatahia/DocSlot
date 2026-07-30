import { api } from "../../lib/api.js";
import { renderStatGrid } from "../../components/stat-card.js";

export async function renderPatientDashboard() {
  const { data: s } = await api.get("/dashboard/patient");

  return renderStatGrid([
    { icon: "bi-calendar-check", label: "Total Appointments", value: s.total_appointments, accent: "primary" },
    { icon: "bi-calendar-event", label: "Upcoming Appointments", value: s.upcoming_appointments, accent: "warning" },
    { icon: "bi-check-circle", label: "Completed Appointments", value: s.completed_appointments, accent: "success" },
    { icon: "bi-capsule", label: "Total Prescriptions", value: s.total_prescriptions, accent: "info" },
  ]);
}
