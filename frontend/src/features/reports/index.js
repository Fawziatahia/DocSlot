import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { formatCurrency } from "../../lib/format.js";
import { escapeHtml } from "../../lib/escape.js";
import { renderStatGrid } from "../../components/stat-card.js";

const STATUS_META = {
  pending: { label: "Pending", badge: "bg-warning-subtle text-warning-emphasis", bar: "#f59e0b" },
  confirmed: { label: "Confirmed", badge: "bg-info-subtle text-info-emphasis", bar: "#0891b2" },
  in_progress: { label: "In Progress", badge: "bg-primary-subtle text-primary-emphasis", bar: "#2563eb" },
  completed: { label: "Completed", badge: "bg-success-subtle text-success-emphasis", bar: "#16a34a" },
  cancelled: { label: "Cancelled", badge: "bg-danger-subtle text-danger-emphasis", bar: "#dc2626" },
};

const PRESETS = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" },
  { key: "all", label: "All Time" },
];

function toISO(date) {
  return date.toISOString().slice(0, 10);
}

function presetRange(key) {
  const now = new Date();
  const today = toISO(now);
  switch (key) {
    case "today":
      return { from: today, to: today };
    case "7d": {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      return { from: toISO(start), to: today };
    }
    case "30d": {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      return { from: toISO(start), to: today };
    }
    case "month":
      return { from: toISO(new Date(now.getFullYear(), now.getMonth(), 1)), to: today };
    case "year":
      return { from: toISO(new Date(now.getFullYear(), 0, 1)), to: today };
    case "all":
    default:
      return { from: "", to: "" };
  }
}

function statusMeta(status) {
  return STATUS_META[status] || { label: status.replace("_", " "), badge: "bg-secondary-subtle text-secondary-emphasis", bar: "#94a3b8" };
}

