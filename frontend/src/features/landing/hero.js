export function renderHero() {
  return `
    <section class="hero-section">
      <div class="container">
        <div class="row align-items-center gy-5">
          <div class="col-lg-6">
            <span class="badge rounded-pill hero-badge mb-3">Healthcare Management Platform</span>
            <h1 class="hero-title">Your Health,<br /><span class="text-gradient">Simplified.</span></h1>
            <p class="hero-subtitle">
              Book appointments with top doctors, manage prescriptions,
              access medical records — all in one place.
            </p>
            <div class="d-flex flex-wrap gap-3 mt-4">
              <a href="/register" class="btn btn-primary btn-lg px-4">Get Started</a>
              <a href="/login" class="btn btn-outline-primary btn-lg px-4">Sign In</a>
            </div>
            <div class="d-flex flex-wrap gap-4 mt-5 hero-stats">
              <div>
                <div class="hero-stat-value">6+</div>
                <div class="hero-stat-label">Specialists</div>
              </div>
              <div>
                <div class="hero-stat-value">8+</div>
                <div class="hero-stat-label">Departments</div>
              </div>
              <div>
                <div class="hero-stat-value">24/7</div>
                <div class="hero-stat-label">Access</div>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="hero-visual">
              <div class="illo-card illo-card-1">
                <span class="illo-icon"><i class="bi bi-calendar-check"></i></span>
                <span>Book Appointment</span>
              </div>
              <div class="illo-card illo-card-2">
                <span class="illo-icon"><i class="bi bi-heart-pulse"></i></span>
                <span>Find a Doctor</span>
              </div>
              <div class="illo-card illo-card-3">
                <span class="illo-icon"><i class="bi bi-capsule"></i></span>
                <span>Get Prescription</span>
              </div>
              <div class="illo-circle"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
