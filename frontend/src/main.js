import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./style.css";

import { route, startRouter, navigate } from "./lib/router.js";
import { clearSession, hasRole } from "./lib/api.js";
import { initNotificationBell } from "./lib/notifications.js";
import { guestLayout } from "./layouts/guest.js";
import { authLayout } from "./layouts/auth.js";
import { dashboardLayout } from "./layouts/dashboard.js";
import { adaptiveLayout } from "./layouts/adaptive.js";

import { renderLanding } from "./features/landing/index.js";
import { renderFeaturesPage } from "./features/landing/features-page.js";
import { renderLogin, afterLogin } from "./features/auth/login.js";
import { renderRegister, afterRegister } from "./features/auth/register.js";
import { renderForgotPassword, afterForgotPassword } from "./features/auth/forgot-password.js";
import { renderResetPassword, afterResetPassword } from "./features/auth/reset-password.js";
import { renderChangePassword, afterChangePassword } from "./features/auth/change-password.js";
import { renderDashboard } from "./features/dashboard/index.js";
import { renderDoctorsList, afterDoctorsList } from "./features/doctors/list.js";
import { renderDoctorDetail, afterDoctorDetail } from "./features/doctors/detail.js";
import { renderDoctorForm, afterDoctorForm } from "./features/doctors/form.js";
import { renderDoctorSchedule, afterDoctorSchedule } from "./features/doctors/schedule.js";
import { renderMyProfile as renderDoctorMyProfile } from "./features/doctors/my-profile.js";
import { renderMyProfile as renderPatientMyProfile } from "./features/patients/my-profile.js";
import { renderAppointmentsList, afterAppointmentsList } from "./features/appointments/list.js";
import { renderAppointmentDetail, afterAppointmentDetail } from "./features/appointments/detail.js";
import { renderPatientsList, afterPatientsList } from "./features/patients/list.js";
import { renderPatientDetail } from "./features/patients/detail.js";
import { renderPatientForm, afterPatientForm } from "./features/patients/form.js";
import { renderPatientMedicalHistory, renderPatientPrescriptionsHistory } from "./features/patients/records.js";
import { renderPrescriptionsList, afterPrescriptionsList } from "./features/prescriptions/list.js";
import { renderPrescriptionDetail } from "./features/prescriptions/detail.js";
import { renderPrescriptionForm, afterPrescriptionForm } from "./features/prescriptions/form.js";
import { renderMedicalRecordsList } from "./features/medical-records/list.js";
import { renderMedicalRecordDetail, afterMedicalRecordDetail } from "./features/medical-records/detail.js";
import { renderMedicalRecordForm, afterMedicalRecordForm } from "./features/medical-records/form.js";
import { renderUsersList, afterUsersList } from "./features/admin/users.js";
import {
  renderDepartmentsList,
  afterDepartmentsList,
  renderDepartmentForm,
  afterDepartmentForm,
} from "./features/admin/departments.js";
import {
  renderSpecializationsList,
  afterSpecializationsList,
  renderSpecializationForm,
  afterSpecializationForm,
} from "./features/admin/specializations.js";
import { renderSettings, afterSettings } from "./features/admin/settings.js";
import { renderNotificationsList, afterNotificationsList } from "./features/notifications/list.js";
import { renderReferralsList, afterReferralsList } from "./features/referrals/list.js";
import { renderReports, afterReports } from "./features/reports/index.js";

route("/", { layout: guestLayout, render: () => renderLanding() });
route("/features", { layout: guestLayout, render: () => renderFeaturesPage() });

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
  render: () => renderLogin(),
  after: afterLogin,
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
  render: () => renderRegister(),
  after: afterRegister,
});
route("/forgot-password", {
  layout: authLayout,
  render: () => renderForgotPassword(),
  after: afterForgotPassword,
});
route("/reset-password", {
  layout: authLayout,
  render: () => renderResetPassword(),
  after: afterResetPassword,
});
route("/change-password", {
  auth: true,
  layout: authLayout,
  render: () => renderChangePassword(),
  after: afterChangePassword,
});

