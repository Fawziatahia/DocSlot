import { renderStaticPage } from "./static-page.js";
import { POLICY_UPDATED } from "./site-info.js";

const REVIEW_NOTICE = `
  <div class="alert alert-warning">
    <strong>Draft — needs legal review.</strong>
    These terms describe how the DocSlot software actually behaves. They were written by the
    engineering team, not by a lawyer, and the governing-law and liability sections in particular
    need professional input before you rely on them.
  </div>
`;

export function renderTermsPage() {
  return renderStaticPage({
    eyebrow: "Terms",
    title: "Terms of Service",
    lede: `The rules for using DocSlot. Last updated ${POLICY_UPDATED}.`,
    sections: [
      { body: REVIEW_NOTICE },
      {
        heading: "What DocSlot is",
        body: `
          <p>
            DocSlot is a booking and records platform. It connects you with doctors and keeps your
            appointments, prescriptions and medical records in one place.
          </p>
          <p class="contact-urgent">
            <i class="bi bi-exclamation-triangle-fill"></i>
            DocSlot does not provide medical advice, diagnosis or treatment, and it is not an
            emergency service. Any clinical advice comes from the doctor you see, and is their
            responsibility, not ours. In an emergency, contact your local emergency number.
          </p>
        `,
      },
      {
        heading: "Your account",
        body: `
          <ul>
            <li>Register with accurate details — your name, contact details and date of birth are used to identify you on clinical records.</li>
            <li>Keep your password to yourself. Anything done by a signed-in session is treated as done by you.</li>
            <li>One account per person. Do not book on someone else's behalf using your own account, as the appointment and any resulting records will be filed under your name.</li>
            <li>Doctor accounts are created by administrators only. You cannot register as a doctor through the public sign-up form.</li>
          </ul>
        `,
      },
      {
        heading: "Booking, changing and cancelling",
        body: `
          <ul>
            <li>Slots reflect a doctor's published availability. Booking one reserves it immediately.</li>
            <li>Your clinic sets how far ahead you must book and how late you may cancel or reschedule. The exact cut-off is shown on the booking panel and enforced when you try.</li>
            <li>Repeatedly failing to attend booked appointments may lead to your account being restricted.</li>
            <li>A doctor or administrator may cancel an appointment — for illness or emergencies, for example. You will be notified in the app and by email.</li>
          </ul>
        `,
      },
      {
        heading: "Fees and payment",
        body: `
          <p>
            The consultation fee shown on a doctor's profile is set by that doctor and is displayed
            for information. <strong>DocSlot does not take payment.</strong> There is no payment
            processing in the platform — you settle the fee directly with the doctor or clinic, by
            whatever means they accept. Any dispute about a fee is between you and them.
          </p>
        `,
      },
      {
        heading: "Reviews",
        body: `
          <ul>
            <li>You can review a doctor only after an appointment with them is completed, and only once per appointment.</li>
            <li>Reviews are public: your name, score and comment appear on the doctor's profile and may appear on our home page.</li>
            <li>Write about your own experience. Reviews that are abusive, defamatory, or that disclose someone else's medical information may be removed.</li>
            <li>A doctor may turn reviews off on their profile, which hides existing reviews and stops new ones.</li>
          </ul>
        `,
      },
      {
        heading: "Acceptable use",
        body: `
          <p>Do not use DocSlot to:</p>
          <ul>
            <li>access records that are not yours, or attempt to bypass the platform's permission checks;</li>
            <li>upload files that are not genuine clinical documents, or that contain malicious code;</li>
            <li>scrape, overload or disrupt the service;</li>
            <li>impersonate a doctor, a patient, or DocSlot staff.</li>
          </ul>
        `,
      },
      {
        heading: "Suspension",
        body: `
          <p>
            We may deactivate an account that breaks these terms. A deactivated account cannot sign
            in, and its existing sessions are revoked immediately. Clinical records already created
            are retained, since they form part of a medical history.
          </p>
        `,
      },
      {
        heading: "Availability",
        body: `
          <p>
            We aim to keep DocSlot running, but it is provided as-is and may be unavailable for
            maintenance or reasons outside our control. Do not rely on it as your only route to
            medical care.
          </p>
        `,
      },
      {
        heading: "Changes and governing law",
        body: `
          <p>
            We may update these terms; the date at the top shows when they last changed, and
            continuing to use DocSlot means accepting the current version.
          </p>
          <p>
            <em>The governing law and dispute-resolution terms for your jurisdiction still need to be
            added here by a qualified adviser.</em>
          </p>
        `,
      },
    ],
    footnote: `See also our <a href="/privacy" data-link>Privacy Policy</a>.`,
  });
}
