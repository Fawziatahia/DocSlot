import { escapeHtml } from "./escape.js";

/**
 * A lightweight, dependency-free modal used for confirmations and success
 * messages. Lives at document.body level so it survives SPA re-renders, and
 * cleans up after itself. Returns a `close()` function.
 */
export function showModal({
  variant = "success",
  title = "",
  message = "",
  primaryLabel = "OK",
  onPrimary,
  secondaryLabel,
  onSecondary,
} = {}) {
  const icon = { success: "bi-check-lg", info: "bi-info-lg", warning: "bi-exclamation-lg" }[variant] || "bi-check-lg";

  const overlay = document.createElement("div");
  overlay.className = "app-modal-overlay";
  overlay.innerHTML = `
    <div class="app-modal app-modal-${escapeHtml(variant)}" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
      <div class="app-modal-icon"><i class="bi ${icon}"></i></div>
      <h2 class="app-modal-title">${escapeHtml(title)}</h2>
      <p class="app-modal-text">${escapeHtml(message)}</p>
      <div class="app-modal-actions">
        ${secondaryLabel ? `<button type="button" class="btn btn-outline-secondary" data-modal-secondary>${escapeHtml(secondaryLabel)}</button>` : ""}
        <button type="button" class="btn btn-primary" data-modal-primary>${escapeHtml(primaryLabel)}</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("is-open"));

  const close = () => {
    overlay.classList.remove("is-open");
    document.removeEventListener("keydown", onKey);
    setTimeout(() => overlay.remove(), 150);
  };

  const onKey = (e) => {
    if (e.key === "Escape") close();
  };
  document.addEventListener("keydown", onKey);

  overlay.querySelector("[data-modal-primary]").addEventListener("click", () => {
    close();
    onPrimary?.();
  });
  overlay.querySelector("[data-modal-secondary]")?.addEventListener("click", () => {
    close();
    onSecondary?.();
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  overlay.querySelector("[data-modal-primary]").focus();

  return close;
}
