import { renderStaticPage } from "./static-page.js";
import { POLICY_UPDATED, SITE_INFO } from "./site-info.js";
import { escapeHtml } from "../../lib/escape.js";

const REVIEW_NOTICE = `
  <div class="alert alert-warning">
    <strong>Draft — needs legal review.</strong>
    This describes exactly what the DocSlot software does with your data today, written by the
    engineering team. It has not been reviewed by a lawyer and makes no claim of compliance with
    any particular data-protection regime. Have it checked against the law that applies to you
    before you publish it.
  </div>
`;

export function renderPrivacyPage() {
  return renderStaticPage({
    eyebrow: "Privacy",
    title: "Privacy Policy",
    lede: `What DocSlot stores, who can see it, and how long we keep it. Last updated ${POLICY_UPDATED}.`,
    sections: [
      { body: REVIEW_NOTICE },
      {
        heading: "What we collect",
        body: `
          <p>Only what the platform needs to run:</p>
          <ul>
            <li><strong>Account</strong> — name, email address, phone number, and a password stored as a one-way hash. We never store your password itself.</li>
            <li><strong>Patient profile</strong> — date of birth, gender, address, blood group, emergency contact, and any medical history notes recorded on your file.</li>
            <li><strong>Appointments</strong> — the doctor, date, time, your stated reason for the visit, and the outcome or cancellation reason.</li>
            <li><strong>Clinical records</strong> — prescriptions and medications issued to you, medical records written about you, and any PDF or image a doctor attaches to them.</li>
            <li><strong>Reviews</strong> — the score and comment you leave after a completed appointment.</li>
            <li><strong>Technical</strong> — the time and IP address of your last sign-in, and an audit trail of administrative changes.</li>
          </ul>
        `,
      },
      {
        heading: "Who can see it",
        body: `
          <p>This is the part worth reading closely.</p>
          <ul>
            <li><strong>You</strong> can see everything on your own record.</li>
            <li><strong>Doctors on the platform</strong> can view patient profiles, medical histories and prescriptions — not only for their own patients. This is how the platform is currently configured so that a doctor you are referred to can read your history before your visit.</li>
            <li><strong>Administrators</strong> can see all of the above, plus account status, contact details and sign-in history.</li>
            <li><strong>The public</strong> can see any review you leave: your name, your score and your comment appear on the doctor's profile and may appear on our home page. Everything else on your record stays private.</li>
          </ul>
        `,
      },
      {
        heading: "Files you or your doctor upload",
        body: `
          <p>
            Attachments on medical records — lab reports, scans, letters — are stored on private
            storage under randomised filenames, not in a public web folder. There is no shareable
            link to them. They can only be fetched by a signed-in account that is allowed to view
            the record, and they are deleted from storage when the record or the attachment is removed.
          </p>
        `,
      },
      {
        heading: "Email",
        body: `
          <p>
            We email you a one-time code when you reset your password, and a confirmation when an
            appointment is booked. These are sent through a third-party email provider, which
            processes your email address in order to deliver them. We do not send marketing email.
          </p>
        `,
      },
      {
        heading: "Tracking",
        body: `
          <p>
            DocSlot runs no analytics, advertising or third-party tracking scripts. The only thing
            stored in your browser is the session token that keeps you signed in, which is cleared
            when you log out.
          </p>
        `,
      },
      {
        heading: "Keeping and deleting data",
        body: `
          <p>
            Records are kept while your account is open, because appointment and prescription history
            is medical information you and your doctors may need later. An administrator can
            deactivate or delete an account; deleting it removes the associated records and any
            uploaded files.
          </p>
          <p>
            To ask for a copy of your data or for your account to be removed, contact us using the
            details on the <a href="/contact" data-link>contact page</a>.
          </p>
        `,
      },
      {
        heading: "Security",
        body: `
          <p>
            Passwords are hashed, sessions use revocable API tokens, and every request for a record
            is checked against the permissions of the account making it. No system is perfectly
            secure, and we do not claim otherwise — but attachments and clinical records are never
            served without an authorisation check.
          </p>
        `,
      },
    ],
    footnote: SITE_INFO.supportEmail
      ? `Questions about this policy? Email <a href="mailto:${escapeHtml(SITE_INFO.supportEmail)}">${escapeHtml(SITE_INFO.supportEmail)}</a>.`
      : `Questions about this policy? See the <a href="/contact" data-link>contact page</a>.`,
  });
}
