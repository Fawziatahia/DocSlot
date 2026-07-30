import { isAuthenticated } from "../lib/api.js";

export function renderGuestNavbar() {
  const authLinks = isAuthenticated()
    ? `<a href="/dashboard" data-link class="btn btn-primary px-4">Dashboard</a>`
    : `
      <a href="/login" data-link class="btn btn-outline-primary px-4">Sign In</a>
      <a href="/register" data-link class="btn btn-primary px-4">Get Started</a>
    `;

  return `
    <nav class="navbar navbar-expand-lg guest-navbar sticky-top">
      <div class="container">
        <a class="navbar-brand" href="/" data-link>DocSlot</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#guestNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="guestNav">
          <ul class="navbar-nav mx-auto gap-lg-2">
            <li class="nav-item"><a class="nav-link" href="/" data-link>Home</a></li>
            <li class="nav-item"><a class="nav-link" href="/doctors" data-link>Find a Doctor</a></li>
            <li class="nav-item"><a class="nav-link" href="/#features" data-link>Features</a></li>
          </ul>
          <div class="d-flex gap-2 mt-3 mt-lg-0">${authLinks}</div>
        </div>
      </div>
    </nav>
  `;
}
