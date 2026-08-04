import { escapeHtml } from "../lib/escape.js";
import logo from "../assets/logo.png";

function renderBrand(className = "") {
  return `
    <a href="/" data-link class="auth-brand ${className}">
      <img src="${logo}" alt="DocSlot Health Care" width="218" height="180" />
    </a>
  `;
}

/** Way out of the auth flow, back to the public landing page. */
function renderHomeLink() {
  return `
    <a href="/" data-link class="auth-home">
      <i class="bi bi-house-door"></i><span>Home</span>
    </a>
  `;
}

/**
 * @param {string} content page markup
 * @param {object} [options]
 * @param {{title: string, subtitle?: string, points?: string[]}} [options.panel]
 *   when provided, renders the two-column split layout with a branded side panel
 * @param {boolean} [options.framed] draw the form as a bordered card centred in
 *   the panel rather than filling it — suits short forms like sign-in
 */
export function authLayout(content, options = {}) {
  const { panel, framed = false } = options;

  if (!panel) {
    return `
      <div class="auth-shell">
        <div class="auth-card">
          <div class="d-flex justify-content-between align-items-start gap-3 mb-4">
            ${renderBrand()}
            ${renderHomeLink()}
          </div>
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
        <div class="auth-card auth-card-split ${framed ? "auth-card-framed" : ""}">
          <div class="auth-card-top">${renderHomeLink()}</div>
          <div class="auth-card-inner">${content}</div>
        </div>
      </div>
    </div>
  `;
}
