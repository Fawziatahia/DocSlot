import { doctorsService } from '../../services/doctors.js';
import { authService } from '../../services/auth.js';
import { renderLoadingSpinner } from '../../components/loading-spinner.js';

export function renderDoctorProfile() {
    return `<div id="doctor-profile">${renderLoadingSpinner()}</div>`;
}

export async function initDoctorProfile() {
    const container = document.getElementById('doctor-profile');
    const user = authService.getUser();

    let doctorId = sessionStorage.getItem('doctor_id');

    // Look up doctor ID if not cached
    if (!doctorId) {
        try {
            const res = await doctorsService.list({ per_page: 100 });
            const doctors = res?.data || [];
            const match = doctors.find(d => d.user?.id === user?.id);
            if (!match) {
                container.innerHTML = '<div class="alert alert-danger">Doctor profile not found. Contact an admin.</div>';
                return;
            }
            doctorId = match.id;
            sessionStorage.setItem('doctor_id', doctorId);
        } catch (err) {
            container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
            return;
        }
    }

    async function loadProfile() {
        container.innerHTML = renderLoadingSpinner();
        try {
            const d = await doctorsService.show(doctorId);

            container.innerHTML = `
                <div class="page-title">
                    <h1>My Profile</h1>
                    <p>View and edit your professional information</p>
                </div>
                <div class="card" style="max-width:700px">
                    <form id="profile-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Name</label>
                                <input type="text" class="form-control" value="${d.user?.name || ''}" disabled />
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" class="form-control" value="${d.user?.email || ''}" disabled />
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Phone</label>
                                <input type="tel" class="form-control" value="${d.user?.phone || ''}" disabled />
                            </div>
                            <div class="form-group">
                                <label>License Number</label>
                                <input type="text" class="form-control" value="${d.license_number || ''}" disabled />
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Specialization</label>
                                <select name="specialization_id" id="profile-spec" class="form-control">
                                    <option value="${d.specialization?.id || ''}">${d.specialization?.name || 'Loading...'}</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Department</label>
                                <select name="department_id" id="profile-dept" class="form-control">
                                    <option value="${d.department?.id || ''}">${d.department?.name || 'Loading...'}</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Consultation Fee ($)</label>
                            <input type="number" name="consultation_fee" class="form-control" step="0.01" min="0" value="${d.consultation_fee || 0}" />
                        </div>
                        <div class="form-group">
                            <label>Qualifications</label>
                            <textarea name="qualifications" class="form-control" rows="3">${d.qualifications || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Bio</label>
                            <textarea name="bio" class="form-control" rows="4">${d.bio || ''}</textarea>
                        </div>
                        <div id="profile-error" class="alert alert-danger" style="display:none"></div>
                        <div id="profile-success" class="alert alert-success" style="display:none"></div>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </form>
                </div>
                <div class="card" style="max-width:700px;margin-top:1rem">
                    <h3>Schedule</h3>
                    ${d.schedules?.length ? `
                    <div class="table-container" style="margin-top:.75rem">
                        <table>
                            <thead><tr><th>Day</th><th>Start</th><th>End</th><th>Duration</th><th>Max/Day</th></tr></thead>
                            <tbody>${d.schedules.filter(s => s.is_available).map(s => `
                                <tr><td>${s.day_name}</td><td>${s.start_time?.substring(0,5)}</td><td>${s.end_time?.substring(0,5)}</td><td>${s.slot_duration} min</td><td>${s.max_daily_appointments}</td></tr>
                            `).join('')}</tbody>
                        </table>
                    </div>` : '<p style="color:var(--color-text-secondary);margin-top:.75rem">No schedule set. <a href="#/doctor/schedule">Set your schedule.</a></p>'}
                    <a href="#/doctor/schedule" class="btn btn-sm btn-outline" style="margin-top:.75rem">Manage Schedule</a>
                </div>
            `;

            // Load specialization/department dropdowns
            try {
                const { adminService } = await import('../../services/admin.js');
                const [specs, depts] = await Promise.all([
                    adminService.listSpecializations({ per_page: 100 }),
                    adminService.listDepartments({ per_page: 100 }),
                ]);
                const specSelect = document.getElementById('profile-spec');
                if (specs?.data) {
                    specSelect.innerHTML = specs.data.map(s =>
                        `<option value="${s.id}" ${s.id === d.specialization?.id ? 'selected' : ''}>${s.name}</option>`
                    ).join('');
                }
                const deptSelect = document.getElementById('profile-dept');
                if (depts?.data) {
                    deptSelect.innerHTML = depts.data.map(dep =>
                        `<option value="${dep.id}" ${dep.id === d.department?.id ? 'selected' : ''}>${dep.name}</option>`
                    ).join('');
                }
            } catch {}

            bindForm();
        } catch (err) {
            container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        }
    }

    function bindForm() {
        const form = document.getElementById('profile-form');
        const errorEl = document.getElementById('profile-error');
        const successEl = document.getElementById('profile-success');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorEl.style.display = 'none';
            successEl.style.display = 'none';

            const fd = new FormData(form);
            const body = {
                specialization_id: parseInt(fd.get('specialization_id'), 10) || undefined,
                department_id: parseInt(fd.get('department_id'), 10) || undefined,
                consultation_fee: parseFloat(fd.get('consultation_fee')) || undefined,
                qualifications: fd.get('qualifications') || undefined,
                bio: fd.get('bio') || undefined,
            };

            try {
                await doctorsService.update(doctorId, body);
                successEl.textContent = 'Profile updated successfully.';
                successEl.style.display = 'block';
            } catch (err) {
                errorEl.textContent = err.message;
                errorEl.style.display = 'block';
            }
        });
    }

    await loadProfile();
}
