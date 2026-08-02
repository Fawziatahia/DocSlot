import { api } from "../../lib/api.js";
import { navigate } from "../../lib/router.js";
import { renderHero, renderFinderDoctor } from "./hero.js";
import { renderStats } from "./stats.js";
import { renderTopDoctors } from "./top-doctors.js";
import { renderHowItWorks } from "./how-it-works.js";
import { renderSpecialties } from "./specialties.js";
import { renderTestimonials } from "./testimonials.js";
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

/** Doctors currently loaded into the finder panel, cycled by the shuffle button. */
let finderDoctors = [];

export async function renderLanding() {
  const [stats, specialties, featured, topRated, testimonials] = await Promise.all([
    loadOrNull(api.get("/landing/stats")),
    loadOrNull(api.get("/landing/specialties", { limit: 8 })),
    // The API returns the shortlist already shuffled; keeping a handful lets
    // "Show another" swap instantly without a round trip.
    loadOrNull(api.get("/landing/featured-doctors", { limit: 6 })),
    loadOrNull(api.get("/landing/top-rated-doctors", { limit: 4 })),
    loadOrNull(api.get("/landing/testimonials", { limit: 3 })),
  ]);

  finderDoctors = featured || [];

  return `
    ${renderHero({ specialties: specialties || [], doctors: finderDoctors })}
    ${renderStats(stats)}
    ${renderTopDoctors(topRated || [])}
    ${renderHowItWorks()}
    ${renderSpecialties(specialties || [])}
    ${renderTestimonials(testimonials || [])}
    ${renderCta(stats)}
  `;
}

export function afterLanding() {
  document.getElementById("hero-search")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = new FormData(e.target).get("q")?.toString().trim();
    navigate(query ? `/doctors?q=${encodeURIComponent(query)}` : "/doctors");
  });

  const body = document.getElementById("finder-doctor-body");
  let shown = 0;

  document.getElementById("finder-shuffle")?.addEventListener("click", () => {
    if (finderDoctors.length < 2) return;
    shown = (shown + 1) % finderDoctors.length;
    body.classList.add("is-swapping");
    body.innerHTML = renderFinderDoctor(finderDoctors[shown]);
    // Restart the fade so consecutive clicks each animate.
    requestAnimationFrame(() => body.classList.remove("is-swapping"));
  });
}
