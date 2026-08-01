import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { formatCurrency } from "../../lib/format.js";
import { escapeHtml } from "../../lib/escape.js";

export async function renderReports() {
  const search = new URLSearchParams(window.location.search);
  const from = search.get("from") || "";
  const to = search.get("to") || "";
  const params = { from: from || undefined, to: to || undefined };

  const [appointments, revenue, doctors, patients, prescriptions] = await Promise.all([
    api.get("/reports/appointments", params).then((r) => r.data),
    api.get("/reports/revenue", params).then((r) => r.data),
    api.get("/reports/doctors", params).then((r) => r.data),
    api.get("/reports/patients", params).then((r) => r.data),
    api.get("/reports/prescriptions", params).then((r) => r.data),
  ]);

  const statusRows = Object.entries(appointments.by_status || {})
    .map(([status, count]) => `<tr><td class="text-capitalize">${escapeHtml(status.replace("_", " "))}</td><td>${count}</td></tr>`)
    .join("") || `<tr><td colspan="2" class="text-muted text-center">No data</td></tr>`;

  const doctorRows = (doctors.doctors || [])
    .map((d) => `<tr><td>${escapeHtml(d.doctor_name || "—")}</td><td>${d.total_appointments}</td><td>${d.completed_appointments}</td></tr>`)
    .join("") || `<tr><td colspan="3" class="text-muted text-center">No data</td></tr>`;

  const patientRows = (patients.top_patients || [])
    .map((p) => `<tr><td>${escapeHtml(p.patient_name || "—")}</td><td>${p.total_appointments}</td></tr>`)
    .join("") || `<tr><td colspan="2" class="text-muted text-center">No data</td></tr>`;

  return `
    <h2 class="h4 mb-3">Reports</h2>

    <form id="report-filters" class="row g-2 mb-4">
      <div class="col-sm-4 col-md-3">
        <label class="form-label">From</label>
        <input type="date" class="form-control" name="from" value="${escapeHtml(from)}" />
      </div>
      <div class="col-sm-4 col-md-3">
        <label class="form-label">To</label>
        <input type="date" class="form-control" name="to" value="${escapeHtml(to)}" />
      </div>
      <div class="col-sm-4 col-md-3 d-flex align-items-end">
        <button type="submit" class="btn btn-outline-primary">Apply</button>
      </div>
    </form>

    <div class="row g-3 mb-3">
      <div class="col-sm-6 col-lg-3">
        <div class="stat-card">
          <div class="stat-icon text-bg-primary"><i class="bi bi-calendar-check"></i></div>
          <div><div class="stat-value">${appointments.total_appointments}</div><div class="stat-label">Total Appointments</div></div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3">
        <div class="stat-card">
          <div class="stat-icon text-bg-success"><i class="bi bi-cash-coin"></i></div>
          <div><div class="stat-value">${formatCurrency(revenue.total_revenue)}</div><div class="stat-label">Revenue (${revenue.total_completed_appointments} completed)</div></div>
        </div>
      </div>
      <div class="col-sm-6 col-lg-3">
        <div class="stat-card">
          <div class="stat-icon text-bg-info"><i class="bi bi-capsule"></i></div>
          <div><div class="stat-value">${prescriptions.total_prescriptions}</div><div class="stat-label">Prescriptions</div></div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-4">
        <div class="section-card h-100">
          <h3 class="h6 mb-3">Appointments by Status</h3>
          <table class="table table-sm mb-0"><tbody>${statusRows}</tbody></table>
        </div>
      </div>
      <div class="col-md-4">
        <div class="section-card h-100">
          <h3 class="h6 mb-3">By Doctor</h3>
          <table class="table table-sm mb-0">
            <thead><tr><th>Doctor</th><th>Total</th><th>Completed</th></tr></thead>
            <tbody>${doctorRows}</tbody>
          </table>
        </div>
      </div>
      <div class="col-md-4">
        <div class="section-card h-100">
          <h3 class="h6 mb-3">Top Patients</h3>
          <table class="table table-sm mb-0">
            <thead><tr><th>Patient</th><th>Appointments</th></tr></thead>
            <tbody>${patientRows}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export function afterReports() {
  document.getElementById("report-filters")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const params = new URLSearchParams();
    for (const [key, value] of form.entries()) {
      if (value) params.set(key, value);
    }
    navigate(`/reports?${params.toString()}`);
  });
}
