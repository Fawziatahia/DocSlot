import { renderHero } from "./hero.js";
import { renderCta } from "./cta.js";

export function renderLanding() {
  return `
    ${renderHero()}
    ${renderCta()}
  `;
}
