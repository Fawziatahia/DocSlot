// Self-hosted Google Fonts: latin subset only. The aggregate "@fontsource/*/400.css"
// pulls latin + latin-ext + devanagari @font-face blocks (and ships all those woff
// files); this app is English-only, so we import just the latin subset per weight.
// Sora carries headings/display type; Inter carries body copy.
import "@fontsource/sora/latin-600.css";
import "@fontsource/sora/latin-700.css";
import "@fontsource/sora/latin-800.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
// Custom Bootstrap build (see bootstrap.scss) — imports only the components and
// utilities this app actually uses, instead of the full bootstrap.min.css.
import "./bootstrap.scss";
// Only Collapse (navbar toggler) and Dropdown (topbar menus) are used via data-api.
// Importing just these two — instead of bootstrap.bundle.min.js — drops Modal,
// Offcanvas, Carousel, Toast, Tab, Tooltip, Popover, ScrollSpy, Alert & Button JS.
import "bootstrap/js/dist/collapse.js";
import "bootstrap/js/dist/dropdown.js";
import "./bootstrap-icons.css";
import "./style.css";

import { route, startRouter, navigate } from "./lib/router.js";
import { clearSession, hasRole } from "./lib/api.js";
import { initNotificationBell } from "./lib/notifications.js";
import { initFontScale } from "./lib/font-scale.js";
import { isSidebarCollapsed, setSidebarCollapsed } from "./lib/sidebar-state.js";
import { guestLayout } from "./layouts/guest.js";
import { authLayout } from "./layouts/auth.js";
import { dashboardLayout } from "./layouts/dashboard.js";
import { adaptiveLayout } from "./layouts/adaptive.js";

// Feature modules are loaded on demand (dynamic import) so each route ships as its
// own chunk. The initial payload is now the core (router + layouts + vendor) instead
// of every screen in the app. Vite memoises each module, so render+after that share
// a module only fetch it once.

route("/", {
  layout: guestLayout,
  render: (p) => import("./features/landing/index.js").then((m) => m.renderLanding(p)),
  after: (p) => import("./features/landing/index.js").then((m) => m.afterLanding(p)),
});
route("/features", {
  layout: guestLayout,
  render: (p) => import("./features/landing/features-page.js").then((m) => m.renderFeaturesPage(p)),
});
route("/about", {
  layout: guestLayout,
  render: (p) => import("./features/pages/about.js").then((m) => m.renderAboutPage(p)),
});
route("/contact", {
  layout: guestLayout,
  render: (p) => import("./features/pages/contact.js").then((m) => m.renderContactPage(p)),
});
route("/privacy", {
  layout: guestLayout,
  render: (p) => import("./features/pages/privacy.js").then((m) => m.renderPrivacyPage(p)),
});
route("/terms", {
  layout: guestLayout,
  render: (p) => import("./features/pages/terms.js").then((m) => m.renderTermsPage(p)),
});

route("/login", {
  layout: (content) =>
    authLayout(content, {
      framed: true,
      panel: {
        title: "Welcome back.",
        subtitle: "Sign in to manage your appointments & records.",
        points: [
          "Verified specialists",
          "Instant booking",
          "Real-time notifications",
          "Secure & encrypted",
        ],
      },
    }),
  render: (p) => import("./features/auth/login.js").then((m) => m.renderLogin(p)),
  after: (p) => import("./features/auth/login.js").then((m) => m.afterLogin(p)),
});
route("/register", {
  layout: (content) =>
    authLayout(content, {
      panel: {
        title: "Join DocSlot Today.",
        subtitle: "Free for patients. Always.",
        points: [
          "Find the right specialist",
          "Book in under 3 minutes",
          "Notifications & reminders",
          "Rate & review doctors",
        ],
      },
    }),
  render: (p) => import("./features/auth/register.js").then((m) => m.renderRegister(p)),
  after: (p) => import("./features/auth/register.js").then((m) => m.afterRegister(p)),
});
route("/forgot-password", {
  layout: authLayout,
  render: (p) => import("./features/auth/forgot-password.js").then((m) => m.renderForgotPassword(p)),
  after: (p) => import("./features/auth/forgot-password.js").then((m) => m.afterForgotPassword(p)),
});
route("/reset-password", {
  layout: authLayout,
  render: (p) => import("./features/auth/reset-password.js").then((m) => m.renderResetPassword(p)),
  after: (p) => import("./features/auth/reset-password.js").then((m) => m.afterResetPassword(p)),
});
route("/change-password", {
  auth: true,
  layout: authLayout,
  render: (p) => import("./features/auth/change-password.js").then((m) => m.renderChangePassword(p)),
  after: (p) => import("./features/auth/change-password.js").then((m) => m.afterChangePassword(p)),
});

