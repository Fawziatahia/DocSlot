import { dashboardService } from '../../services/dashboard.js';
import { appointmentsService } from '../../services/appointments.js';
import { renderLoadingSpinner } from '../../components/loading-spinner.js';
import { statusBadge, formatDate, formatTime } from '../../utils/formatters.js';
import { authService } from '../../services/auth.js';
import { icon } from '../../components/icons.js';

export function renderDashboard() {
    const user = authService.getUser();
    const role = user?.role || 'patient';

    const links = {
        admin: [
            { href: '#/admin/users', label: 'User Management', class: 'btn btn-outline', icon: 'users' },
            { href: '#/admin/departments', label: 'Departments', class: 'btn btn-outline', icon: 'building' },
            { href: '#/admin/specializations', label: 'Specializations', class: 'btn btn-outline', icon: 'flask' },
            { href: '#/doctors', label: 'Manage Doctors', class: 'btn btn-outline', icon: 'stethoscope' },
            { href: '#/appointments/manage', label: 'Appointments', class: 'btn btn-outline', icon: 'calendar' },
            { href: '#/reports', label: 'View Reports', class: 'btn btn-outline', icon: 'chart-bar' },
        ],
        doctor: [
            { href: '#/appointments/manage', label: 'My Appointments', class: 'btn btn-outline', icon: 'calendar' },
            { href: '#/prescriptions/create', label: 'New Prescription', class: 'btn btn-outline', icon: 'pill' },
            { href: '#/medical-records/create', label: 'New Medical Record', class: 'btn btn-outline', icon: 'file-plus' },
        ],
        patient: [
            { href: '#/appointments/book', label: 'Book Appointment', class: 'btn btn-primary', icon: 'calendar-plus' },
            { href: '#/appointments', label: 'My Appointments', class: 'btn btn-outline', icon: 'calendar' },
            { href: '#/prescriptions', label: 'My Prescriptions', class: 'btn btn-outline', icon: 'pill' },
        ],
    };

    const roleName = { admin: 'Admin', doctor: 'Doctor', patient: 'Patient' }[role] || 'User';

    return `
    <div class="dashboard-page">
        <div class="page-title">
            <h1>${roleName} Dashboard</h1>
            <p>Welcome back, ${user?.name || 'User'}</p>
        </div>
        <div id="dashboard-stats">${renderLoadingSpinner()}</div>
        <div class="dashboard-section card dashboard-section-card">
            <h3>${icon('activity', { size: 17 })} Quick Actions</h3>
            <div class="quick-actions-grid">
                ${(links[role] || []).map(l => `<a href="${l.href}" class="${l.class}">${icon(l.icon, { size: 16 })} ${l.label}</a>`).join('')}
            </div>
        </div>
        ${role !== 'admin' ? `
        <div class="dashboard-section card dashboard-section-card">
            <h3>${icon('calendar', { size: 17 })} Upcoming Appointments</h3>
            <div id="upcoming-appointments">${renderLoadingSpinner()}</div>
        </div>` : ''}
    </div>`;
}

function statCard(iconName, value, label) {
    return `
        <div class="stat-card">
            <div class="stat-card-icon">${icon(iconName, { size: 20 })}</div>
            <div class="stat-card-body">
                <div class="stat-value">${value}</div>
                <div class="stat-label">${label}</div>
            </div>
        </div>`;
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
                    ${statCard('stethoscope', s.total_doctors || 0, 'Total Doctors')}
                    ${statCard('check-circle', s.active_doctors || 0, 'Active Doctors')}
                    ${statCard('users', s.total_patients || 0, 'Total Patients')}
                    ${statCard('calendar', s.total_appointments || 0, 'Total Appointments')}
                    ${statCard('clock', s.today_appointments || 0, 'Today')}
                    ${statCard('activity', s.pending_appointments || 0, 'Pending')}
                    ${statCard('check-circle', s.completed_appointments || 0, 'Completed')}
                    ${statCard('pill', s.total_prescriptions || 0, 'Prescriptions')}
                    ${statCard('tag', '৳' + (s.total_revenue || 0).toFixed(2), 'Revenue')}
                </div>`;
        } else if (role === 'doctor') {
            statsEl.innerHTML = `
                <div class="stats-grid">
                    ${statCard('calendar', s.total_appointments || 0, 'Total Appointments')}
                    ${statCard('clock', s.today_appointments || 0, 'Today')}
                    ${statCard('activity', s.pending_appointments || 0, 'Pending')}
                    ${statCard('check-circle', s.completed_appointments || 0, 'Completed')}
                    ${statCard('pill', s.total_prescriptions || 0, 'Prescriptions Given')}
                </div>`;
        } else {
            statsEl.innerHTML = `
                <div class="stats-grid">
                    ${statCard('calendar', s.total_appointments || 0, 'Total Appointments')}
                    ${statCard('calendar-plus', s.upcoming_appointments || 0, 'Upcoming')}
                    ${statCard('check-circle', s.completed_appointments || 0, 'Completed')}
                    ${statCard('pill', s.total_prescriptions || 0, 'Prescriptions')}
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
