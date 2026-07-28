import { doctorsService } from '../../services/doctors.js';
import { adminService } from '../../services/admin.js';
import { renderLoadingSpinner } from '../../components/loading-spinner.js';

export function renderCreateDoctor() {
    return `
    <div class="page-title">
        <h1>Add Doctor</h1>
        <p>Create a new doctor profile</p>
    </div>
    <div class="card" style="max-width:700px">
        <form id="create-doctor-form">
            <div class="form-row">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" name="name" class="form-control" required />
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" class="form-control" required />
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" name="phone" class="form-control" />
                </div>
                <div class="form-group">
                    <label>License Number</label>
                    <input type="text" name="license_number" class="form-control" required />
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Specialization</label>
                    <select name="specialization_id" id="spec-select" class="form-control" required>
                        <option value="">Select...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Department</label>
                    <select name="department_id" id="dept-select" class="form-control" required>
                        <option value="">Select...</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Consultation Fee ($)</label>
                    <input type="number" name="consultation_fee" class="form-control" step="0.01" min="0" />
                </div>
            </div>
            <div class="form-group">
                <label>Qualifications</label>
                <textarea name="qualifications" class="form-control" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label>Bio</label>
                <textarea name="bio" class="form-control" rows="4"></textarea>
            </div>
            <div id="create-doctor-error" class="alert alert-danger" style="display:none"></div>
            <div style="display:flex;gap:.5rem;margin-top:1rem">
                <button type="submit" class="btn btn-primary">Create Doctor</button>
                <a href="#/doctors" class="btn btn-outline">Cancel</a>
            </div>
        </form>
    </div>`;
}

export async function initCreateDoctor() {
    const form = document.getElementById('create-doctor-form');
    const errorEl = document.getElementById('create-doctor-error');
    const specSelect = document.getElementById('spec-select');
    const deptSelect = document.getElementById('dept-select');

    try {
        const [specs, depts] = await Promise.all([
            adminService.listSpecializations({ per_page: 100 }),
            adminService.listDepartments({ per_page: 100 }),
        ]);
        if (specs.data) {
            specSelect.innerHTML = '<option value="">Select...</option>' +
                specs.data.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        }
        if (depts.data) {
            deptSelect.innerHTML = '<option value="">Select...</option>' +
                depts.data.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
        }
    } catch {}

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.style.display = 'none';
        const fd = new FormData(form);
        const body = Object.fromEntries(fd.entries());
        body.consultation_fee = parseFloat(body.consultation_fee) || 0;

        try {
            await doctorsService.create(body);
            window.location.hash = '#/doctors';
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
        }
    });
}
