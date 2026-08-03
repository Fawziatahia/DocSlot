import { escapeHtml } from "./escape.js";

/**
 * Render a person's avatar: their uploaded photo when present, otherwise a
 * coloured circle with their initial. `extraClass` adds size/variant modifiers
 * (e.g. "doctor-avatar-lg").
 */
export function renderAvatar(user, extraClass = "") {
  const cls = `doctor-avatar${extraClass ? ` ${extraClass}` : ""}`;
  const name = user?.name || "";

  if (user?.avatar) {
    return `<span class="${cls} has-photo"><img src="${escapeHtml(user.avatar)}" alt="${escapeHtml(name)}" loading="lazy" /></span>`;
  }

  const initial = (name || "?").charAt(0).toUpperCase();
  return `<span class="${cls}">${escapeHtml(initial)}</span>`;
}
