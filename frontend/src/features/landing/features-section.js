const FEATURES = [
  { icon: "bi-calendar-check", title: "Smart Booking", desc: "Book appointments with real-time slot availability. No phone calls needed." },
  { icon: "bi-heart-pulse", title: "Expert Doctors", desc: "Browse verified specialists across every department and specialization." },
  { icon: "bi-capsule", title: "Prescriptions", desc: "Digital prescriptions you can access anytime, shared straight from your doctor." },
  { icon: "bi-file-earmark-medical", title: "Medical Records", desc: "Lab results, imaging, and notes organized in one secure history." },
  { icon: "bi-bell", title: "Notifications", desc: "Stay on top of upcoming appointments and updates in real time." },
  { icon: "bi-graph-up-arrow", title: "Reports & Insights", desc: "Role-aware analytics for admins, doctors, and patients alike." },
];

export function renderFeatures() {
  const cards = FEATURES.map(
    (f) => `
      <div class="col-md-6 col-lg-4">
        <div class="feature-card h-100">
          <div class="feature-icon"><i class="bi ${f.icon}"></i></div>
          <h3>${f.title}</h3>
          <p>${f.desc}</p>
        </div>
      </div>`
  ).join("");

  return `
    <section id="features" class="features-section py-5">
      <div class="container">
        <h2 class="section-title text-center">Everything you need</h2>
        <p class="section-desc text-center">Manage your healthcare journey from start to finish.</p>
        <div class="row g-4 mt-2">${cards}</div>
      </div>
    </section>
  `;
}
