export function renderCta(stats = null) {
  const lede = stats?.doctors
    ? `Join the patients already booking with ${stats.doctors} verified doctors on DocSlot.`
    : "Create your free account and book your first appointment in minutes.";

  return `
    <section class="cta">
      <div class="container text-center">
        <p class="eyebrow eyebrow-light">Ready when you are</p>
        <h2 class="cta-title">Take control of your healthcare.</h2>
        <p class="cta-lede">${lede}</p>
        <div class="d-flex flex-wrap justify-content-center gap-3">
          <a href="/register" data-link class="btn btn-light btn-lg px-4">Create free account</a>
          <a href="/doctors" data-link class="btn btn-cta-ghost btn-lg px-4">Browse doctors</a>
        </div>
      </div>
    </section>
  `;
}
