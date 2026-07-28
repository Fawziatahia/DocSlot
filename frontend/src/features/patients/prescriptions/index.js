import { prescriptionsService } from '../../../services/prescriptions.js';
import { renderPagination } from '../../../components/pagination.js';
import { renderLoadingSpinner } from '../../../components/loading-spinner.js';
import { statusBadge, formatDate } from '../../../utils/formatters.js';
import { openModal } from '../../../components/modal.js';

export function renderPatientPrescriptions() {
    return `
    <div class="page-title">
        <h1>My Prescriptions</h1>
        <p>View your prescription history</p>
    </div>
    <div class="card">
        <div id="prescriptions-list">${renderLoadingSpinner()}</div>
    </div>`;
}

export async function initPatientPrescriptions() {
    const container = document.getElementById('prescriptions-list');
    let currentPage = 1;

    async function loadPrescriptions(page = 1) {
        container.innerHTML = renderLoadingSpinner();
        try {
            const res = await prescriptionsService.myPrescriptions({ page });
            const items = res?.data || [];
            const meta = res?.meta;

            if (!items.length) {
                container.innerHTML = '<div class="empty-state"><p>No prescriptions yet.</p></div>';
                return;
            }

            container.innerHTML = `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Doctor</th>
                                <th>Diagnosis</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(p => `
                                <tr>
                                    <td>${p.doctor?.name || '—'}</td>
                                    <td>${p.diagnosis?.substring(0, 60) || '—'}</td>
                                    <td>${statusBadge(p.status)}</td>
                                    <td>${formatDate(p.created_at)}</td>
                                    <td><button class="btn btn-sm btn-outline view-prescription" data-id="${p.id}" data-diagnosis="${p.diagnosis || ''}" data-notes="${p.notes || ''}" data-doctor="${p.doctor?.name || ''}" data-date="${p.created_at || ''}" data-medications='${JSON.stringify(p.medications || []).replace(/'/g, '&#39;')}'>View</button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ${renderPagination(meta, res?.links, '#/prescriptions')}
            `;

            bindEvents(page);
        } catch (err) {
            container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        }
    }

    function bindEvents(page) {
        container.querySelectorAll('.view-prescription').forEach(btn => {
            btn.addEventListener('click', () => {
                const meds = (() => { try { return JSON.parse(btn.dataset.medications); } catch { return []; } })();
                openModal({
                    title: 'Prescription Details',
                    body: `
                        <p><strong>Doctor:</strong> ${btn.dataset.doctor}</p>
                        <p><strong>Date:</strong> ${formatDate(btn.dataset.date)}</p>
                        <p><strong>Diagnosis:</strong> ${btn.dataset.diagnosis || '—'}</p>
                        <p><strong>Notes:</strong> ${btn.dataset.notes || '—'}</p>
                        ${meds.length ? `
                        <div style="margin-top:1rem">
                            <h4>Medications</h4>
                            <div class="table-container">
                                <table>
                                    <thead><tr><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr></thead>
                                    <tbody>
                                        ${meds.map(m => `
                                            <tr>
                                                <td>${m.medication_name}</td>
                                                <td>${m.dosage}</td>
                                                <td>${m.frequency}</td>
                                                <td>${m.duration || '—'}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>` : '<p style="margin-top:1rem;color:var(--color-text-secondary)">No medications listed.</p>'}
                        ${btn.dataset.notes ? `<p style="margin-top:.5rem"><strong>Instructions:</strong> ${btn.dataset.notes}</p>` : ''}
                    `,
                    footer: '<button class="btn btn-outline close-modal-btn">Close</button>',
                });
                document.querySelector('.close-modal-btn')?.addEventListener('click', () => {
                    document.querySelector('.modal-overlay')?.remove();
                });
            });
        });

        container.querySelectorAll('.pagination a[href]').forEach(a => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const p = parseInt(new URL(a.href).searchParams.get('page'), 10) || 1;
                currentPage = p;
                loadPrescriptions(p);
            });
        });
    }

    await loadPrescriptions(1);
}
