import { formatCurrency } from "../lib/format.js";
import { hasRole } from "../lib/api.js";

export function renderDoctorCard(doctor) {
  const initial = (doctor.user.name || "?").charAt(0).toUpperCase();
  const canSeeStatus = hasRole("admin") || hasRole("doctor");

  return `
    <div class="col-sm-6 col-lg-4">
      <a href="/doctors/${doctor.id}" data-link class="doctor-card text-decoration-none h-100">
        <div class="d-flex align-items-center gap-3 mb-3">
          <span class="doctor-avatar">${initial}</span>
          <div>
            <div class="doctor-name">${doctor.user.name}</div>
            <div class="doctor-specialization">${doctor.specialization?.name || ""}</div>
          </div>
        </div>
        <div class="d-flex justify-content-between align-items-center small text-muted mb-2">
          <span><i class="bi bi-building me-1"></i>${doctor.department?.name || ""}</span>
          ${
            doctor.reviews_enabled
              ? `<span><i class="bi bi-star-fill text-warning me-1"></i>${Number(doctor.avg_rating || 0).toFixed(1)} (${doctor.total_reviews})</span>`
              : ""
          }
        </div>
        <div class="d-flex justify-content-between align-items-center">
          <span class="fw-semibold">${formatCurrency(doctor.consultation_fee)}</span>
          ${
            canSeeStatus
              ? `<span class="badge ${doctor.status === "active" ? "bg-success-subtle text-success-emphasis" : "bg-danger-subtle text-danger-emphasis"}">${doctor.status}</span>`
              : ""
          }
        </div>
      </a>
    </div>
  `;
}
