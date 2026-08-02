const STEPS = [
  {
    icon: "bi-search",
    title: "Search & choose",
    body: "Filter by specialty, department or fee, then read real patient reviews before you decide.",
  },
  {
    icon: "bi-calendar2-week",
    title: "Pick a time slot",
    body: "See the doctor's live availability and take a slot that suits you. No calls, no queueing.",
  },
  {
    icon: "bi-clipboard2-pulse",
    title: "Confirm & get care",
    body: "Get instant confirmation, then keep your prescriptions and records in one place afterwards.",
  },
];

export function renderHowItWorks() {
  return `
    <section class="section">
      <div class="container">
        <header class="section-head">
          <p class="eyebrow eyebrow-dark">How it works</p>
          <h2 class="section-title">Three steps to seeing a doctor</h2>
          <p class="section-lede">From search to confirmed appointment in a couple of minutes.</p>
        </header>

        <ol class="step-grid">
          ${STEPS.map(
            (step, index) => `
            <li class="step-card">
              <span class="step-index">${String(index + 1).padStart(2, "0")}</span>
              <span class="step-icon"><i class="bi ${step.icon}"></i></span>
              <h3 class="step-title">${step.title}</h3>
              <p class="step-body">${step.body}</p>
            </li>
          `
          ).join("")}
        </ol>
      </div>
    </section>
  `;
}
