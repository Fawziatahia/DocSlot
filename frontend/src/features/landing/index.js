import { renderHero } from "./hero.js";
import { renderFeatures } from "./features-section.js";
import { renderCta } from "./cta.js";

export function renderLanding() {
  return `
    ${renderHero()}
    ${renderFeatures()}
    ${renderCta()}
  `;
}
