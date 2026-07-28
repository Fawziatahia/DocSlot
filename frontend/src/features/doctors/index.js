import { doctorsService } from '../../services/doctors.js';
import { renderPagination } from '../../components/pagination.js';
import { renderLoadingSpinner } from '../../components/loading-spinner.js';
import { authService } from '../../services/auth.js';

export function renderDoctors() {
    const user = authService.getUser();
    const isAdmin = user?.role === 'admin';

    return `
    <div class="page-title">
        <h1>Doctors</h1>
        <p>${isAdmin ? 'Manage all doctors' : 'Find and view doctors'}</p>
    </div>
    <div class="card">
        <div class="card-header" style="flex-wrap:wrap;gap:.5rem">
            <input type="text" id="doctor-search" class="form-control" style="max-width:240px" placeholder="Search name..." />
            <select id="doctor-specialization" class="form-control" style="max-width:200px">
                <option value="">All Specializations</option>
            </select>
            <select id="doctor-department" class="form-control" style="max-width:200px">
                <option value="">All Departments</option>
            </select>
            ${isAdmin ? '<button id="add-doctor-btn" class="btn btn-primary">+ Add Doctor</button>' : ''}
        </div>
        <div id="doctors-list">${renderLoadingSpinner()}</div>
    </div>`;
}

export async function initDoctors() {
    const container = document.getElementById('doctors-list');
    const searchInput = document.getElementById('doctor-search');
    const specSelect = document.getElementById('doctor-specialization');
    const deptSelect = document.getElementById('doctor-department');
    const addBtn = document.getElementById('add-doctor-btn');
    const user = authService.getUser();
    const isAdmin = user?.role === 'admin';
    let currentPage = 1;

    // Load filter dropdowns
    async function loadFilters() {
        try {
            const { adminService } = await import('../../services/admin.js');
            const specs = await adminService.listSpecializations({ per_page: 100 });
            const depts = await adminService.listDepartments({ per_page: 100 });
            if (specs.data) {
                specSelect.innerHTML = '<option value="">All Specializations</option>' +
                    specs.data.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            }
            if (depts.data) {
                deptSelect.innerHTML = '<option value="">All Departments</option>' +
                    depts.data.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
            }
        } catch {}
    }

    async function loadDoctors(page = 1) {
        container.innerHTML = renderLoadingSpinner();
        try {
            const params = { page };
            const q = searchInput?.value?.trim();
            if (q) params.q = q;
            if (specSelect?.value) params.specialization_id = specSelect.value;
            if (deptSelect?.value) params.department_id = deptSelect.value;

            const res = await doctorsService.list(params);
            const items = res.data || [];
            const meta = res.meta;

            if (!items.length) {
                container.innerHTML = '<div class="empty-state"><p>No doctors found.</p></div>';
                return;
            }

            const baseHash = '#/doctors';
            container.innerHTML = `
                <div class="doctor-grid">
                    ${items.map(d => `
                        <div class="doctor-card">
                            <h3>
                                <a href="#/doctors/${d.id}">${d.user?.name || 'Unknown'}</a>
                            </h3>
                            <div class="doctor-meta">
                                <p>${d.specialization?.name || '—'} ${d.department?.name ? '· ' + d.department.name : ''}</p>
                                <p>${d.qualifications ? d.qualifications.substring(0, 120) : ''}</p>
                                <p><strong>Fee:</strong> \$${d.consultation_fee?.toFixed(2) || '0.00'}</p>
                                <p><strong>Rating:</strong> ${d.avg_rating ? d.avg_rating.toFixed(1) + ' (' + d.total_reviews + ' reviews)' : 'No ratings'}</p>
                                <p><span class="badge ${d.status === 'active' ? 'badge-success' : 'badge-secondary'}">${d.status}</span></p>
                            </div>
                            ${isAdmin ? `
                            <div style="margin-top:.75rem;display:flex;gap:.5rem">
                                <a href="#/doctors/${d.id}/edit" class="btn btn-sm btn-outline">Edit</a>
                                <button class="btn btn-sm btn-outline toggle-doctor-status" data-id="${d.id}" data-status="${d.status}">${d.status === 'active' ? 'Suspend' : 'Activate'}</button>
                                <button class="btn btn-sm btn-danger delete-doctor" data-id="${d.id}" data-name="${d.user?.name}">Delete</button>
                            </div>` : `
                            <div style="margin-top:.75rem">
                                <a href="#/doctors/${d.id}" class="btn btn-sm btn-primary">View Profile</a>
                            </div>`}
                        </div>
                    `).join('')}
                </div>
                ${renderPagination(meta, res.links, baseHash)}
            `;

            bindEvents(page);
        } catch (err) {
            container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        }
    }

    function bindEvents(page) {
        if (isAdmin) {
            container.querySelectorAll('.toggle-doctor-status').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const newStatus = btn.dataset.status === 'active' ? 'suspended' : 'active';
                    try {
                        await doctorsService.toggleStatus(btn.dataset.id, newStatus);
                        await loadDoctors(page);
                    } catch (err) { alert(err.message); }
                });
            });
            container.querySelectorAll('.delete-doctor').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm(`Delete doctor "${btn.dataset.name}"?`)) return;
                    try { await doctorsService.delete(btn.dataset.id); await loadDoctors(page); }
                    catch (err) { alert(err.message); }
                });
            });
        }

        container.querySelectorAll('.pagination a[href]').forEach(a => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const p = parseInt(new URL(a.href).searchParams.get('page'), 10) || 1;
                currentPage = p;
                loadDoctors(p);
            });
        });
    }

    const debouncedSearch = debounce(() => { currentPage = 1; loadDoctors(1); }, 300);
    searchInput?.addEventListener('input', debouncedSearch);
    specSelect?.addEventListener('change', () => { currentPage = 1; loadDoctors(1); });
    deptSelect?.addEventListener('change', () => { currentPage = 1; loadDoctors(1); });
    addBtn?.addEventListener('click', () => { window.location.hash = '#/doctors/create'; });

    await loadFilters();
    await loadDoctors(1);
}

function debounce(fn, ms) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}
