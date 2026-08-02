import { formatDate } from "../../lib/format.js";
import { escapeHtml } from "../../lib/escape.js";

function stars(score) {
  return Array.from(
    { length: 5 },
    (_, i) => `<i class="bi ${i < score ? "bi-star-fill" : "bi-star"}"></i>`
  ).join("");
}

function initials(name) {
  return (
    (name || "?")
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "?"
  );
}

/**
 * Every quote is a real review row, printed verbatim. Nothing is written for
 * the page — no invented names, cities or copy — so an empty result means the
 * section is omitted rather than filled with placeholders.
 */
export function renderTestimonials(testimonials = []) {
  if (!testimonials.length) return "";

  return `
    <section class="section">
      <div class="container">
        <header class="section-head">
          <p class="eyebrow eyebrow-dark">What patients say</p>
          <h2 class="section-title">Reviews from real appointments</h2>
          <p class="section-lede">
            Only patients who completed an appointment can leave a review, and these are quoted as written.
          </p>
        </header>

        <div class="testimonial-grid">
          ${testimonials
            .map(
              (t) => `
            <figure class="testimonial-card">
              <div class="testimonial-stars" aria-label="${t.score} out of 5">${stars(t.score)}</div>
              <blockquote class="testimonial-quote">${escapeHtml(t.comment)}</blockquote>
              <figcaption class="testimonial-author">
                <span class="testimonial-avatar">${escapeHtml(initials(t.patient_name))}</span>
                <span class="testimonial-author-id">
                  <span class="testimonial-name">${escapeHtml(t.patient_name)}</span>
                  <span class="testimonial-context">
                    on <a href="/doctors/${encodeURIComponent(t.doctor_public_id)}" data-link>${escapeHtml(t.doctor_name)}</a>${
                      t.created_at ? ` &middot; ${formatDate(t.created_at)}` : ""
                    }
                  </span>
                </span>
              </figcaption>
            </figure>
          `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}
