import { getUser } from "../lib/api.js";
import { NAV_BY_ROLE } from "./sidebar.js";

/**
 * Fixed bottom navigation shown only on small screens, where the sidebar is
 * hidden. Surfaces the five most important destinations for the current role;
 * the rest stay reachable from the profile menu / their own pages.
 */
export function renderMobileNav(activePath) {
  const user = getUser();
  const items = (NAV_BY_ROLE[user?.role] || []).slice(0, 5);
  if (!items.length) return "";

  const links = items
    .map(
      (item) => `
      <a href="${item.href}" data-link class="mobile-nav-link ${activePath === item.href ? "active" : ""}">
        <i class="bi ${item.icon}"></i>
        <span>${item.label}</span>
      </a>`
    )
    .join("");

  return `<nav class="mobile-nav" aria-label="Primary">${links}</nav>`;
}
