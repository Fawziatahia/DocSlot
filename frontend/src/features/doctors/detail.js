import { api, getUser, hasRole, isAuthenticated } from "../../lib/api.js";
import { formatCurrency, formatDate, formatTime, statusBadgeClass } from "../../lib/format.js";
import { renderStarDisplay } from "../../components/star-rating.js";
import { renderBookingPanel, attachBookingPanel } from "../../components/booking-panel.js";
import { escapeHtml } from "../../lib/escape.js";
import { renderAvatar } from "../../lib/avatar.js";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Patients book inline on this page; everyone else gets a prompt or the manage tools. */
function canBook(doctor) {
  return hasRole("patient") && doctor.status === "active";
}

function renderRatingBreakdown(doctor) {
  const breakdown = doctor.rating_breakdown;
  if (!breakdown || !doctor.total_reviews) return "";

  return `
    <div class="rating-bars">
      ${[5, 4, 3, 2, 1]
        .map((score) => {
          const count = breakdown[score] || 0;
          const percent = Math.round((count / doctor.total_reviews) * 100);
          return `
            <div class="rating-bar-row">
              <span class="rating-bar-label">${score}<i class="bi bi-star-fill"></i></span>
              <span class="rating-bar-track"><span class="rating-bar-fill" style="width: ${percent}%"></span></span>
              <span class="rating-bar-value">${percent}%</span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderReviews(doctor, ratings) {
  if (!ratings.length) return `<p class="text-muted mb-0">No reviews yet.</p>`;

  return ratings
    .map(
      (r) => `
        <div class="review-item">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <div>
              <div class="fw-semibold">${r.patient?.name ? escapeHtml(r.patient.name) : "Anonymous"}</div>
              ${renderStarDisplay(r.score)}
            </div>
            <div class="text-muted small">${formatDate(r.created_at)}</div>
          </div>
          ${r.comment ? `<p class="mb-0 mt-2">${escapeHtml(r.comment)}</p>` : ""}
        </div>
      `
    )
    .join("");
}

/**
 * Everything the API will disclose about a doctor, for the two viewers allowed
 * to see it: an admin, or the doctor looking at their own record. Regulators
 * expect the licence and contact details to be inspectable, so nothing the
 * backend sends is held back here.
 */
function renderAdminDetails(doctor) {
  const rows = [
    ["Medical License No.", doctor.license_number ? `<code>${escapeHtml(doctor.license_number)}</code>` : "—"],
    ["Doctor ID", doctor.public_id ? `<code>${escapeHtml(doctor.public_id)}</code>` : "—"],
    ["Email", doctor.user.email ? escapeHtml(doctor.user.email) : "—"],
    ["Phone", doctor.user.phone ? escapeHtml(doctor.user.phone) : "—"],
    ["Specialization", escapeHtml(doctor.specialization?.name || "—")],
    ["Department", escapeHtml(doctor.department?.name || "—")],
    ["Qualifications", escapeHtml(doctor.qualifications || "—")],
    ["Consultation fee", formatCurrency(doctor.consultation_fee)],
    [
      "Profile status",
      `<span class="badge ${statusBadgeClass(doctor.status)}">${escapeHtml(doctor.status)}</span>`,
    ],
    [
      "Login access",
      doctor.user.is_active
        ? `<span class="badge bg-success-subtle text-success-emphasis">Active</span>`
        : `<span class="badge bg-danger-subtle text-danger-emphasis">Deactivated</span>`,
    ],
    ["Patient reviews", doctor.reviews_enabled ? "Enabled" : "Disabled"],
    ["Average rating", `${Number(doctor.avg_rating).toFixed(1)} from ${doctor.total_reviews} review${doctor.total_reviews === 1 ? "" : "s"}`],
    ["Last login", doctor.user.last_login_at ? formatDate(doctor.user.last_login_at) : "Never"],
    ["Registered", doctor.created_at ? formatDate(doctor.created_at) : "—"],
  ];

  return `
    <div class="section-card admin-details mt-4">
      <div class="d-flex align-items-center gap-2 mb-3">
        <i class="bi bi-shield-lock text-primary"></i>
        <h2 class="h6 mb-0">Administrative Details</h2>
        <span class="badge bg-secondary-subtle text-secondary-emphasis ms-auto">Staff only</span>
      </div>
      <dl class="admin-details-grid mb-0">
        ${rows.map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`).join("")}
      </dl>
    </div>
  `;
}

function renderWeeklySchedule(doctor) {
  const rows = DAY_NAMES.map((name, dayIndex) => {
    const day = doctor.schedules?.find((s) => s.day_of_week === dayIndex);
    if (!day || !day.is_available) {
      return `<tr><td>${name}</td><td class="text-muted">Not available</td></tr>`;
    }
    return `<tr><td>${name}</td><td>${formatTime(day.start_time)} – ${formatTime(day.end_time)}</td></tr>`;
  }).join("");

  return `
    <div class="section-card">
      <h2 class="h5 mb-3">Weekly Schedule</h2>
      <table class="table schedule-table mb-0">
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

