import { prescriptionsService } from '../../services/prescriptions.js';
import { renderPagination } from '../../components/pagination.js';
import { renderLoadingSpinner } from '../../components/loading-spinner.js';
import { openModal } from '../../components/modal.js';
import { statusBadge, formatDate } from '../../utils/formatters.js';
import { authService } from '../../services/auth.js';

export function renderPrescriptions() {
    const user = authService.getUser();
    const isDoctor = user?.role === 'doctor';

    return `
    <div class="page-title">
        <h1>Prescriptions</h1>
        <p>${isDoctor ? 'Create and manage prescriptions' : 'View all prescriptions'}</p>
    </div>
    <div class="card">
        <div class="card-header">
            ${isDoctor ? '<button id="create-prescription-btn" class="btn btn-primary">+ New Prescription</button>' : ''}
        </div>
        <div id="prescriptions-list">${renderLoadingSpinner()}</div>
    </div>`;
}

export async function initPrescriptions() {
    const container = document.getElementById('prescriptions-list');
    const createBtn = document.getElementById('create-prescription-btn');
    const user = authService.getUser();
    const isDoctor = user?.role === 'doctor';
    const isPatient = user?.role === 'patient';
    let currentPage = 1;

    async function loadPrescriptions(page = 1) {
        container.innerHTML = renderLoadingSpinner();
        try {
            const res = isPatient
                ? await prescriptionsService.myPrescriptions({ page })
                : await prescriptionsService.list({ page });
            const items = res?.data || [];
            const meta = res?.meta;

            if (!items.length) {
                container.innerHTML = '<div class="empty-state"><p>No prescriptions found.</p></div>';
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
                                <th>Diagnosis</th>
                                <th>Medications</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(p => `
                                <tr>
                                    <td>${p.id}</td>
                                    <td>${p.patient?.name || '—'}</td>
                                    <td>${p.doctor?.name || '—'}</td>
                                    <td>${p.diagnosis?.substring(0, 50) || '—'}</td>
                                    <td>${p.medications?.length || 0}</td>
                                    <td>${statusBadge(p.status)}</td>
                                    <td>${formatDate(p.created_at)}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline view-prescription" data-id="${p.id}">View</button>
                                        ${isDoctor ? `<button class="btn btn-sm btn-danger delete-prescription" data-id="${p.id}">Delete</button>` : ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ${renderPagination(meta, res?.links, '#/prescriptions/manage')}
            `;

            bindEvents(page);
        } catch (err) {
            container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        }
    }

    function bindEvents(page) {
        container.querySelectorAll('.view-prescription').forEach(btn => {
            btn.addEventListener('click', () => viewPrescription(btn.dataset.id));
        });

        if (isDoctor) {
            container.querySelectorAll('.delete-prescription').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('Delete this prescription?')) return;
                    try { await prescriptionsService.destroy(btn.dataset.id); await loadPrescriptions(page); }
                    catch (err) { alert(err.message); }
                });
            });
        }

        container.querySelectorAll('.pagination a[href]').forEach(a => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const p = parseInt(new URL(a.href).searchParams.get('page'), 10) || 1;
                currentPage = p;
                loadPrescriptions(p);
            });
        });
    }

    async function viewPrescription(id) {
        try {
            const p = await prescriptionsService.show(id);
            const meds = p.medications || [];
            openModal({
                title: `Prescription #${p.id}`,
                body: `
                    <p><strong>Patient:</strong> ${p.patient?.name || '—'}</p>
                    <p><strong>Doctor:</strong> ${p.doctor?.name || '—'}</p>
                    <p><strong>Diagnosis:</strong> ${p.diagnosis || '—'}</p>
                    <p><strong>Status:</strong> ${statusBadge(p.status)}</p>
                    <p><strong>Date:</strong> ${formatDate(p.created_at)}</p>
                    ${p.notes ? `<p><strong>Notes:</strong> ${p.notes}</p>` : ''}
                    <div style="margin-top:1rem">
                        <h4>Medications (${meds.length})</h4>
                        ${meds.length ? `
                        <div class="table-container">
                            <table>
                                <thead><tr><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr></thead>
                                <tbody>
                                    ${meds.map(m => `
                                        <tr>
                                            <td>${m.medication_name}</td>
                                            <td>${m.dosage}</td>
                                            <td>${m.frequency}</td>
                                            <td>${m.duration || '—'}</td>
                                            <td>${m.instructions || '—'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>` : '<p style="color:var(--color-text-secondary);margin-top:.5rem">No medications listed.</p>'}
                    </div>
                `,
                footer: '<button class="btn btn-outline close-modal-btn">Close</button>',
            });
            document.querySelector('.close-modal-btn')?.addEventListener('click', () => {
                document.querySelector('.modal-overlay')?.remove();
            });
        } catch (err) {
            alert(err.message);
        }
    }

    createBtn?.addEventListener('click', () => { window.location.hash = '#/prescriptions/create'; });

    await loadPrescriptions(1);
}