route("/dashboard", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Dashboard", activePath: "/dashboard" }),
  render: (p) => import("./features/dashboard/index.js").then((m) => m.renderDashboard(p)),
});

route("/doctors/new", {
  auth: true,
  roles: ["admin"],
  layout: (content) => dashboardLayout(content, { title: "Add Doctor", activePath: "/doctors" }),
  render: () => import("./features/doctors/form.js").then((m) => m.renderDoctorForm({})),
  after: () => import("./features/doctors/form.js").then((m) => m.afterDoctorForm({})),
});
route("/doctors/:id/edit", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Edit Doctor", activePath: "/doctors" }),
  render: (params) => import("./features/doctors/form.js").then((m) => m.renderDoctorForm(params)),
  after: (params) => import("./features/doctors/form.js").then((m) => m.afterDoctorForm(params)),
});
route("/doctors/:id/schedule", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Manage Schedule", activePath: "/doctors" }),
  render: (params) => import("./features/doctors/schedule.js").then((m) => m.renderDoctorSchedule(params)),
  after: (params) => import("./features/doctors/schedule.js").then((m) => m.afterDoctorSchedule(params)),
});
route("/doctors/:id", {
  layout: (content) => adaptiveLayout(content, { title: "Doctor Profile", activePath: "/doctors" }),
  render: (params) => import("./features/doctors/detail.js").then((m) => m.renderDoctorDetail(params)),
  after: (params) => import("./features/doctors/detail.js").then((m) => m.afterDoctorDetail(params)),
});
route("/doctors", {
  layout: (content) => adaptiveLayout(content, { title: "Doctors", activePath: "/doctors" }),
  render: () => import("./features/doctors/list.js").then((m) => m.renderDoctorsList()),
  after: () => import("./features/doctors/list.js").then((m) => m.afterDoctorsList()),
});

route("/profile", {
  auth: true,
  roles: ["doctor", "patient"],
  layout: (content) => dashboardLayout(content, { title: "My Profile", activePath: "/profile" }),
  render: () =>
    hasRole("doctor")
      ? import("./features/doctors/my-profile.js").then((m) => m.renderMyProfile())
      : import("./features/patients/my-profile.js").then((m) => m.renderMyProfile()),
  after: () => (hasRole("doctor") ? import("./features/doctors/detail.js").then((m) => m.afterDoctorDetail({})) : undefined),
});

// Booking now happens inline on the doctor's profile; keep old links working.
route("/appointments/book/:doctorId", {
  redirect: ({ doctorId }) => `/doctors/${doctorId}`,
});
route("/appointments/:id", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Appointment", activePath: "/appointments" }),
  render: (params) => import("./features/appointments/detail.js").then((m) => m.renderAppointmentDetail(params)),
  after: (params) => import("./features/appointments/detail.js").then((m) => m.afterAppointmentDetail(params)),
});
route("/appointments", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Appointments", activePath: "/appointments" }),
  render: () => import("./features/appointments/list.js").then((m) => m.renderAppointmentsList()),
  after: () => import("./features/appointments/list.js").then((m) => m.afterAppointmentsList()),
});

