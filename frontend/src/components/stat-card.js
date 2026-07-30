export function renderStatCard({ icon, label, value, accent = "primary" }) {
  return `
    <div class="col-sm-6 col-lg-3">
      <div class="stat-card">
        <div class="stat-icon text-bg-${accent}"><i class="bi ${icon}"></i></div>
        <div>
          <div class="stat-value">${value}</div>
          <div class="stat-label">${label}</div>
        </div>
      </div>
    </div>
  `;
}

export function renderStatGrid(stats) {
  return `<div class="row g-3">${stats.map(renderStatCard).join("")}</div>`;
}
