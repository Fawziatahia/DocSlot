import { medicalRecordsService } from '../../services/medical-records.js';
import { renderPagination } from '../../components/pagination.js';
import { renderLoadingSpinner } from '../../components/loading-spinner.js';
import { openModal } from '../../components/modal.js';
import { formatDate } from '../../utils/formatters.js';
import { authService } from '../../services/auth.js';

export function renderMedicalRecords() {
    const user = authService.getUser();
    const isDoctor = user?.role === 'doctor';

    return `
    <div class="page-title">
        <h1>Medical Records</h1>
        <p>${isDoctor ? 'Create and manage patient medical records' : 'View medical records'}</p>
    </div>
    <div class="card">
        <div class="card-header" style="flex-wrap:wrap;gap:.5rem">
            <select id="mr-type-filter" class="form-control" style="max-width:200px">
                <option value="">All Types</option>
                <option value="lab_result">Lab Result</option>
                <option value="imaging">Imaging</option>
                <option value="note">Note</option>
                <option value="report">Report</option>
                <option value="other">Other</option>
            </select>
            ${isDoctor ? '<button id="create-mr-btn" class="btn btn-primary">+ New Record</button>' : ''}
        </div>
        <div id="medical-records-list">${renderLoadingSpinner()}</div>
    </div>`;
}

export async function initMedicalRecords() {
    const container = document.getElementById('medical-records-list');
    const typeFilter = document.getElementById('mr-type-filter');
    const createBtn = document.getElementById('create-mr-btn');
    const user = authService.getUser();
    const isDoctor = user?.role === 'doctor';
    const isPatient = user?.role === 'patient';
    let currentPage = 1;

    async function loadRecords(page = 1) {
        container.innerHTML = renderLoadingSpinner();
        try {
            const params = { page };
            if (typeFilter?.value) params.record_type = typeFilter.value;

            const res = isPatient
                ? await medicalRecordsService.myRecords(params)
                : await medicalRecordsService.list(params);
            const items = res?.data || [];
            const meta = res?.meta;

            if (!items.length) {
                container.innerHTML = '<div class="empty-state"><p>No medical records found.</p></div>';
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
                                <th>Type</th>
                                <th>Title</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(r => `
                                <tr>
                                    <td>${r.id}</td>
                                    <td>${r.patient?.name || '—'}</td>
                                    <td>${r.doctor?.name || '—'}</td>
                                    <td><span class="badge badge-info">${(r.record_type || '').replace(/_/g, ' ')}</span></td>
                                    <td>${r.title?.substring(0, 50) || '—'}</td>
                                    <td>${formatDate(r.created_at)}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline view-mr" data-id="${r.id}">View</button>
                                        ${isDoctor ? `<button class="btn btn-sm btn-danger delete-mr" data-id="${r.id}">Delete</button>` : ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ${renderPagination(meta, res?.links, '#/medical-records/manage')}
            `;

            bindEvents(page);
        } catch (err) {
            container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        }
    }

    function bindEvents(page) {
        container.querySelectorAll('.view-mr').forEach(btn => {
            btn.addEventListener('click', () => viewRecord(btn.dataset.id));
        });

        if (isDoctor) {
            container.querySelectorAll('.delete-mr').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('Delete this medical record?')) return;
                    try { await medicalRecordsService.destroy(btn.dataset.id); await loadRecords(page); }
                    catch (err) { alert(err.message); }
                });
            });
        }

        container.querySelectorAll('.pagination a[href]').forEach(a => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const p = parseInt(new URL(a.href).searchParams.get('page'), 10) || 1;
                currentPage = p;
                loadRecords(p);
            });
        });
    }

    async function viewRecord(id) {
        try {
            const res = await medicalRecordsService.show(id);
            const r = res.data;
            openModal({
                title: r.title,
                body: `
                    <p><strong>Patient:</strong> ${r.patient?.name || '—'}</p>
                    <p><strong>Doctor:</strong> ${r.doctor?.name || '—'}</p>
                    <p><strong>Type:</strong> ${(r.record_type || '').replace(/_/g, ' ')}</p>
                    <p><strong>Date:</strong> ${formatDate(r.created_at)}</p>
                    <p><strong>Description:</strong> ${r.description || '—'}</p>
                    ${r.notes ? `<p><strong>Notes:</strong> ${r.notes}</p>` : ''}
                    ${r.file_path ? `<p><strong>File:</strong> ${r.file_path}</p>` : ''}
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

    typeFilter?.addEventListener('change', () => { currentPage = 1; loadRecords(1); });
    createBtn?.addEventListener('click', () => { window.location.hash = '#/medical-records/create'; });

    await loadRecords(1);
}
