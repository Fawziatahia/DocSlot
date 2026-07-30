import { doctorsService } from '../../services/doctors.js';
import { renderPagination } from '../../components/pagination.js';
import { authService } from '../../services/auth.js';
import { icon } from '../../components/icons.js';
import { consumeDoctorSearchIntent } from '../../utils/doctor-search-intent.js';

function initials(name = '') {
    return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

function specialtyIcon(name = '') {
    const n = name.toLowerCase();
    if (n.includes('cardio')) return 'heart';
    if (n.includes('neuro')) return 'activity';
    if (n.includes('derma') || n.includes('skin')) return 'droplet';
    if (n.includes('ophthal') || n.includes('eye')) return 'eye';
    if (n.includes('ortho') || n.includes('bone')) return 'bone';
    if (n.includes('pulmo') || n.includes('respirat') || n.includes('lung')) return 'wind';
    return 'stethoscope';
}

function renderStars(rating, size = 14) {
    const filled = Math.round(rating || 0);
    return Array.from({ length: 5 }, (_, i) =>
        icon('star', { size, className: i < filled ? 'star-filled' : 'star-empty' })
    ).join('');
}

function renderCardSkeletons(count = 6) {
    return `<div class="doctor-grid">${Array.from({ length: count }, () => `
        <div class="doctor-card-skeleton">
            <div class="skel-row">
                <div class="skel-circle"></div>
                <div style="flex:1">
                    <div class="skel-bar" style="width:70%;height:14px;margin-bottom:.5rem"></div>
                    <div class="skel-bar" style="width:45%;height:11px"></div>
                </div>
            </div>
            <div class="skel-bar" style="width:100%;height:11px;margin-bottom:.5rem"></div>
            <div class="skel-bar" style="width:60%;height:11px"></div>
        </div>
    `).join('')}</div>`;
}

export function renderDoctors() {
    const user = authService.getUser();
    const isAdmin = user?.role === 'admin';

    return `
    <div class="doctors-page">
        <div class="page-title">
            <h1>${icon('stethoscope', { size: 22, className: 'page-title-icon' })} Doctors</h1>
            <p>${isAdmin ? 'Manage all doctors' : 'Find and view doctors'}</p>
        </div>
        <div class="card doctors-filters-card">
            <div class="doctors-toolbar">
                <div class="search-box-sm">
                    ${icon('search', { size: 16 })}
                    <input type="text" id="doctor-search" placeholder="Search by name..." />
                </div>
                <select id="doctor-specialization" class="form-control">
                    <option value="">All Specializations</option>
                </select>
                <select id="doctor-department" class="form-control">
                    <option value="">All Departments</option>
                </select>
                <div class="fee-range-group">
                    ${icon('tag', { size: 14 })}
                    <input type="number" id="doctor-min-fee" placeholder="Min" min="0" />
                    <span>–</span>
                    <input type="number" id="doctor-max-fee" placeholder="Max" min="0" />
                </div>
                ${isAdmin ? '<div class="doctors-toolbar-actions"><button id="add-doctor-btn" class="btn btn-primary">+ Add Doctor</button></div>' : ''}
            </div>
        </div>
        <div class="doctors-results-meta" id="doctors-results-meta"></div>
        <div id="doctors-list">${renderCardSkeletons()}</div>
    </div>`;
}

export async function initDoctors() {
    const container = document.getElementById('doctors-list');
    const resultsMeta = document.getElementById('doctors-results-meta');
    const searchInput = document.getElementById('doctor-search');
    const specSelect = document.getElementById('doctor-specialization');
    const deptSelect = document.getElementById('doctor-department');
    const minFeeInput = document.getElementById('doctor-min-fee');
    const maxFeeInput = document.getElementById('doctor-max-fee');
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
        container.innerHTML = renderCardSkeletons();
        if (resultsMeta) resultsMeta.textContent = '';
        try {
            const params = { page };
            const q = searchInput?.value?.trim();
            if (q) params.q = q;
            if (specSelect?.value) params.specialization_id = specSelect.value;
            if (deptSelect?.value) params.department_id = deptSelect.value;
            if (minFeeInput?.value) params.min_fee = minFeeInput.value;
            if (maxFeeInput?.value) params.max_fee = maxFeeInput.value;

            const res = await doctorsService.list(params);
            const items = res.data || [];
            const meta = res.meta;

            if (!items.length) {
                container.innerHTML = '<div class="card empty-state"><p>No doctors found.</p></div>';
                return;
            }

            if (resultsMeta) {
                resultsMeta.innerHTML = meta?.total != null
                    ? `<strong>${meta.total}</strong> doctor${meta.total === 1 ? '' : 's'} found`
                    : '';
            }

            const baseHash = '#/doctors';
            container.innerHTML = `
                <div class="doctor-grid">
                    ${items.map(d => `
                        <div class="doctor-card">
                            ${d.avg_rating >= 4.5 ? '<div class="doctor-card-badges"><span class="badge-pill badge-pill-top">Top Rated</span></div>' : ''}
                            <div class="doctor-card-top">
                                <div class="doctor-avatar">${initials(d.user?.name)}</div>
                                <div class="doctor-card-heading">
                                    <h3>
                                        <a href="#/doctors/${d.id}">${d.user?.name || 'Unknown'}</a>
                                    </h3>
                                    <p class="doctor-spec">
                                        ${icon(specialtyIcon(d.specialization?.name), { size: 14 })}
                                        ${d.specialization?.name || '—'}${d.department?.name ? ' · ' + d.department.name : ''}
                                    </p>
                                </div>
                            </div>
                            <div class="doctor-rating">
                                ${renderStars(d.avg_rating)}
                                <span>${d.avg_rating ? d.avg_rating.toFixed(1) + ' (' + d.total_reviews + ')' : 'No ratings'}</span>
                            </div>
                            ${d.qualifications ? `<p class="doctor-qual">${d.qualifications.substring(0, 100)}</p>` : ''}
                            <div class="doctor-card-meta-row">
                                <span class="doctor-fee">${icon('tag', { size: 14 })} ৳${d.consultation_fee?.toFixed(2) || '0.00'}</span>
                                <span class="badge ${d.status === 'active' ? 'badge-success' : 'badge-secondary'}">${d.status}</span>
                            </div>
                            ${isAdmin ? `
                            <div class="doctor-card-actions">
                                <a href="#/doctors/${d.id}/edit" class="btn btn-sm btn-outline">Edit</a>
                                <button class="btn btn-sm btn-outline toggle-doctor-status" data-id="${d.id}" data-status="${d.status}">${d.status === 'active' ? 'Suspend' : 'Activate'}</button>
                                <button class="btn btn-sm btn-danger delete-doctor" data-id="${d.id}" data-name="${d.user?.name}">Delete</button>
                            </div>` : `
                            <div class="doctor-card-actions">
                                <a href="#/doctors/${d.id}" class="btn btn-primary">View Profile</a>
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
    minFeeInput?.addEventListener('input', debouncedSearch);
    maxFeeInput?.addEventListener('input', debouncedSearch);
    addBtn?.addEventListener('click', () => { window.location.hash = '#/doctors/create'; });

    await loadFilters();

    const intent = consumeDoctorSearchIntent();
    if (intent?.q && searchInput) searchInput.value = intent.q;
    if (intent?.specialization_id && specSelect) specSelect.value = intent.specialization_id;

    await loadDoctors(1);
}

function debounce(fn, ms) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}
