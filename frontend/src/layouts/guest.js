import { renderGuestNavbar } from "../components/guest-navbar.js";
import logo from "../assets/logo.png";

const FOOTER_COLUMNS = [
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
  {
    heading: "Patients",
    links: [
      { href: "/doctors", label: "Find a Doctor" },
      { href: "/register", label: "Create an Account" },
      { href: "/login", label: "Sign In" },
      { href: "/features", label: "Features" },
    ],
  },
];

export function guestLayout(content) {
  const columns = FOOTER_COLUMNS.map(
    (column) => `
      <div class="col-6 col-md-3">
        <h2 class="footer-heading">${column.heading}</h2>
        <ul class="footer-links">
          ${column.links
            .map((link) => `<li><a href="${link.href}" data-link>${link.label}</a></li>`)
            .join("")}
        </ul>
      </div>`
  ).join("");

  return `
    ${renderGuestNavbar()}
    <main>${content}</main>
    <footer class="site-footer">
      <div class="container">
        <div class="row gy-4">
          <div class="col-md-6 col-lg-5">
            <a href="/" data-link class="footer-brand"><img src="${logo}" alt="DocSlot" width="218" height="180" /></a>
            <p class="footer-blurb">
              Book verified specialists, keep your prescriptions and medical records
              in one place, and skip the phone calls.
            </p>
          </div>
          <div class="col-md-6 col-lg-7">
            <div class="row gy-4">${columns}</div>
          </div>
        </div>
        <div class="footer-base">
          <span>&copy; ${new Date().getFullYear()} DocSlot. All rights reserved.</span>
          <span class="footer-base-links">
            <a href="/privacy" data-link>Privacy</a>
            <a href="/terms" data-link>Terms</a>
          </span>
        </div>
      </div>
    </footer>
  `;
}