route("/patients/:id/edit", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Edit Patient", activePath: "/patients" }),
  render: (params) => import("./features/patients/form.js").then((m) => m.renderPatientForm(params)),
  after: (params) => import("./features/patients/form.js").then((m) => m.afterPatientForm(params)),
});
route("/patients/:id/medical-history", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Medical History", activePath: "/patients" }),
  render: (params) => import("./features/patients/records.js").then((m) => m.renderPatientMedicalHistory(params)),
});
route("/patients/:id/prescriptions", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Prescriptions", activePath: "/patients" }),
  render: (params) => import("./features/patients/records.js").then((m) => m.renderPatientPrescriptionsHistory(params)),
});
route("/patients/:id", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Patient Profile", activePath: "/patients" }),
  render: (params) => import("./features/patients/detail.js").then((m) => m.renderPatientDetail(params)),
});
route("/patients", {
  auth: true,
  roles: ["admin", "doctor"],
  layout: (content) => dashboardLayout(content, { title: "Patients", activePath: "/patients" }),
  render: () => import("./features/patients/list.js").then((m) => m.renderPatientsList()),
  after: () => import("./features/patients/list.js").then((m) => m.afterPatientsList()),
});

route("/prescriptions/new", {
  auth: true,
  roles: ["doctor"],
  layout: (content) => dashboardLayout(content, { title: "New Prescription", activePath: "/prescriptions" }),
  render: () => import("./features/prescriptions/form.js").then((m) => m.renderPrescriptionForm({})),
  after: () => import("./features/prescriptions/form.js").then((m) => m.afterPrescriptionForm({})),
});
route("/prescriptions/:id/edit", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Edit Prescription", activePath: "/prescriptions" }),
  render: (params) => import("./features/prescriptions/form.js").then((m) => m.renderPrescriptionForm(params)),
  after: (params) => import("./features/prescriptions/form.js").then((m) => m.afterPrescriptionForm(params)),
});
route("/prescriptions/:id", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Prescription", activePath: "/prescriptions" }),
  render: (params) => import("./features/prescriptions/detail.js").then((m) => m.renderPrescriptionDetail(params)),
  after: () => import("./features/prescriptions/detail.js").then((m) => m.afterPrescriptionDetail()),
});
route("/prescriptions", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Prescriptions", activePath: "/prescriptions" }),
  render: () => import("./features/prescriptions/list.js").then((m) => m.renderPrescriptionsList()),
  after: () => import("./features/prescriptions/list.js").then((m) => m.afterPrescriptionsList()),
});

route("/medical-records/new", {
  auth: true,
  roles: ["doctor"],
  layout: (content) => dashboardLayout(content, { title: "New Medical Record", activePath: "/medical-records" }),
  render: () => import("./features/medical-records/form.js").then((m) => m.renderMedicalRecordForm({})),
  after: () => import("./features/medical-records/form.js").then((m) => m.afterMedicalRecordForm({})),
});
route("/medical-records/:id/edit", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Edit Medical Record", activePath: "/medical-records" }),
  render: (params) => import("./features/medical-records/form.js").then((m) => m.renderMedicalRecordForm(params)),
  after: (params) => import("./features/medical-records/form.js").then((m) => m.afterMedicalRecordForm(params)),
});
route("/medical-records/:id", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Medical Record", activePath: "/medical-records" }),
  render: (params) => import("./features/medical-records/detail.js").then((m) => m.renderMedicalRecordDetail(params)),
  after: () => import("./features/medical-records/detail.js").then((m) => m.afterMedicalRecordDetail()),
});
route("/medical-records", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Medical Records", activePath: "/medical-records" }),
  render: () => import("./features/medical-records/list.js").then((m) => m.renderMedicalRecordsList()),
});

route("/admin/users", {
  auth: true,
  roles: ["admin"],
  layout: (content) => dashboardLayout(content, { title: "Users", activePath: "/admin/users" }),
  render: () => import("./features/admin/users.js").then((m) => m.renderUsersList()),
  after: () => import("./features/admin/users.js").then((m) => m.afterUsersList()),
});

route("/admin/departments/new", {
  auth: true,
  roles: ["admin"],
  layout: (content) => dashboardLayout(content, { title: "Add Department", activePath: "/admin/departments" }),
  render: () => import("./features/admin/departments.js").then((m) => m.renderDepartmentForm({})),
  after: () => import("./features/admin/departments.js").then((m) => m.afterDepartmentForm({})),
});
route("/admin/departments/:id/edit", {
  auth: true,
  roles: ["admin"],
  layout: (content) => dashboardLayout(content, { title: "Edit Department", activePath: "/admin/departments" }),
  render: (params) => import("./features/admin/departments.js").then((m) => m.renderDepartmentForm(params)),
  after: (params) => import("./features/admin/departments.js").then((m) => m.afterDepartmentForm(params)),
});
route("/admin/departments", {
  auth: true,
  roles: ["admin"],
  layout: (content) => dashboardLayout(content, { title: "Departments", activePath: "/admin/departments" }),
  render: () => import("./features/admin/departments.js").then((m) => m.renderDepartmentsList()),
  after: () => import("./features/admin/departments.js").then((m) => m.afterDepartmentsList()),
});

