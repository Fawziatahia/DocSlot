import { formatCurrency } from "../../lib/format.js";
import { escapeHtml } from "../../lib/escape.js";

function stars(rating) {
  const rounded = Math.round(rating);
  return Array.from(
    { length: 5 },
    (_, i) => `<i class="bi ${i < rounded ? "bi-star-fill" : "bi-star"}"></i>`
  ).join("");
}

/**
 * Ranked purely on the reviews patients left. The API only returns doctors
 * with at least one review, so an empty list means nobody has been rated yet
 * and the whole section is dropped rather than padded with unrated doctors.
 */
export function renderTopDoctors(doctors = []) {
  if (!doctors.length) return "";

  return `
    <section class="section section-tint">
      <div class="container">
        <header class="section-head">
          <p class="eyebrow eyebrow-dark">Top rated</p>
          <h2 class="section-title">Highest rated by patients</h2>
          <p class="section-lede">Ranked by verified reviews left after real appointments.</p>
        </header>

        <div class="top-doctor-grid">
          ${doctors
            .map((d) => {
              const initials = (d.name || "?")
                .replace(/^Dr\.?\s+/i, "")
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part.charAt(0).toUpperCase())
                .join("");

              const avatar = d.avatar
                ? `<span class="top-doctor-avatar has-photo"><img src="${escapeHtml(d.avatar)}" alt="${escapeHtml(d.name)}" loading="lazy" /></span>`
                : `<span class="top-doctor-avatar">${escapeHtml(initials || "?")}</span>`;

              return `
            <article class="top-doctor-card">
              ${avatar}

              ${
                d.next_available
                  ? `<span class="availability-pill"><span class="availability-dot"></span>Available ${escapeHtml(d.next_available)}</span>`
                  : ""
              }

              <h3 class="top-doctor-name">${escapeHtml(d.name)}</h3>
              <p class="top-doctor-role">${escapeHtml(d.specialization || "Specialist")}</p>

              <p class="top-doctor-rating">
                <span class="top-doctor-stars">${stars(d.avg_rating)}</span>
                <strong>${d.avg_rating.toFixed(1)}</strong>
                <span class="top-doctor-count">(${d.total_reviews})</span>
              </p>

              <ul class="top-doctor-meta">
                <li><i class="bi bi-cash-coin"></i>${formatCurrency(d.consultation_fee)} per visit</li>
                ${d.department ? `<li><i class="bi bi-building"></i>${escapeHtml(d.department)}</li>` : ""}
              </ul>

              <div class="top-doctor-badges">
                ${d.is_verified ? `<span class="badge-soft badge-soft-blue">Verified</span>` : ""}
                ${d.avg_rating >= 4.5 ? `<span class="badge-soft badge-soft-green">Top Rated</span>` : ""}
              </div>

              <a href="/doctors/${encodeURIComponent(d.public_id)}" data-link class="btn btn-primary w-100">Book Appointment</a>
            </article>
          `;
            })
            .join("")}
        </div>
      </div>
    </section>
  `;
}
