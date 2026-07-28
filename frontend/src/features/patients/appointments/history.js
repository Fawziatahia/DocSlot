import { appointmentsService } from '../../../services/appointments.js';
import { patientsService } from '../../../services/patients.js';
import { renderPagination } from '../../../components/pagination.js';
import { renderLoadingSpinner } from '../../../components/loading-spinner.js';
import { statusBadge, formatDate, formatTime } from '../../../utils/formatters.js';

export function renderAppointmentHistory() {
    return `
    <div class="page-title">
        <h1>My Appointments</h1>
        <p>View and manage your appointments</p>
    </div>
    <div class="card">
        <div class="card-header" style="flex-wrap:wrap;gap:.5rem">
            <select id="appointment-status-filter" class="form-control" style="max-width:200px">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
            </select>
            <a href="#/appointments/book" class="btn btn-primary">+ Book Appointment</a>
        </div>
        <div id="appointments-list">${renderLoadingSpinner()}</div>
    </div>`;
}

export async function initAppointmentHistory() {
    const container = document.getElementById('appointments-list');
    const statusFilter = document.getElementById('appointment-status-filter');
    let currentPage = 1;

    async function loadAppointments(page = 1) {
        container.innerHTML = renderLoadingSpinner();
        try {
            const params = { page };
            const status = statusFilter?.value;
            if (status) params.status = status;

            const res = await appointmentsService.myAppointments(params);
            const items = res?.data || [];
            const meta = res?.meta;

            if (!items.length) {
                container.innerHTML = '<div class="empty-state"><p>No appointments found.</p></div>';
                return;
            }

            container.innerHTML = `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Doctor</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(a => `
                                <tr>
                                    <td>${a.doctor?.name || '—'}</td>
                                    <td>${formatDate(a.appointment_date)}</td>
                                    <td>${formatTime(a.start_time)} - ${formatTime(a.end_time)}</td>
                                    <td>${a.reason?.substring(0, 50) || '—'}</td>
                                    <td>${statusBadge(a.status)}</td>
                                    <td>
                                        ${a.status === 'pending' || a.status === 'confirmed'
                                            ? `<button class="btn btn-sm btn-danger cancel-appt" data-id="${a.id}">Cancel</button>`
                                            : '—'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ${renderPagination(meta, res?.links, '#/appointments')}
            `;

            bindEvents(page);
        } catch (err) {
            container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        }
    }

    function bindEvents(page) {
        container.querySelectorAll('.cancel-appt').forEach(btn => {
            btn.addEventListener('click', async () => {
                const reason = prompt('Reason for cancellation (optional):');
                if (reason === null) return; // cancelled prompt
                try {
                    await appointmentsService.cancel(btn.dataset.id, reason || undefined);
                    await loadAppointments(page);
                } catch (err) { alert(err.message); }
            });
        });

        container.querySelectorAll('.pagination a[href]').forEach(a => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const p = parseInt(new URL(a.href).searchParams.get('page'), 10) || 1;
                currentPage = p;
                loadAppointments(p);
            });
        });
    }

    statusFilter?.addEventListener('change', () => { currentPage = 1; loadAppointments(1); });

    await loadAppointments(1);
}