function renderStatusBreakdown(byStatus, total) {
  const entries = Object.entries(byStatus || {});
  if (!entries.length) {
    return `<p class="text-muted text-center mb-0 py-4">No appointments in this period.</p>`;
  }

  return `
    <div class="report-bars">
      ${entries
        .map(([status, count]) => {
          const meta = statusMeta(status);
          const percent = total ? Math.round((count / total) * 100) : 0;
          return `
            <div class="report-bar-row">
              <span class="badge ${meta.badge} report-bar-label text-capitalize">${escapeHtml(meta.label)}</span>
              <span class="report-bar-track"><span class="report-bar-fill" style="width: ${percent}%; background: ${meta.bar};"></span></span>
              <span class="report-bar-value">${count} <span class="text-muted fw-normal">(${percent}%)</span></span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderDoctorTable(doctors) {
  if (!doctors.length) {
    return `<p class="text-muted text-center mb-0 py-4">No appointments in this period.</p>`;
  }

  const sorted = [...doctors].sort((a, b) => b.total_appointments - a.total_appointments);

  return `
    <div class="table-responsive">
      <table class="table align-middle mb-0">
        <thead>
          <tr>
            <th>Doctor</th>
            <th class="text-end">Total</th>
            <th>Completion</th>
          </tr>
        </thead>
        <tbody>
          ${sorted
            .map((d) => {
              const rate = d.total_appointments ? Math.round((d.completed_appointments / d.total_appointments) * 100) : 0;
              return `
                <tr>
                  <td>${escapeHtml(d.doctor_name || "—")}</td>
                  <td class="text-end fw-semibold">${d.total_appointments}</td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <span class="report-bar-track report-bar-track--sm"><span class="report-bar-fill" style="width: ${rate}%; background: #16a34a;"></span></span>
                      <span class="text-muted small" style="width: 2.5rem;">${rate}%</span>
                    </div>
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderPatientList(patients) {
  if (!patients.length) {
    return `<p class="text-muted text-center mb-0 py-4">No appointments in this period.</p>`;
  }

  const max = Math.max(...patients.map((p) => p.total_appointments));

  return `
    <div class="report-bars">
      ${patients
        .slice(0, 10)
        .map(
          (p, i) => `
            <div class="report-bar-row">
              <span class="report-rank">${i + 1}</span>
              <span class="report-patient-name">${escapeHtml(p.patient_name || "—")}</span>
              <span class="report-bar-track"><span class="report-bar-fill" style="width: ${Math.round((p.total_appointments / max) * 100)}%; background: var(--docslot-primary);"></span></span>
              <span class="report-bar-value">${p.total_appointments}</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

export async function renderReports() {
  const search = new URLSearchParams(window.location.search);
  const from = search.get("from") || "";
  const to = search.get("to") || "";
  const params = { from: from || undefined, to: to || undefined };

  const activePreset = PRESETS.find((p) => {
    const range = presetRange(p.key);
    return range.from === from && range.to === to;
  });

  const [appointments, revenue, doctors, patients, prescriptions] = await Promise.all([
    api.get("/reports/appointments", params).then((r) => r.data),
    api.get("/reports/revenue", params).then((r) => r.data),
    api.get("/reports/doctors", params).then((r) => r.data),
    api.get("/reports/patients", params).then((r) => r.data),
    api.get("/reports/prescriptions", params).then((r) => r.data),
  ]);

  const total = appointments.total_appointments || 0;
  const completed = (appointments.by_status || {}).completed || 0;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  return `
    <div class="reports-header mb-4">
      <div>
        <h1 class="h4 mb-1">Reports</h1>
        <p class="text-muted mb-0 small">Appointments, revenue, and activity across the platform${from || to ? ` &middot; ${escapeHtml(from || "…")} to ${escapeHtml(to || "…")}` : ""}.</p>
      </div>
    </div>

    <div class="section-card mb-4">
      <form id="report-filters" class="d-flex flex-wrap align-items-end gap-3">
        <div class="d-flex flex-wrap gap-2" id="report-presets">
          ${PRESETS.map(
            (p) => `<button type="button" class="btn btn-sm report-preset-btn ${activePreset?.key === p.key ? "active" : "btn-outline-secondary"}" data-preset="${p.key}">${p.label}</button>`
          ).join("")}
        </div>
        <div class="vr d-none d-md-block"></div>
        <div>
          <label class="form-label small mb-1">From</label>
          <input type="date" class="form-control form-control-sm" name="from" value="${escapeHtml(from)}" />
        </div>
        <div>
          <label class="form-label small mb-1">To</label>
          <input type="date" class="form-control form-control-sm" name="to" value="${escapeHtml(to)}" />
        </div>
        <button type="submit" class="btn btn-sm btn-primary">Apply</button>
        ${from || to ? `<a href="/reports" data-link class="btn btn-sm btn-link text-muted">Clear</a>` : ""}
      </form>
    </div>

    ${renderStatGrid([
      { icon: "bi-calendar-check", label: "Total Appointments", value: total, accent: "primary" },
      { icon: "bi-check-circle", label: `Completed (${completionRate}%)`, value: completed, accent: "success" },
      { icon: "bi-cash-coin", label: "Revenue", value: formatCurrency(revenue.total_revenue), accent: "success" },
      { icon: "bi-capsule", label: "Prescriptions", value: prescriptions.total_prescriptions, accent: "info" },
    ])}

    <div class="row g-3 mt-1">
      <div class="col-lg-5">
        <div class="section-card h-100">
          <h2 class="h6 mb-3">Appointments by Status</h2>
          ${renderStatusBreakdown(appointments.by_status, total)}
        </div>
      </div>
      <div class="col-lg-4">
        <div class="section-card h-100">
          <h2 class="h6 mb-3">By Doctor</h2>
          ${renderDoctorTable(doctors.doctors || [])}
        </div>
      </div>
      <div class="col-lg-3">
        <div class="section-card h-100">
          <h2 class="h6 mb-3">Top Patients</h2>
          ${renderPatientList(patients.top_patients || [])}
        </div>
      </div>
    </div>
  `;
}

export function afterReports() {
  const form = document.getElementById("report-filters");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const params = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      if (value) params.set(key, value);
    }
    navigate(`/reports?${params.toString()}`);
  });

  document.getElementById("report-presets")?.addEventListener("click", (e) => {
    const button = e.target.closest("[data-preset]");
    if (!button) return;
    const { from, to } = presetRange(button.dataset.preset);
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    navigate(`/reports?${params.toString()}`);
  });
}
