import { renderGuestNavbar } from "../components/guest-navbar.js";

export function guestLayout(content) {
  return `
    ${renderGuestNavbar()}
    <main>${content}</main>
    <footer class="guest-footer py-4">
      <div class="container text-center small text-muted">
        &copy; ${new Date().getFullYear()} DocSlot. All rights reserved.
      </div>
    </footer>
  `;
}
