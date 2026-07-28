import { adminService } from '../../services/admin.js';
import { renderPagination } from '../../components/pagination.js';
import { renderLoadingSpinner } from '../../components/loading-spinner.js';
import { openModal } from '../../components/modal.js';

export function renderSpecializations() {
    return `
    <div class="page-title">
        <h1>Specializations</h1>
        <p>Manage medical specializations</p>
    </div>
    <div class="card">
        <div class="card-header">
            <button id="add-spec-btn" class="btn btn-primary">+ Add Specialization</button>
        </div>
        <div id="specializations-list">${renderLoadingSpinner()}</div>
    </div>`;
}

export async function initSpecializations() {
    const container = document.getElementById('specializations-list');
    let currentPage = 1;

    async function loadSpecializations(page = 1) {
        container.innerHTML = renderLoadingSpinner();
        try {
            const res = await adminService.listSpecializations({ page });
            const items = res.data || [];
            const meta = res.meta;

            if (!items.length) {
                container.innerHTML = '<div class="empty-state"><p>No specializations yet.</p></div>';
                return;
            }

            container.innerHTML = `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Doctors</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(s => `
                                <tr>
                                    <td><strong>${s.name}</strong></td>
                                    <td>${s.description || '—'}</td>
                                    <td>${s.doctors_count || 0}</td>
                                    <td>${s.is_active ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-secondary">Inactive</span>'}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline edit-spec" data-id="${s.id}" data-name="${s.name}" data-desc="${s.description || ''}" data-active="${s.is_active}">Edit</button>
                                        <button class="btn btn-sm btn-outline toggle-spec" data-id="${s.id}">${s.is_active ? 'Deactivate' : 'Activate'}</button>
                                        <button class="btn btn-sm btn-danger delete-spec" data-id="${s.id}" data-name="${s.name}">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ${renderPagination(meta, res.links, '#/admin/specializations')}
            `;

            bindEvents(page);
        } catch (err) {
            container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        }
    }

    function bindEvents(page) {
        container.querySelectorAll('.edit-spec').forEach(btn => {
            btn.addEventListener('click', () => showSpecModal(btn.dataset));
        });
        container.querySelectorAll('.toggle-spec').forEach(btn => {
            btn.addEventListener('click', async () => {
                try { await adminService.toggleSpecializationStatus(btn.dataset.id); await loadSpecializations(page); }
                catch (err) { alert(err.message); }
            });
        });
        container.querySelectorAll('.delete-spec').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm(`Delete specialization "${btn.dataset.name}"?`)) return;
                try { await adminService.deleteSpecialization(btn.dataset.id); await loadSpecializations(page); }
                catch (err) { alert(err.message); }
            });
        });
        container.querySelectorAll('.pagination a[href]').forEach(a => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const p = parseInt(new URL(a.href).searchParams.get('page'), 10) || 1;
                currentPage = p;
                loadSpecializations(p);
            });
        });
    }

    function showSpecModal(data = {}) {
        const isEdit = !!data.id;
        const { close } = openModal({
            title: isEdit ? 'Edit Specialization' : 'Add Specialization',
            body: `
                <form id="spec-form">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" name="name" class="form-control" value="${data.name || ''}" required />
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea name="description" class="form-control" rows="3">${data.desc || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label><input type="checkbox" name="is_active" value="1" ${data.active !== 'false' && data.active !== undefined ? 'checked' : data.active === undefined ? 'checked' : ''} /> Active</label>
                    </div>
                    <div id="spec-form-error" class="alert alert-danger" style="display:none"></div>
                </form>
            `,
            footer: `
                <button class="btn btn-outline" id="spec-cancel-btn">Cancel</button>
                <button class="btn btn-primary" id="spec-save-btn">${isEdit ? 'Update' : 'Create'}</button>
            `,
        });

        document.getElementById('spec-cancel-btn').addEventListener('click', close);
        document.getElementById('spec-save-btn').addEventListener('click', async () => {
            const form = document.getElementById('spec-form');
            const errorEl = document.getElementById('spec-form-error');
            const fd = new FormData(form);
            const body = {
                name: fd.get('name'),
                description: fd.get('description') || undefined,
                is_active: fd.get('is_active') === '1',
            };
            try {
                if (isEdit) {
                    await adminService.updateSpecialization(data.id, body);
                } else {
                    await adminService.createSpecialization(body);
                }
                close();
                await loadSpecializations(currentPage);
            } catch (err) {
                errorEl.textContent = err.message;
                errorEl.style.display = 'block';
            }
        });
    }

    document.getElementById('add-spec-btn').addEventListener('click', () => showSpecModal({}));
    await loadSpecializations(1);
}