export async function renderDoctorDetail({ id }) {
  const { data: doctor } = await api.get(`/doctors/${id}`);
  const bookable = canBook(doctor);

  const [{ data: ratings }, { data: bookingSettings }] = await Promise.all([
    doctor.reviews_enabled ? api.get(`/doctors/${id}/ratings`, { per_page: 10 }) : { data: [] },
    bookable ? api.get("/booking-settings") : { data: null },
  ]);

  const user = getUser();
  const isOwner = hasRole("doctor") && user && doctor.user.id === user.id;
  const canManage = hasRole("admin") || isOwner;

  const actions = [];
  if (bookable) {
    actions.push(`<a href="#book-panel" class="btn btn-primary" data-scroll-to="book-panel"><i class="bi bi-calendar-plus me-1"></i>Book Now</a>`);
  }
  if (canManage) {
    actions.push(`<a href="/doctors/${doctor.public_id}/edit" data-link class="btn btn-outline-secondary"><i class="bi bi-pencil me-1"></i>Edit Profile</a>`);
    actions.push(`<a href="/doctors/${doctor.public_id}/schedule" data-link class="btn btn-outline-secondary"><i class="bi bi-clock me-1"></i>Manage Schedule</a>`);
  }

  const tags = [doctor.specialization?.name, doctor.department?.name]
    .filter(Boolean)
    .map((tag) => `<span class="doctor-tag">${escapeHtml(tag)}</span>`)
    .join("");

  let bookingAside = "";
  if (bookable) {
    bookingAside = renderBookingPanel(doctor, bookingSettings);
  } else if (doctor.status !== "active") {
    bookingAside = `
      <div class="section-card">
        <h2 class="h6 mb-1">Book Appointment</h2>
        <p class="text-muted small mb-0">This doctor isn't accepting appointments right now.</p>
      </div>
    `;
  } else if (!isAuthenticated()) {
    bookingAside = `
      <div class="section-card text-center">
        <h2 class="h6 mb-1">Book Appointment</h2>
        <p class="text-muted small mb-3">Sign in to your patient account to pick a date and time.</p>
        <a href="/login" data-link class="btn btn-primary w-100 mb-2">Sign In to Book</a>
        <a href="/register" data-link class="btn btn-outline-primary w-100">Create an Account</a>
      </div>
    `;
  }

  return `
    <div class="container py-4 doctor-profile">
      <a href="/doctors" data-link class="doctor-back"><i class="bi bi-arrow-left"></i>Back to all doctors</a>

      <div class="section-card doctor-hero mt-3">
        <div class="d-flex flex-wrap gap-4 justify-content-between align-items-start">
          <div class="d-flex gap-3 align-items-start">
            ${renderAvatar(doctor.user, "doctor-avatar-lg")}
            <div>
              <h1 class="h4 mb-1">${escapeHtml(doctor.user.name)}</h1>
              <p class="text-muted mb-2">
                ${escapeHtml(doctor.specialization?.name || "")}
                ${doctor.department?.name ? `&middot; ${escapeHtml(doctor.department.name)}` : ""}
              </p>
              ${
                doctor.reviews_enabled
                  ? `<div class="doctor-rating">${renderStarDisplay(doctor.avg_rating)}
                       <strong>${Number(doctor.avg_rating).toFixed(1)}</strong>
                       <span class="text-muted small">(${doctor.total_reviews} reviews)</span>
                     </div>`
                  : ""
              }
              <div class="doctor-tags mt-2">${tags}</div>
              ${doctor.public_id ? `<p class="text-muted small mb-0 mt-2">Doctor ID: <code>${escapeHtml(doctor.public_id)}</code></p>` : ""}
              ${
                canManage
                  ? `<span class="badge ${statusBadgeClass(doctor.status)} mt-2">${escapeHtml(doctor.status)}</span>`
                  : ""
              }
            </div>
          </div>
          <div class="doctor-hero-side">
            <div class="fs-4 fw-bold">${formatCurrency(doctor.consultation_fee)}</div>
            <div class="text-muted small mb-3">per consultation</div>
            <div class="d-flex flex-wrap gap-2">${actions.join("")}</div>
          </div>
        </div>
      </div>

      <div class="row g-4 mt-0">
        <div class="col-lg-7 col-xl-8">
          <div class="section-card">
            <h2 class="h5 mb-3">About ${escapeHtml(doctor.user.name)}</h2>
            <p class="mb-3">${doctor.bio ? escapeHtml(doctor.bio) : "No bio provided yet."}</p>
            <h3 class="h6">Qualifications</h3>
            <p class="text-muted mb-0">${doctor.qualifications ? escapeHtml(doctor.qualifications) : "Not specified."}</p>
          </div>

          ${canManage ? renderAdminDetails(doctor) : ""}

          ${
            doctor.reviews_enabled
              ? `
            <div class="section-card mt-4">
              <h2 class="h5 mb-3">Patient Reviews</h2>
              ${
                doctor.total_reviews
                  ? `
                <div class="rating-overview">
                  <div class="rating-score">
                    <div class="rating-score-value">${Number(doctor.avg_rating).toFixed(1)}</div>
                    ${renderStarDisplay(doctor.avg_rating)}
                    <div class="text-muted small mt-1">Based on ${doctor.total_reviews} review${doctor.total_reviews === 1 ? "" : "s"}</div>
                  </div>
                  ${renderRatingBreakdown(doctor)}
                </div>
              `
                  : ""
              }
              ${renderReviews(doctor, ratings)}
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

        <div class="col-lg-5 col-xl-4">
          <div class="doctor-aside" id="book-panel">
            ${renderWeeklySchedule(doctor)}
            ${bookingAside}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function afterDoctorDetail({ id }) {
  attachBookingPanel(id);

  document.querySelector("[data-scroll-to]")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("book-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