route("/dashboard", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Dashboard", activePath: "/dashboard" }),
  render: () => renderDashboard(),
});

route("/doctors/new", {
  auth: true,
  roles: ["admin"],
  layout: (content) => dashboardLayout(content, { title: "Add Doctor", activePath: "/doctors" }),
  render: () => renderDoctorForm({}),
  after: () => afterDoctorForm({}),
});
route("/doctors/:id/edit", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Edit Doctor", activePath: "/doctors" }),
  render: (params) => renderDoctorForm(params),
  after: (params) => afterDoctorForm(params),
});
route("/doctors/:id/schedule", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Manage Schedule", activePath: "/doctors" }),
  render: (params) => renderDoctorSchedule(params),
  after: (params) => afterDoctorSchedule(params),
});
route("/doctors/:id", {
  layout: (content) => adaptiveLayout(content, { title: "Doctor Profile", activePath: "/doctors" }),
  render: (params) => renderDoctorDetail(params),
  after: (params) => afterDoctorDetail(params),
});
route("/doctors", {
  layout: (content) => adaptiveLayout(content, { title: "Doctors", activePath: "/doctors" }),
  render: () => renderDoctorsList(),
  after: () => afterDoctorsList(),
});

route("/profile", {
  auth: true,
  roles: ["doctor", "patient"],
  layout: (content) => dashboardLayout(content, { title: "My Profile", activePath: "/profile" }),
  render: () => (hasRole("doctor") ? renderDoctorMyProfile() : renderPatientMyProfile()),
  after: () => hasRole("doctor") && afterDoctorDetail({}),
});

// Booking now happens inline on the doctor's profile; keep old links working.
route("/appointments/book/:doctorId", {
  redirect: ({ doctorId }) => `/doctors/${doctorId}`,
});
route("/appointments/:id", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Appointment", activePath: "/appointments" }),
  render: (params) => renderAppointmentDetail(params),
  after: (params) => afterAppointmentDetail(params),
});
route("/appointments", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Appointments", activePath: "/appointments" }),
  render: () => renderAppointmentsList(),
  after: () => afterAppointmentsList(),
});

route("/patients/:id/edit", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Edit Patient", activePath: "/patients" }),
  render: (params) => renderPatientForm(params),
  after: (params) => afterPatientForm(params),
});
route("/patients/:id/medical-history", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Medical History", activePath: "/patients" }),
  render: (params) => renderPatientMedicalHistory(params),
});
route("/patients/:id/prescriptions", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Prescriptions", activePath: "/patients" }),
  render: (params) => renderPatientPrescriptionsHistory(params),
});
route("/patients/:id", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Patient Profile", activePath: "/patients" }),
  render: (params) => renderPatientDetail(params),
});
route("/patients", {
  auth: true,
  roles: ["admin", "doctor"],
  layout: (content) => dashboardLayout(content, { title: "Patients", activePath: "/patients" }),
  render: () => renderPatientsList(),
  after: () => afterPatientsList(),
});

route("/prescriptions/new", {
  auth: true,
  roles: ["doctor"],
  layout: (content) => dashboardLayout(content, { title: "New Prescription", activePath: "/prescriptions" }),
  render: () => renderPrescriptionForm({}),
  after: () => afterPrescriptionForm({}),
});
route("/prescriptions/:id/edit", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Edit Prescription", activePath: "/prescriptions" }),
  render: (params) => renderPrescriptionForm(params),
  after: (params) => afterPrescriptionForm(params),
});
route("/prescriptions/:id", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Prescription", activePath: "/prescriptions" }),
  render: (params) => renderPrescriptionDetail(params),
});
route("/prescriptions", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Prescriptions", activePath: "/prescriptions" }),
  render: () => renderPrescriptionsList(),
  after: () => afterPrescriptionsList(),
});

