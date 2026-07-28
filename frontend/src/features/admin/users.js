import { adminService } from '../../services/admin.js';
import { renderPagination } from '../../components/pagination.js';
import { renderLoadingSpinner } from '../../components/loading-spinner.js';

export function renderUsers() {
    return `
    <div class="page-title">
        <h1>User Management</h1>
        <p>View and manage all registered users</p>
    </div>
    <div class="card">
        <div class="card-header">
            <input type="text" id="user-search" class="form-control" style="max-width:300px" placeholder="Search name or email..." />
        </div>
        <div id="users-list">${renderLoadingSpinner()}</div>
    </div>`;
}

export async function initUsers() {
    const container = document.getElementById('users-list');
    const searchInput = document.getElementById('user-search');
    let currentPage = parseInt(new URLSearchParams(window.location.hash.split('?')[1]).get('page'), 10) || 1;

    async function loadUsers(page = 1) {
        container.innerHTML = renderLoadingSpinner();
        const q = searchInput?.value || '';
        try {
            const res = await adminService.listUsers({ page, q });
            const users = res.data || [];
            const meta = res.meta;

            if (!users.length) {
                container.innerHTML = '<div class="empty-state"><p>No users found.</p></div>';
                return;
            }

            const baseHash = '#/admin/users';
            container.innerHTML = `
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Roles</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(u => `
                                <tr>
                                    <td><strong>${u.name}</strong></td>
                                    <td>${u.email}</td>
                                    <td>${u.phone || '—'}</td>
                                    <td>${(u.roles || []).map(r => `<span class="badge badge-info">${r}</span>`).join(' ')}</td>
                                    <td>${u.is_active ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-secondary">Inactive</span>'}</td>
                                    <td>${new Date(u.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline toggle-user" data-id="${u.id}" data-active="${u.is_active}">${u.is_active ? 'Deactivate' : 'Activate'}</button>
                                        <button class="btn btn-sm btn-danger delete-user" data-id="${u.id}" data-name="${u.name}">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                ${renderPagination(meta, res.links, baseHash)}
            `;

            // Attach event listeners
            container.querySelectorAll('.toggle-user').forEach(btn => {
                btn.addEventListener('click', async () => {
                    try {
                        await adminService.toggleUserStatus(btn.dataset.id);
                        await loadUsers(page);
                    } catch (err) {
                        alert(err.message);
                    }
                });
            });

            container.querySelectorAll('.delete-user').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm(`Delete user "${btn.dataset.name}"? This cannot be undone.`)) return;
                    try {
                        await adminService.deleteUser(btn.dataset.id);
                        await loadUsers(page);
                    } catch (err) {
                        alert(err.message);
                    }
                });
            });

            // Pagination links
            container.querySelectorAll('.pagination a[href]').forEach(a => {
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    const url = new URL(a.href, window.location.origin);
                    const p = parseInt(url.searchParams.get('page'), 10) || 1;
                    currentPage = p;
                    loadUsers(p);
                });
            });
        } catch (err) {
            container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        }
    }

    searchInput.addEventListener('input', debounce(() => {
        currentPage = 1;
        loadUsers(1);
    }, 300));

    await loadUsers(currentPage);
}

function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}
