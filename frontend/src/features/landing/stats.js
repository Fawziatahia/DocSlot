import { escapeHtml } from "../../lib/escape.js";

/**
 * Numbers are printed exactly as the database reports them — no rounding up
 * to a friendlier-looking figure. A stat with nothing behind it is dropped
 * rather than shown as a zero.
 */
export function renderStats(stats) {
  if (!stats) return "";

  const tiles = [
    { value: stats.doctors, label: "Verified doctors" },
    { value: stats.specialties, label: "Specialties" },
    { value: stats.appointments, label: "Appointments booked" },
    stats.average_rating
      ? { value: `${stats.average_rating.toFixed(1)}★`, label: `Average of ${stats.reviews} reviews` }
      : { value: stats.patients, label: "Registered patients" },
  ].filter((tile) => tile.value !== null && tile.value !== undefined && tile.value !== 0);

  if (!tiles.length) return "";

  return `
    <section class="stat-band">
      <div class="container">
        <dl class="stat-band-grid">
          ${tiles
            .map(
              (tile) => `
            <div class="stat-tile">
              <dt class="stat-figure">${escapeHtml(tile.value)}</dt>
              <dd class="stat-caption">${escapeHtml(tile.label)}</dd>
            </div>
          `
            )
            .join("")}
        </dl>
      </div>
    </section>
  `;
}