route("/medical-records/new", {
  auth: true,
  roles: ["doctor"],
  layout: (content) => dashboardLayout(content, { title: "New Medical Record", activePath: "/medical-records" }),
  render: () => renderMedicalRecordForm({}),
  after: () => afterMedicalRecordForm({}),
});
route("/medical-records/:id/edit", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Edit Medical Record", activePath: "/medical-records" }),
  render: (params) => renderMedicalRecordForm(params),
  after: (params) => afterMedicalRecordForm(params),
});
route("/medical-records/:id", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Medical Record", activePath: "/medical-records" }),
  render: (params) => renderMedicalRecordDetail(params),
  after: () => afterMedicalRecordDetail(),
});
route("/medical-records", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Medical Records", activePath: "/medical-records" }),
  render: () => renderMedicalRecordsList(),
});

route("/admin/users", {
  auth: true,
  roles: ["admin"],
  layout: (content) => dashboardLayout(content, { title: "Users", activePath: "/admin/users" }),
  render: () => renderUsersList(),
  after: () => afterUsersList(),
});

route("/admin/departments/new", {
  auth: true,
  roles: ["admin"],
  layout: (content) => dashboardLayout(content, { title: "Add Department", activePath: "/admin/departments" }),
  render: () => renderDepartmentForm({}),
  after: () => afterDepartmentForm({}),
});
route("/admin/departments/:id/edit", {
  auth: true,
  roles: ["admin"],
  layout: (content) => dashboardLayout(content, { title: "Edit Department", activePath: "/admin/departments" }),
  render: (params) => renderDepartmentForm(params),
  after: (params) => afterDepartmentForm(params),
});
route("/admin/departments", {
  auth: true,
  roles: ["admin"],
  layout: (content) => dashboardLayout(content, { title: "Departments", activePath: "/admin/departments" }),
  render: () => renderDepartmentsList(),
  after: () => afterDepartmentsList(),
});

route("/admin/specializations/new", {
  auth: true,
  roles: ["admin"],
  layout: (content) => dashboardLayout(content, { title: "Add Specialization", activePath: "/admin/specializations" }),
  render: () => renderSpecializationForm({}),
  after: () => afterSpecializationForm({}),
});
route("/admin/specializations/:id/edit", {
  auth: true,
  roles: ["admin"],
  layout: (content) => dashboardLayout(content, { title: "Edit Specialization", activePath: "/admin/specializations" }),
  render: (params) => renderSpecializationForm(params),
  after: (params) => afterSpecializationForm(params),
});
route("/admin/specializations", {
  auth: true,
  roles: ["admin"],
  layout: (content) => dashboardLayout(content, { title: "Specializations", activePath: "/admin/specializations" }),
  render: () => renderSpecializationsList(),
  after: () => afterSpecializationsList(),
});

route("/admin/settings", {
  auth: true,
  roles: ["admin"],
  layout: (content) => dashboardLayout(content, { title: "Settings", activePath: "/admin/settings" }),
  render: () => renderSettings(),
  after: () => afterSettings(),
});

route("/notifications", {
  auth: true,
  layout: (content) => dashboardLayout(content, { title: "Notifications", activePath: "/notifications" }),
  render: () => renderNotificationsList(),
  after: () => afterNotificationsList(),
});

route("/referrals", {
  auth: true,
  roles: ["doctor"],
  layout: (content) => dashboardLayout(content, { title: "Referrals", activePath: "/referrals" }),
  render: () => renderReferralsList(),
  after: () => afterReferralsList(),
});

route("/reports", {
  auth: true,
  roles: ["admin"],
  layout: (content) => dashboardLayout(content, { title: "Reports", activePath: "/reports" }),
  render: () => renderReports(),
  after: () => afterReports(),
});

document.body.addEventListener("click", (e) => {
  if (e.target.closest("#logout-btn")) {
    clearSession();
    navigate("/login");
  }
});

document.addEventListener("route:rendered", () => initNotificationBell());

startRouter();
