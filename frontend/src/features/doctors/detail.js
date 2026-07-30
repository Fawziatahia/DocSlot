import { api, getUser, hasRole } from "../../lib/api.js";
import { formatCurrency, formatDate, formatTime, statusBadgeClass } from "../../lib/format.js";
import { renderStarDisplay } from "../../components/star-rating.js";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function renderDoctorDetail({ id }) {
  const { data: doctor } = await api.get(`/doctors/${id}`);
  const { data: ratings } = doctor.reviews_enabled
    ? await api.get(`/doctors/${id}/ratings`, { per_page: 10 })
    : { data: [] };
  const user = getUser();
  const isOwner = hasRole("doctor") && user && doctor.user.id === user.id;
  const canManage = hasRole("admin") || isOwner;

  const scheduleRows = DAY_NAMES.map((name, dayIndex) => {
    const day = doctor.schedules?.find((s) => s.day_of_week === dayIndex);
    if (!day || !day.is_available) {
      return `<tr><td>${name}</td><td colspan="2" class="text-muted">Not available</td></tr>`;
    }
    return `<tr><td>${name}</td><td>${formatTime(day.start_time)} – ${formatTime(day.end_time)}</td><td>${day.slot_duration} min slots</td></tr>`;
  }).join("");

  const actions = [];
  if (hasRole("patient")) {
    actions.push(`<a href="/appointments/book/${doctor.id}" data-link class="btn btn-primary"><i class="bi bi-calendar-plus me-1"></i>Book Appointment</a>`);
  }
  if (canManage) {
    actions.push(`<a href="/doctors/${doctor.id}/edit" data-link class="btn btn-outline-secondary"><i class="bi bi-pencil me-1"></i>Edit Profile</a>`);
    actions.push(`<a href="/doctors/${doctor.id}/schedule" data-link class="btn btn-outline-secondary"><i class="bi bi-clock me-1"></i>Manage Schedule</a>`);
  }

  return `
    <div class="container py-4">
      <div class="section-card mb-4">
        <div class="row g-4 align-items-center">
          <div class="col-md-8 d-flex gap-3 align-items-center">
            <span class="doctor-avatar doctor-avatar-lg">${doctor.user.name.charAt(0).toUpperCase()}</span>
            <div>
              <h1 class="h4 mb-1">${doctor.user.name}</h1>
              <p class="text-muted mb-1">${doctor.specialization?.name || ""} &middot; ${doctor.department?.name || ""}</p>
              ${hasRole("admin") || hasRole("doctor") ? `<span class="badge ${statusBadgeClass(doctor.status)}">${doctor.status}</span>` : ""}
              ${
                doctor.reviews_enabled
                  ? `<span class="ms-2 small align-middle">${renderStarDisplay(doctor.avg_rating)} ${Number(doctor.avg_rating).toFixed(1)} (${doctor.total_reviews} reviews)</span>`
                  : ""
              }
            </div>
          </div>
          <div class="col-md-4 text-md-end">
            <div class="fs-4 fw-bold">${formatCurrency(doctor.consultation_fee)}</div>
            <div class="text-muted small">per consultation</div>
          </div>
        </div>
        <div class="d-flex flex-wrap gap-2 mt-4">${actions.join("")}</div>
      </div>

      <div class="row g-4">
        <div class="col-lg-7">
          <div class="section-card h-100">
            <h2 class="h5 mb-3">About</h2>
            <p class="mb-3">${doctor.bio || "No bio provided yet."}</p>
            <h3 class="h6">Qualifications</h3>
            <p class="text-muted mb-0">${doctor.qualifications || "Not specified."}</p>
          </div>
        </div>
        <div class="col-lg-5">
          <div class="section-card h-100">
            <h2 class="h5 mb-3">Weekly Schedule</h2>
            <table class="table table-sm mb-0">
              <tbody>${scheduleRows}</tbody>
            </table>
          </div>
        </div>
      </div>

      ${
        doctor.reviews_enabled
          ? `
        <div class="section-card mt-4">
          <h2 class="h5 mb-3">Patient Reviews (${doctor.total_reviews})</h2>
          ${
            ratings.length
              ? ratings
                  .map(
                    (r) => `
                <div class="review-item">
                  <div class="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <div class="fw-semibold">${r.patient?.name || "Anonymous"}</div>
                      ${renderStarDisplay(r.score)}
                    </div>
                    <div class="text-muted small">${formatDate(r.created_at)}</div>
                  </div>
                  ${r.comment ? `<p class="mb-0 mt-2">${r.comment}</p>` : ""}
                </div>
              `
                  )
                  .join("")
              : `<p class="text-muted mb-0">No reviews yet.</p>`
          }
        </div>
      `
          : canManage
            ? `
        <div class="section-card mt-4">
          <p class="text-muted mb-0"><i class="bi bi-eye-slash me-1"></i>Patient reviews are turned off for this profile.</p>
        </div>
      `
            : ""
      }
    </div>
  `;
}
