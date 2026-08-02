import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { renderHero } from "./hero.js";
import { renderStats } from "./stats.js";
import { renderHowItWorks } from "./how-it-works.js";
import { renderSpecialties } from "./specialties.js";
import { renderCta } from "./cta.js";

/**
 * The landing page is the one page that must never fail to render, so each
 * data-backed section degrades to nothing if its request fails rather than
 * taking the whole page down with it.
 */
async function loadOrNull(request) {
  try {
    const { data } = await request;
    return data;
  } catch {
    return null;
  }
}

export async function renderLanding() {
  const [stats, specialties, featured] = await Promise.all([
    loadOrNull(api.get("/landing/stats")),
    loadOrNull(api.get("/landing/specialties", { limit: 8 })),
    loadOrNull(api.get("/landing/featured-doctors", { limit: 1 })),
  ]);

  return `
    ${renderHero({ specialties: specialties || [], featuredDoctor: featured?.[0] || null })}
    ${renderStats(stats)}
    ${renderHowItWorks()}
    ${renderSpecialties(specialties || [])}
    ${renderCta(stats)}
  `;
}

export function afterLanding() {
  document.getElementById("hero-search")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = new FormData(e.target).get("q")?.toString().trim();
    navigate(query ? `/doctors?q=${encodeURIComponent(query)}` : "/doctors");
  });
}
