import { dashboardService } from '../../services/dashboard.js';
import { appointmentsService } from '../../services/appointments.js';
import { renderLoadingSpinner } from '../../components/loading-spinner.js';
import { statusBadge, formatDate, formatTime } from '../../utils/formatters.js';
import { authService } from '../../services/auth.js';

export function renderDashboard() {
    const user = authService.getUser();
    const role = user?.role || 'patient';

    const links = {
        admin: [
            { href: '#/admin/users', label: 'User Management', class: 'btn btn-outline' },
            { href: '#/admin/departments', label: 'Departments', class: 'btn btn-outline' },
            { href: '#/admin/specializations', label: 'Specializations', class: 'btn btn-outline' },
            { href: '#/doctors', label: 'Manage Doctors', class: 'btn btn-outline' },
            { href: '#/appointments/manage', label: 'Appointments', class: 'btn btn-outline' },
            { href: '#/reports', label: 'View Reports', class: 'btn btn-outline' },
        ],
        doctor: [
            { href: '#/appointments/manage', label: 'My Appointments', class: 'btn btn-outline' },
            { href: '#/prescriptions/create', label: 'New Prescription', class: 'btn btn-outline' },
            { href: '#/medical-records/create', label: 'New Medical Record', class: 'btn btn-outline' },
        ],
        patient: [
            { href: '#/appointments/book', label: 'Book Appointment', class: 'btn btn-primary' },
            { href: '#/appointments', label: 'My Appointments', class: 'btn btn-outline' },
            { href: '#/prescriptions', label: 'My Prescriptions', class: 'btn btn-outline' },
        ],
    };

    const roleName = { admin: 'Admin', doctor: 'Doctor', patient: 'Patient' }[role] || 'User';

    return `
    <div class="page-title">
        <h1>${roleName} Dashboard</h1>
        <p>Welcome back, ${user?.name || 'User'}</p>
    </div>
    <div id="dashboard-stats">${renderLoadingSpinner()}</div>
    <div class="card" style="margin-top:1.5rem">
        <h3>Quick Actions</h3>
        <div style="display:flex;gap:.75rem;margin-top:1rem;flex-wrap:wrap">
            ${(links[role] || []).map(l => `<a href="${l.href}" class="${l.class}">${l.label}</a>`).join('')}
        </div>
    </div>
    ${role !== 'admin' ? `
    <div class="card" style="margin-top:1rem">
        <h3>Upcoming Appointments</h3>
        <div id="upcoming-appointments">${renderLoadingSpinner()}</div>
    </div>` : ''}`;
}

export async function initDashboard() {
    const statsEl = document.getElementById('dashboard-stats');
    const upcomingEl = document.getElementById('upcoming-appointments');
    const user = authService.getUser();
    const role = user?.role || 'patient';

    // Load stats
    try {
        let res;
        if (role === 'admin') res = await dashboardService.admin();
        else if (role === 'doctor') res = await dashboardService.doctor();
        else res = await dashboardService.patient();

        const s = res?.data || {};

        if (role === 'admin') {
            statsEl.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card"><div class="stat-value">${s.total_doctors || 0}</div><div class="stat-label">Total Doctors</div></div>
                    <div class="stat-card"><div class="stat-value">${s.active_doctors || 0}</div><div class="stat-label">Active Doctors</div></div>
                    <div class="stat-card"><div class="stat-value">${s.total_patients || 0}</div><div class="stat-label">Total Patients</div></div>
                    <div class="stat-card"><div class="stat-value">${s.total_appointments || 0}</div><div class="stat-label">Total Appointments</div></div>
                    <div class="stat-card"><div class="stat-value">${s.today_appointments || 0}</div><div class="stat-label">Today</div></div>
                    <div class="stat-card"><div class="stat-value">${s.pending_appointments || 0}</div><div class="stat-label">Pending</div></div>
                    <div class="stat-card"><div class="stat-value">${s.completed_appointments || 0}</div><div class="stat-label">Completed</div></div>
                    <div class="stat-card"><div class="stat-value">${s.total_prescriptions || 0}</div><div class="stat-label">Prescriptions</div></div>
                    <div class="stat-card"><div class="stat-value">৳${(s.total_revenue || 0).toFixed(2)}</div><div class="stat-label">Revenue</div></div>
                </div>`;
        } else if (role === 'doctor') {
            statsEl.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card"><div class="stat-value">${s.total_appointments || 0}</div><div class="stat-label">Total Appointments</div></div>
                    <div class="stat-card"><div class="stat-value">${s.today_appointments || 0}</div><div class="stat-label">Today</div></div>
                    <div class="stat-card"><div class="stat-value">${s.pending_appointments || 0}</div><div class="stat-label">Pending</div></div>
                    <div class="stat-card"><div class="stat-value">${s.completed_appointments || 0}</div><div class="stat-label">Completed</div></div>
                    <div class="stat-card"><div class="stat-value">${s.total_prescriptions || 0}</div><div class="stat-label">Prescriptions Given</div></div>
                </div>`;
        } else {
            statsEl.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card"><div class="stat-value">${s.total_appointments || 0}</div><div class="stat-label">Total Appointments</div></div>
                    <div class="stat-card"><div class="stat-value">${s.upcoming_appointments || 0}</div><div class="stat-label">Upcoming</div></div>
                    <div class="stat-card"><div class="stat-value">${s.completed_appointments || 0}</div><div class="stat-label">Completed</div></div>
                    <div class="stat-card"><div class="stat-value">${s.total_prescriptions || 0}</div><div class="stat-label">Prescriptions</div></div>
                </div>`;
        }
    } catch {
        statsEl.innerHTML = '<div class="alert alert-danger">Failed to load dashboard stats.</div>';
    }

    // Upcoming appointments (for doctor and patient)
    if (upcomingEl) {
        try {
            const params = {};
            if (role === 'doctor') params.status = 'pending,confirmed';
            else params.status = 'pending,confirmed';
            const res = await appointmentsService.myAppointments(params);
            const items = res?.data || [];

            if (!items.length) {
                upcomingEl.innerHTML = '<p style="color:var(--color-text-secondary);padding:.5rem 0">No upcoming appointments.</p>';
                return;
            }

            upcomingEl.innerHTML = `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>${role === 'doctor' ? 'Patient' : 'Doctor'}</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.slice(0, 5).map(a => `
                                <tr>
                                    <td>${role === 'doctor' ? (a.patient?.name || '—') : (a.doctor?.name || '—')}</td>
                                    <td>${formatDate(a.appointment_date)}</td>
                                    <td>${formatTime(a.start_time)} - ${formatTime(a.end_time)}</td>
                                    <td>${statusBadge(a.status)}</td>
                                    <td><a href="#/appointments${role === 'doctor' ? '/manage' : ''}" class="btn btn-sm btn-outline">View</a></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>`;
        } catch {
            upcomingEl.innerHTML = '<p style="color:var(--color-text-secondary);padding:.5rem 0">Could not load appointments.</p>';
        }
    }
}
