export function authLayout(content) {
  return `
    <div class="auth-shell">
      <div class="auth-card">
        <a href="/" data-link class="d-inline-block mb-4 fw-bold fs-4 text-decoration-none" style="color: var(--docslot-primary);">DocSlot</a>
        ${content}
      </div>
    </div>
  `;
}
