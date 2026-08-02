import { escapeHtml } from "../lib/escape.js";
import logo from "../assets/logo.png";

function renderBrand(className = "") {
  return `
    <a href="/" data-link class="auth-brand ${className}">
      <img src="${logo}" alt="DocSlot Health Care" />
    </a>
  `;
}

/**
 * @param {string} content page markup
 * @param {object} [options]
 * @param {{title: string, subtitle?: string, points?: string[]}} [options.panel]
 *   when provided, renders the two-column split layout with a branded side panel
 */
export function authLayout(content, options = {}) {
  const { panel } = options;

  if (!panel) {
    return `
      <div class="auth-shell">
        <div class="auth-card">
          ${renderBrand("mb-4")}
          ${content}
        </div>
      </div>
    `;
  }

  const points = (panel.points || [])
    .map(
      (point) => `
        <li><i class="bi bi-check2"></i><span>${escapeHtml(point)}</span></li>
      `
    )
    .join("");

  return `
    <div class="auth-shell auth-shell-split">
      <div class="auth-split">
        <aside class="auth-panel">
          ${renderBrand("auth-brand-light")}
          <div class="auth-panel-body">
            <h2 class="auth-panel-title">${escapeHtml(panel.title)}</h2>
            ${panel.subtitle ? `<p class="auth-panel-subtitle">${escapeHtml(panel.subtitle)}</p>` : ""}
            ${points ? `<ul class="auth-panel-points">${points}</ul>` : ""}
          </div>
          <span class="auth-panel-blob" aria-hidden="true"></span>
        </aside>
        <div class="auth-card auth-card-split">
          ${content}
        </div>
      </div>
    </div>
  `;
}
