import { patientsService } from '../../../services/patients.js';
import { appointmentsService } from '../../../services/appointments.js';
import { renderLoadingSpinner } from '../../../components/loading-spinner.js';
import { statusBadge, formatDate, formatTime } from '../../../utils/formatters.js';

export function renderPatientDashboard() {
    return `
    <div class="page-title">
        <h1>My Dashboard</h1>
        <p>Overview of your appointments and prescriptions</p>
    </div>
    <div id="dashboard-stats">${renderLoadingSpinner()}</div>
    <div class="card" style="margin-top:1.5rem">
        <h3>Quick Actions</h3>
        <div style="display:flex;gap:.75rem;margin-top:1rem;flex-wrap:wrap">
            <a href="#/appointments/book" class="btn btn-primary">Book Appointment</a>
            <a href="#/appointments" class="btn btn-outline">View My Appointments</a>
            <a href="#/prescriptions" class="btn btn-outline">My Prescriptions</a>
        </div>
    </div>
    <div class="card" style="margin-top:1rem">
        <h3>Upcoming Appointments</h3>
        <div id="upcoming-appointments"><div class="loading-container"><div class="spinner"></div></div></div>
    </div>`;
}

export async function initPatientDashboard() {
    const statsEl = document.getElementById('dashboard-stats');
    const upcomingEl = document.getElementById('upcoming-appointments');

    try {
        const res = await patientsService.dashboard();
        const stats = res.data || {};

        statsEl.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${stats.total_appointments || 0}</div>
                    <div class="stat-label">Total Appointments</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.upcoming_appointments || 0}</div>
                    <div class="stat-label">Upcoming</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.completed_appointments || 0}</div>
                    <div class="stat-label">Completed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.total_prescriptions || 0}</div>
                    <div class="stat-label">Prescriptions</div>
                </div>
            </div>`;
    } catch {
        statsEl.innerHTML = '<div class="alert alert-danger">Failed to load dashboard stats.</div>';
    }

    try {
        const res = await appointmentsService.myAppointments({ status: 'pending,confirmed' });
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
                            <th>Doctor</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.slice(0, 5).map(a => `
                            <tr>
                                <td>${a.doctor?.name || '—'}</td>
                                <td>${formatDate(a.appointment_date)}</td>
                                <td>${formatTime(a.start_time)} - ${formatTime(a.end_time)}</td>
                                <td>${statusBadge(a.status)}</td>
                                <td><a href="#/appointments" class="btn btn-sm btn-outline">View</a></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>`;
    } catch {
        upcomingEl.innerHTML = '<p style="color:var(--color-text-secondary);padding:.5rem 0">Could not load appointments.</p>';
    }
}
