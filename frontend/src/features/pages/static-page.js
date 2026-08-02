import { escapeHtml } from "../../lib/escape.js";

/**
 * Shared shell for the small content pages (About, Contact, Privacy, Terms).
 *
 * `sections` entries are `{ heading, body }` where `body` is trusted markup
 * authored in this repo — never user input.
 */
export function renderStaticPage({ eyebrow, title, lede, sections = [], footnote = "" }) {
  return `
    <article class="static-page">
      <header class="static-hero">
        <div class="container">
          ${eyebrow ? `<p class="eyebrow eyebrow-light">${escapeHtml(eyebrow)}</p>` : ""}
          <h1 class="static-title">${escapeHtml(title)}</h1>
          ${lede ? `<p class="static-lede">${escapeHtml(lede)}</p>` : ""}
        </div>
      </header>

      <div class="container">
        <div class="static-body">
          ${sections
            .map(
              (section) => `
            <section class="static-section">
              ${section.heading ? `<h2 class="static-heading">${escapeHtml(section.heading)}</h2>` : ""}
              ${section.body}
            </section>
          `
            )
            .join("")}
          ${footnote ? `<p class="static-footnote">${footnote}</p>` : ""}
        </div>
      </div>
    </article>
  `;
}
