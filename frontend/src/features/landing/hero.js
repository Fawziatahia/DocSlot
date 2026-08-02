import { formatCurrency } from "../../lib/format.js";
import { escapeHtml } from "../../lib/escape.js";

function renderFeaturedDoctor(doctor) {
  if (!doctor) {
    return `<p class="finder-empty">Search the directory to find a specialist.</p>`;
  }

  const initial = (doctor.name || "?").charAt(0).toUpperCase();
  const tags = [doctor.specialization, doctor.department]
    .filter(Boolean)
    .map((tag) => `<span class="finder-tag">${escapeHtml(tag)}</span>`)
    .join("");

  return `
    <article class="finder-doctor">
      <div class="finder-doctor-head">
        <span class="finder-avatar">${escapeHtml(initial)}</span>
        <div class="finder-doctor-id">
          <h3 class="finder-doctor-name">${escapeHtml(doctor.name)}</h3>
          <p class="finder-doctor-role">${escapeHtml(doctor.specialization || "Specialist")}</p>
        </div>
        ${
          doctor.reviews_enabled && doctor.total_reviews > 0
            ? `<span class="finder-rating"><i class="bi bi-star-fill"></i>${Number(doctor.avg_rating).toFixed(1)}</span>`
            : ""
        }
      </div>
      <div class="finder-tags">${tags}</div>
      <dl class="finder-meta">
        <div><dt>Fee</dt><dd>${formatCurrency(doctor.consultation_fee)}</dd></div>
        <div><dt>Reviews</dt><dd>${doctor.total_reviews}</dd></div>
      </dl>
      <div class="finder-actions">
        <a href="/doctors/${encodeURIComponent(doctor.public_id)}" data-link class="btn btn-primary flex-fill">Book Appointment</a>
        <a href="/doctors" data-link class="btn btn-outline-primary">Browse all</a>
      </div>
    </article>
  `;
}

export function renderHero({ specialties = [], featuredDoctor = null } = {}) {
  const chips = specialties
    .slice(0, 5)
    .map(
      (s) => `
        <a href="/doctors?specialization_id=${s.id}" data-link class="finder-chip">${escapeHtml(s.name)}</a>
      `
    )
    .join("");

  return `
    <section class="hero">
      <div class="container">
        <div class="row align-items-center gy-5">
          <div class="col-lg-6">
            <p class="eyebrow">Healthcare, without the hold music</p>
            <h1 class="display-title">
              Your Health,<br />
              <span class="display-title-accent">Scheduled.</span>
            </h1>
            <p class="lede">
              Book with verified specialists in seconds. No waiting rooms,
              no phone calls — just care.
            </p>
            <div class="d-flex flex-wrap gap-3 mt-4">
              <a href="/doctors" data-link class="btn btn-primary btn-lg px-4">Book Appointment</a>
              <a href="/register" data-link class="btn btn-hero-ghost btn-lg px-4">Create Free Account</a>
            </div>
            <ul class="hero-assurances">
              <li><i class="bi bi-check2-circle"></i>Free for patients</li>
              <li><i class="bi bi-check2-circle"></i>Licence-verified doctors</li>
              <li><i class="bi bi-check2-circle"></i>Book any time</li>
            </ul>
          </div>

          <div class="col-lg-6">
            <div class="finder-card">
              <h2 class="finder-title">Find Your Doctor</h2>
              <p class="finder-subtitle">Search by name, specialty or doctor ID</p>

              <form class="finder-search" id="hero-search" role="search" autocomplete="off">
                <i class="bi bi-search"></i>
                <input type="search" name="q" class="form-control" placeholder="Try “Cardiologist” or a doctor's name" aria-label="Search doctors" />
                <button type="submit" class="btn btn-primary">Search</button>
              </form>

              ${chips ? `<div class="finder-chips">${chips}</div>` : ""}
              ${renderFeaturedDoctor(featuredDoctor)}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
