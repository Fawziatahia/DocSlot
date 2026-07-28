import './assets/css/app.css';
import './assets/css/components.css';
import { initRouter, registerRoute, setCurrentLayout } from './router/router.js';
import { authService } from './services/auth.js';
import { storage } from './utils/storage.js';

// ── Route Registrations ──

// Auth routes (guest layout)
import { renderLogin, initLogin } from './features/auth/login.js';
import { renderRegister, initRegister } from './features/auth/register.js';
import { renderForgotPassword, initForgotPassword } from './features/auth/forgot-password.js';
import { renderResetPassword, initResetPassword } from './features/auth/reset-password.js';

// Admin routes (admin layout)
import { renderUsers, initUsers } from './features/admin/users.js';
import { renderDepartments, initDepartments } from './features/admin/departments.js';
import { renderSpecializations, initSpecializations } from './features/admin/specializations.js';
import { renderSettings, initSettings } from './features/admin/settings.js';

// Doctor routes
import { renderDoctors, initDoctors } from './features/doctors/index.js';
import { renderDoctorDetail, initDoctorDetail } from './features/doctors/detail.js';
import { renderCreateDoctor, initCreateDoctor } from './features/doctors/create.js';
import { renderDoctorSchedule, initDoctorSchedule } from './features/doctors/schedule.js';
import { renderDoctorProfile, initDoctorProfile } from './features/doctors/profile.js';

// Appointment management (admin/doctor layout)
import { renderAppointmentsManage, initAppointmentsManage } from './features/appointments/manage.js';

// Prescription management (admin/doctor layout)
import { renderPrescriptions, initPrescriptions } from './features/prescriptions/index.js';
import { renderCreatePrescription, initCreatePrescription } from './features/prescriptions/create.js';

// Medical records (admin/doctor layout)
import { renderMedicalRecords, initMedicalRecords } from './features/medical-records/index.js';
import { renderCreateMedicalRecord, initCreateMedicalRecord } from './features/medical-records/create.js';

// Notifications
import { renderNotifications, initNotifications } from './features/notifications/index.js';

// Patient routes
import { renderPatientDashboard, initPatientDashboard } from './features/patients/dashboard/index.js';
import { renderAppointmentHistory, initAppointmentHistory } from './features/patients/appointments/history.js';
import { renderBookAppointment, initBookAppointment } from './features/patients/appointments/book.js';
import { renderPatientPrescriptions, initPatientPrescriptions } from './features/patients/prescriptions/index.js';

registerRoute('/login', {
    render: renderLogin,
    init: initLogin,
    layout: 'guest',
});

registerRoute('/register', {
    render: renderRegister,
    init: initRegister,
    layout: 'guest',
});

registerRoute('/forgot-password', {
    render: renderForgotPassword,
    init: initForgotPassword,
    layout: 'guest',
});

registerRoute('/reset-password', {
    render: renderResetPassword,
    init: initResetPassword,
    layout: 'guest',
});

// ── Admin Routes ──
registerRoute('/admin/users', {
    render: renderUsers,
    init: initUsers,
    layout: 'admin',
});

registerRoute('/admin/departments', {
    render: renderDepartments,
    init: initDepartments,
    layout: 'admin',
});

registerRoute('/admin/specializations', {
    render: renderSpecializations,
    init: initSpecializations,
    layout: 'admin',
});

registerRoute('/admin/settings', {
    render: renderSettings,
    init: initSettings,
    layout: 'admin',
});

// ── Doctor Routes ──
registerRoute('/doctors', {
    render: renderDoctors,
    init: initDoctors,
    layout: 'admin',
});

registerRoute('/doctors/create', {
    render: renderCreateDoctor,
    init: initCreateDoctor,
    layout: 'admin',
});

registerRoute('/doctors/:id', {
    render: renderDoctorDetail,
    init: initDoctorDetail,
    layout: 'admin',
});

registerRoute('/doctors/:id/schedule', {
    render: renderDoctorSchedule,
    init: initDoctorSchedule,
    layout: 'admin',
});

// ── Doctor Self-Profile Route (doctor layout) ──
registerRoute('/doctor/profile', {
    render: renderDoctorProfile,
    init: initDoctorProfile,
    layout: 'doctor',
});

registerRoute('/doctor/schedule', {
    render: renderDoctorSchedule,
    init: () => {
        const id = sessionStorage.getItem('doctor_id');
        if (!id) { window.location.hash = '#/doctor/profile'; return; }
        window.__routeParams = { id };
        initDoctorSchedule();
    },
    layout: 'doctor',
});

registerRoute('/doctors/:id/edit', {
    render: renderCreateDoctor,
    init: initCreateDoctor,
    layout: 'admin',
});

// ── Patient Routes ──
registerRoute('/dashboard', {
    render: renderPatientDashboard,
    init: initPatientDashboard,
    layout: 'patient',
});

registerRoute('/appointments', {
    render: renderAppointmentHistory,
    init: initAppointmentHistory,
    layout: 'patient',
});

registerRoute('/appointments/book', {
    render: renderBookAppointment,
    init: initBookAppointment,
    layout: 'patient',
});

registerRoute('/appointments/manage', {
    render: renderAppointmentsManage,
    init: initAppointmentsManage,
    layout: 'admin',
});

registerRoute('/prescriptions', {
    render: renderPatientPrescriptions,
    init: initPatientPrescriptions,
    layout: 'patient',
});

// ── Prescription Management Routes (admin/doctor) ──
registerRoute('/prescriptions/manage', {
    render: renderPrescriptions,
    init: initPrescriptions,
    layout: 'admin',
});

registerRoute('/prescriptions/create', {
    render: renderCreatePrescription,
    init: initCreatePrescription,
    layout: 'admin',
});

// ── Medical Record Routes (admin/doctor) ──
registerRoute('/medical-records/manage', {
    render: renderMedicalRecords,
    init: initMedicalRecords,
    layout: 'admin',
});

registerRoute('/medical-records/create', {
    render: renderCreateMedicalRecord,
    init: initCreateMedicalRecord,
    layout: 'admin',
});

// ── Notifications Route ──
registerRoute('/notifications', {
    render: renderNotifications,
    init: initNotifications,
});

// Default route — redirect based on auth state
registerRoute('/', {
    render: () => {
        if (authService.isAuthenticated()) {
            window.location.hash = '#/dashboard';
            return '';
        }
        window.location.hash = '#/login';
        return '';
    },
    init: () => {},
    layout: 'guest',
});

// 404
registerRoute('/404', {
    render: () => `
        <div class="empty-state">
            <h2>404 — Page Not Found</h2>
            <p>The page you're looking for doesn't exist.</p>
            <a href="#/" class="btn btn-primary" style="margin-top: 1rem;">Go Home</a>
        </div>`,
    init: () => {},
    layout: 'guest',
});

// ── Global logout handler ──
document.addEventListener('click', async (e) => {
    const btn = e.target.closest('#logout-btn');
    if (!btn) return;

    e.preventDefault();
    try {
        await authService.logout();
    } catch {
        // Even if the API call fails, clear local state
        storage?.clearAuth();
    }
    window.location.hash = '#/login';
});

// ── Set layout based on auth state ──
if (authService.isAuthenticated()) {
    const user = authService.getUser();
    if (user?.role === 'admin') {
        setCurrentLayout('admin');
    } else if (user?.role === 'doctor') {
        setCurrentLayout('doctor');
    } else {
        setCurrentLayout('patient');
    }
} else {
    setCurrentLayout('guest');
}

// ── Boot the router ──
initRouter();
