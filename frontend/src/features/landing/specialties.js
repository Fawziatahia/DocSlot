import { escapeHtml } from "../../lib/escape.js";

/** Keyword → icon, so a new specialty added by an admin still gets a sensible glyph. */
const ICONS = [
  [/cardio|heart/i, "bi-heart-pulse"],
  [/neuro|brain/i, "bi-activity"],
  [/derma|skin/i, "bi-droplet"],
  [/ophthal|eye/i, "bi-eye"],
  [/ortho|bone/i, "bi-person-arms-up"],
  [/ent|ear|nose|throat/i, "bi-ear"],
  [/pulmo|lung|chest/i, "bi-lungs"],
  [/paedia|pedia|child/i, "bi-emoji-smile"],
  [/gynae|gyneco|obstet/i, "bi-gender-female"],
  [/dental|dent/i, "bi-emoji-laughing"],
  [/psych|mental/i, "bi-braces"],
  [/medicine|general/i, "bi-clipboard2-pulse"],
];

function iconFor(name) {
  return ICONS.find(([pattern]) => pattern.test(name))?.[1] || "bi-hospital";
}

export function renderSpecialties(specialties = []) {
  if (!specialties.length) return "";

  return `
    <section class="section section-tint">
      <div class="container">
        <header class="section-head">
          <p class="eyebrow eyebrow-dark">Browse by specialty</p>
          <h2 class="section-title">Find the right kind of care</h2>
          <p class="section-lede">Every specialty below has doctors accepting appointments right now.</p>
        </header>

        <div class="specialty-grid">
          ${specialties
            .map(
              (s) => `
            <a href="/doctors?specialization_id=${s.id}" data-link class="specialty-card">
              <span class="specialty-icon"><i class="bi ${iconFor(s.name)}"></i></span>
              <h3 class="specialty-name">${escapeHtml(s.name)}</h3>
              <p class="specialty-count">${s.doctors_count} ${s.doctors_count === 1 ? "doctor" : "doctors"}</p>
              <span class="specialty-cta">Browse <i class="bi bi-arrow-right"></i></span>
            </a>
          `
            )
            .join("")}
        </div>

        <div class="text-center mt-4">
          <a href="/doctors" data-link class="btn btn-outline-primary px-4">See every doctor</a>
        </div>
      </div>
    </section>
  `;
}
