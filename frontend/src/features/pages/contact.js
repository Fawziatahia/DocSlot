import { renderStaticPage } from "./static-page.js";
import { SITE_INFO } from "./site-info.js";
import { escapeHtml } from "../../lib/escape.js";

function contactChannels() {
  const rows = [];

  if (SITE_INFO.supportEmail) {
    rows.push(`
      <li>
        <i class="bi bi-envelope"></i>
        <span><span class="contact-label">Email</span>
        <a href="mailto:${escapeHtml(SITE_INFO.supportEmail)}">${escapeHtml(SITE_INFO.supportEmail)}</a></span>
      </li>`);
  }

  if (SITE_INFO.supportPhone) {
    rows.push(`
      <li>
        <i class="bi bi-telephone"></i>
        <span><span class="contact-label">Phone</span>
        <a href="tel:${escapeHtml(SITE_INFO.supportPhone.replace(/\s+/g, ""))}">${escapeHtml(SITE_INFO.supportPhone)}</a></span>
      </li>`);
  }

  if (SITE_INFO.address) {
    rows.push(`
      <li>
        <i class="bi bi-geo-alt"></i>
        <span><span class="contact-label">Address</span>${escapeHtml(SITE_INFO.address)}</span>
      </li>`);
  }

  if (!rows.length) {
    return `
      <div class="alert alert-warning mb-0">
        <strong>Support contact details are not set yet.</strong>
        Add them in <code>src/features/pages/site-info.js</code> and they will appear here.
      </div>`;
  }

  return `<ul class="contact-list">${rows.join("")}</ul>`;
}

export function renderContactPage() {
  return renderStaticPage({
    eyebrow: "Contact",
    title: "Get in touch",
    lede: "Questions about an appointment, your account, or a doctor listing.",
    sections: [
      {
        heading: "Support",
        body: `
          ${contactChannels()}
          <p class="mt-3">We aim to reply ${escapeHtml(SITE_INFO.responseTime)}.</p>
        `,
      },
      {
        heading: "Faster ways to resolve common things",
        body: `
          <ul>
            <li><strong>Change or cancel an appointment</strong> — open it from <a href="/appointments" data-link>My Appointments</a>; you can reschedule or cancel there up to the cut-off your clinic has set.</li>
            <li><strong>Forgotten password</strong> — use <a href="/forgot-password" data-link>password reset</a> to get a one-time code by email.</li>
            <li><strong>Prescriptions and records</strong> — these live under <a href="/prescriptions" data-link>Prescriptions</a> and <a href="/medical-records" data-link>Medical Records</a> once your doctor has issued them.</li>
            <li><strong>Something wrong on a doctor's profile</strong> — tell us which doctor and what's incorrect, and an administrator will check it against their licence record.</li>
          </ul>
        `,
      },
      {
        heading: "Medical emergencies",
        body: `
          <p class="contact-urgent">
            <i class="bi bi-exclamation-triangle-fill"></i>
            DocSlot is a booking platform, not an emergency service, and nobody monitors it around the clock.
            If you need urgent medical help, contact your local emergency number or go to the nearest hospital.
          </p>
        `,
      },
    ],
  });
}