route("/admin/specializations/new", {
  auth: true,
  roles: ["admin"],
  layout: (content) => dashboardLayout(content, { title: "Add Specialization", activePath: "/admin/specializations" }),
  render: () => import("./features/admin/specializations.js").then((m) => m.renderSpecializationForm({})),
  after: () => import("./features/admin/specializations.js").then((m) => m.afterSpecializationForm({})),
});
route("/admin/specializations/:id/edit", {
  auth: true,
  roles: ["admin"],
  layout: (content) => dashboardLayout(content, { title: "Edit Specialization", activePath: "/admin/specializations" }),
  render: (params) => import("./features/admin/specializations.js").then((m) => m.renderSpecializationForm(params)),
  after: (params) => import("./features/admin/specializations.js").then((m) => m.afterSpecializationForm(params)),
});
route("/admin/specializations", {
  auth: true,
  roles: ["admin"],
  layout: (content) => dashboardLayout(content, { title: "Specializations", activePath: "/admin/specializations" }),
  render: () => import("./features/admin/specializations.js").then((m) => m.renderSpecializationsList()),
  after: () => import("./features/admin/specializations.js").then((m) => m.afterSpecializationsList()),
});

route("/admin/settings", {
  auth: true,
  roles: ["admin"],
  layout: (content) => dashboardLayout(content, { title: "Settings", activePath: "/admin/settings" }),
  render: () => import("./features/admin/settings.js").then((m) => m.renderSettings()),
  after: () => import("./features/admin/settings.js").then((m) => m.afterSettings()),
});

route("/symptom-checker", {
  auth: true,
  roles: ["patient"],
  layout: (content) => dashboardLayout(content, { title: "Symptom Checker", activePath: "/symptom-checker" }),
  render: () => import("./features/symptom-tracker/index.js").then((m) => m.renderSymptomTracker()),
  after: () => import("./features/symptom-tracker/index.js").then((m) => m.afterSymptomTracker()),
});

route("/notifications", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Notifications", activePath: "/notifications" }),
  render: () => import("./features/notifications/list.js").then((m) => m.renderNotificationsList()),
  after: () => import("./features/notifications/list.js").then((m) => m.afterNotificationsList()),
});

route("/referrals", {
  auth: true,
  roles: ["doctor"],
  layout: (content) => dashboardLayout(content, { title: "Referrals", activePath: "/referrals" }),
  render: () => import("./features/referrals/list.js").then((m) => m.renderReferralsList()),
  after: () => import("./features/referrals/list.js").then((m) => m.afterReferralsList()),
});

route("/reports", {
  auth: true,
  roles: ["admin"],
  layout: (content) => dashboardLayout(content, { title: "Reports", activePath: "/reports" }),
  render: () => import("./features/reports/index.js").then((m) => m.renderReports()),
  after: () => import("./features/reports/index.js").then((m) => m.afterReports()),
});

document.body.addEventListener("click", (e) => {
  if (e.target.closest("#logout-btn")) {
    clearSession();
    navigate("/login");
  }

  const toggleBtn = e.target.closest("[data-sidebar-toggle]");
  if (toggleBtn) {
    const collapsed = !isSidebarCollapsed();
    setSidebarCollapsed(collapsed);
    document.querySelector(".dashboard-shell")?.classList.toggle("dashboard-shell--collapsed", collapsed);

    const label = collapsed ? "Expand sidebar" : "Collapse sidebar";
    toggleBtn.title = label;
    toggleBtn.setAttribute("aria-label", label);
    toggleBtn.setAttribute("aria-expanded", collapsed ? "false" : "true");
  }
});

document.addEventListener("route:rendered", () => initNotificationBell());

initFontScale();
startRouter();
