import { adminService } from '../../services/admin.js';
import { renderPagination } from '../../components/pagination.js';
import { renderLoadingSpinner } from '../../components/loading-spinner.js';
import { openModal } from '../../components/modal.js';

export function renderDepartments() {
    return `
    <div class="page-title">
        <h1>Departments</h1>
        <p>Manage hospital departments</p>
    </div>
    <div class="card">
        <div class="card-header">
            <button id="add-department-btn" class="btn btn-primary">+ Add Department</button>
        </div>
        <div id="departments-list">${renderLoadingSpinner()}</div>
    </div>`;
}

export async function initDepartments() {
    const container = document.getElementById('departments-list');
    let currentPage = 1;

    async function loadDepartments(page = 1) {
        container.innerHTML = renderLoadingSpinner();
        try {
            const res = await adminService.listDepartments({ page });
            const items = res.data || [];
            const meta = res.meta;

            if (!items.length) {
                container.innerHTML = '<div class="empty-state"><p>No departments yet.</p></div>';
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
                            ${items.map(d => `
                                <tr>
                                    <td><strong>${d.name}</strong></td>
                                    <td>${d.description || '—'}</td>
                                    <td>${d.doctors_count || 0}</td>
                                    <td>${d.is_active ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-secondary">Inactive</span>'}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline edit-dept" data-id="${d.id}" data-name="${d.name}" data-desc="${d.description || ''}" data-active="${d.is_active}">Edit</button>
                                        <button class="btn btn-sm btn-outline toggle-dept" data-id="${d.id}">${d.is_active ? 'Deactivate' : 'Activate'}</button>
                                        <button class="btn btn-sm btn-danger delete-dept" data-id="${d.id}" data-name="${d.name}">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ${renderPagination(meta, res.links, '#/admin/departments')}
            `;

            bindEvents(page);
        } catch (err) {
            container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        }
    }

    function bindEvents(page) {
        container.querySelectorAll('.edit-dept').forEach(btn => {
            btn.addEventListener('click', () => showDeptModal(btn.dataset));
        });
        container.querySelectorAll('.toggle-dept').forEach(btn => {
            btn.addEventListener('click', async () => {
                try { await adminService.toggleDepartmentStatus(btn.dataset.id); await loadDepartments(page); }
                catch (err) { alert(err.message); }
            });
        });
        container.querySelectorAll('.delete-dept').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm(`Delete department "${btn.dataset.name}"?`)) return;
                try { await adminService.deleteDepartment(btn.dataset.id); await loadDepartments(page); }
                catch (err) { alert(err.message); }
            });
        });
        container.querySelectorAll('.pagination a[href]').forEach(a => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const p = parseInt(new URL(a.href).searchParams.get('page'), 10) || 1;
                currentPage = p;
                loadDepartments(p);
            });
        });
    }

    function showDeptModal(data = {}) {
        const isEdit = !!data.id;
        const { close } = openModal({
            title: isEdit ? 'Edit Department' : 'Add Department',
            body: `
                <form id="dept-form">
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
                    <div id="dept-form-error" class="alert alert-danger" style="display:none"></div>
                </form>
            `,
            footer: `
                <button class="btn btn-outline" id="dept-cancel-btn">Cancel</button>
                <button class="btn btn-primary" id="dept-save-btn">${isEdit ? 'Update' : 'Create'}</button>
            `,
        });

        document.getElementById('dept-cancel-btn').addEventListener('click', close);
        document.getElementById('dept-save-btn').addEventListener('click', async () => {
            const form = document.getElementById('dept-form');
            const errorEl = document.getElementById('dept-form-error');
            const fd = new FormData(form);
            const body = {
                name: fd.get('name'),
                description: fd.get('description') || undefined,
                is_active: fd.get('is_active') === '1',
            };
            try {
                if (isEdit) {
                    await adminService.updateDepartment(data.id, body);
                } else {
                    await adminService.createDepartment(body);
                }
                close();
                await loadDepartments(currentPage);
            } catch (err) {
                errorEl.textContent = err.message;
                errorEl.style.display = 'block';
            }
        });
    }

    document.getElementById('add-department-btn').addEventListener('click', () => showDeptModal({}));
    await loadDepartments(1);
}
