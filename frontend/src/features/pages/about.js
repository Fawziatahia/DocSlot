import { api } from "../../lib/api.js";
import { renderStaticPage } from "./static-page.js";

export async function renderAboutPage() {
  let stats = null;
  try {
    ({ data: stats } = await api.get("/landing/stats"));
  } catch {
    stats = null;
  }

  const scale = stats
    ? `<p>
         Today DocSlot lists <strong>${stats.doctors}</strong> doctors accepting appointments across
         <strong>${stats.specialties}</strong> specialties, and has handled
         <strong>${stats.appointments}</strong> bookings for <strong>${stats.patients}</strong> registered patients.
       </p>`
    : "";

  return renderStaticPage({
    eyebrow: "Who we are",
    title: "About DocSlot",
    lede: "A booking platform built so getting to the right doctor takes minutes, not phone calls.",
    sections: [
      {
        heading: "Why we built it",
        body: `
          <p>
            Booking a specialist usually means calling a clinic during office hours, being put on hold,
            and taking whatever slot is left. Patients rarely know a doctor's real availability, what a
            visit costs, or what other patients thought — until they turn up.
          </p>
          <p>
            DocSlot puts that information in front of people before they commit: each doctor's
            specialty, department, consultation fee, licence status, live schedule and reviews from
            patients who actually completed an appointment with them.
          </p>
        `,
      },
      {
        heading: "Where we are",
        body:
          scale ||
          `<p>DocSlot is in active development. The doctor directory and booking flow are live.</p>`,
      },
      {
        heading: "How it works",
        body: `
          <ul>
            <li><strong>Patients</strong> search the directory, pick a slot from a doctor's real availability, and keep their prescriptions and medical records in one place afterwards.</li>
            <li><strong>Doctors</strong> manage their weekly schedule, confirm or complete appointments, write prescriptions, upload records, and refer patients to colleagues.</li>
            <li><strong>Administrators</strong> verify doctors against their medical licence, manage departments and specialties, and set the platform's booking rules.</li>
          </ul>
        `,
      },
      {
        heading: "Verification",
        body: `
          <p>
            Every doctor on DocSlot is added by an administrator, not by self-registration, and each
            profile carries a medical licence number on file. Patients register themselves; doctor
            accounts cannot be created from the public sign-up form.
          </p>
        `,
      },
    ],
  });
}
