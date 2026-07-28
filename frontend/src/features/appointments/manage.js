import { appointmentsService } from '../../services/appointments.js';
import { renderPagination } from '../../components/pagination.js';
import { renderLoadingSpinner } from '../../components/loading-spinner.js';
import { openModal } from '../../components/modal.js';
import { statusBadge, formatDate, formatTime } from '../../utils/formatters.js';
import { authService } from '../../services/auth.js';

export function renderAppointmentsManage() {
    return `
    <div class="page-title">
        <h1>All Appointments</h1>
        <p>View and manage all appointments</p>
    </div>
    <div class="card">
        <div class="card-header" style="flex-wrap:wrap;gap:.5rem">
            <select id="appt-status-filter" class="form-control" style="max-width:180px">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
            </select>
            <input type="date" id="appt-date-filter" class="form-control" style="max-width:180px" />
        </div>
        <div id="appointments-manage-list">${renderLoadingSpinner()}</div>
    </div>`;
}

export async function initAppointmentsManage() {
    const container = document.getElementById('appointments-manage-list');
    const statusFilter = document.getElementById('appt-status-filter');
    const dateFilter = document.getElementById('appt-date-filter');
    const user = authService.getUser();
    const isDoctor = user?.role === 'doctor';
    let currentPage = 1;

    async function loadAppointments(page = 1) {
        container.innerHTML = renderLoadingSpinner();
        try {
            const params = { page };
            if (statusFilter?.value) params.status = statusFilter.value;
            if (dateFilter?.value) params.appointment_date = dateFilter.value;

            const res = isDoctor
                ? await appointmentsService.myAppointments(params)
                : await appointmentsService.list(params);
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
                                <th>#</th>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(a => `
                                <tr>
                                    <td>${a.id}</td>
                                    <td>${a.patient?.name || '—'}</td>
                                    <td>${a.doctor?.name || '—'}</td>
                                    <td>${formatDate(a.appointment_date)}</td>
                                    <td>${formatTime(a.start_time)} - ${formatTime(a.end_time)}</td>
                                    <td>${statusBadge(a.status)}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline view-appt" data-id="${a.id}">View</button>
                                        ${a.status === 'pending' ? `<button class="btn btn-sm btn-success confirm-appt" data-id="${a.id}">Confirm</button>` : ''}
                                        ${a.status === 'confirmed' ? `<button class="btn btn-sm btn-primary complete-appt" data-id="${a.id}">Complete</button>` : ''}
                                        ${(a.status === 'pending' || a.status === 'confirmed') ? `
                                            <button class="btn btn-sm btn-outline reschedule-appt" data-id="${a.id}">Reschedule</button>
                                            <button class="btn btn-sm btn-danger cancel-appt" data-id="${a.id}">Cancel</button>
                                        ` : ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ${renderPagination(meta, res?.links, '#/appointments/manage')}
            `;

            bindEvents(page);
        } catch (err) {
            container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        }
    }

    function bindEvents(page) {
        container.querySelectorAll('.view-appt').forEach(btn => {
            btn.addEventListener('click', () => viewAppointment(btn.dataset.id));
        });
        container.querySelectorAll('.confirm-appt').forEach(btn => {
            btn.addEventListener('click', async () => {
                try { await appointmentsService.confirm(btn.dataset.id); await loadAppointments(page); }
                catch (err) { alert(err.message); }
            });
        });
        container.querySelectorAll('.complete-appt').forEach(btn => {
            btn.addEventListener('click', async () => {
                try { await appointmentsService.complete(btn.dataset.id); await loadAppointments(page); }
                catch (err) { alert(err.message); }
            });
        });
        container.querySelectorAll('.cancel-appt').forEach(btn => {
            btn.addEventListener('click', async () => {
                const reason = prompt('Cancellation reason (optional):');
                if (reason === null) return;
                try { await appointmentsService.cancel(btn.dataset.id, reason || undefined); await loadAppointments(page); }
                catch (err) { alert(err.message); }
            });
        });
        container.querySelectorAll('.reschedule-appt').forEach(btn => {
            btn.addEventListener('click', () => showRescheduleModal(btn.dataset.id, page));
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

    async function viewAppointment(id) {
        container.innerHTML = renderLoadingSpinner();
        try {
            const a = await appointmentsService.show(id);
            openModal({
                title: `Appointment #${a.id}`,
                body: `
                    <p><strong>Patient:</strong> ${a.patient?.name || '—'} ${a.patient?.email ? '(' + a.patient.email + ')' : ''}</p>
                    <p><strong>Doctor:</strong> ${a.doctor?.name || '—'} ${a.doctor?.specialization ? '(' + a.doctor.specialization + ')' : ''}</p>
                    <p><strong>Date:</strong> ${formatDate(a.appointment_date)}</p>
                    <p><strong>Time:</strong> ${formatTime(a.start_time)} - ${formatTime(a.end_time)}</p>
                    <p><strong>Status:</strong> ${statusBadge(a.status)}</p>
                    <p><strong>Reason:</strong> ${a.reason || '—'}</p>
                    ${a.cancellation_reason ? `<p><strong>Cancellation Reason:</strong> ${a.cancellation_reason}</p>` : ''}
                    <p><strong>Reschedule Count:</strong> ${a.reschedule_count}</p>
                `,
                footer: '<button class="btn btn-outline close-modal-btn">Close</button>',
            });
            document.querySelector('.close-modal-btn')?.addEventListener('click', () => {
                document.querySelector('.modal-overlay')?.remove();
                loadAppointments(currentPage);
            });
        } catch (err) {
            container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        }
    }

    function showRescheduleModal(id, page) {
        const { close } = openModal({
            title: 'Reschedule Appointment',
            body: `
                <form id="reschedule-form">
                    <div class="form-group">
                        <label>New Date</label>
                        <input type="date" name="appointment_date" class="form-control" required min="${new Date().toISOString().split('T')[0]}" />
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Start Time</label>
                            <input type="time" name="start_time" class="form-control" required />
                        </div>
                        <div class="form-group">
                            <label>End Time</label>
                            <input type="time" name="end_time" class="form-control" required />
                        </div>
                    </div>
                    <div id="reschedule-error" class="alert alert-danger" style="display:none;margin-top:.5rem"></div>
                </form>
            `,
            footer: `
                <button class="btn btn-outline" id="reschedule-cancel-btn">Cancel</button>
                <button class="btn btn-primary" id="reschedule-save-btn">Save</button>
            `,
        });

        document.getElementById('reschedule-cancel-btn').addEventListener('click', close);
        document.getElementById('reschedule-save-btn').addEventListener('click', async () => {
            const form = document.getElementById('reschedule-form');
            const errorEl = document.getElementById('reschedule-error');
            const fd = new FormData(form);
            try {
                await appointmentsService.reschedule(id, {
                    appointment_date: fd.get('appointment_date'),
                    start_time: fd.get('start_time') + ':00',
                    end_time: fd.get('end_time') + ':00',
                });
                close();
                await loadAppointments(page);
            } catch (err) {
                errorEl.textContent = err.message;
                errorEl.style.display = 'block';
            }
        });
    }

    statusFilter?.addEventListener('change', () => { currentPage = 1; loadAppointments(1); });
    dateFilter?.addEventListener('change', () => { currentPage = 1; loadAppointments(1); });

    await loadAppointments(1);
}
