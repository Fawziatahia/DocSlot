import { medicalRecordsService } from '../../services/medical-records.js';

export function renderCreateMedicalRecord() {
    return `
    <div class="page-title">
        <h1>New Medical Record</h1>
        <p>Create a medical record for a patient</p>
    </div>
    <div class="card" style="max-width:700px">
        <form id="create-mr-form">
            <div class="form-group">
                <label>Patient</label>
                <select name="patient_id" id="mr-patient-select" class="form-control" required>
                    <option value="">Select patient...</option>
                </select>
            </div>
            <div class="form-group">
                <label>Record Type</label>
                <select name="record_type" class="form-control" required>
                    <option value="">Select type...</option>
                    <option value="lab_result">Lab Result</option>
                    <option value="imaging">Imaging</option>
                    <option value="note">Note</option>
                    <option value="report">Report</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Title</label>
                <input type="text" name="title" class="form-control" required />
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" class="form-control" rows="4"></textarea>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" class="form-control" rows="3"></textarea>
            </div>
            <div id="mr-error" class="alert alert-danger" style="display:none"></div>
            <div style="display:flex;gap:.5rem;margin-top:1rem">
                <button type="submit" class="btn btn-primary">Create Record</button>
                <a href="#/medical-records/manage" class="btn btn-outline">Cancel</a>
            </div>
        </form>
    </div>`;
}

export async function initCreateMedicalRecord() {
    const form = document.getElementById('create-mr-form');
    const errorEl = document.getElementById('mr-error');
    const patientSelect = document.getElementById('mr-patient-select');

    try {
        const { api } = await import('../../services/api.js');
        const res = await api.get('/patients', { params: { per_page: 100 } });
        const patients = res?.data || [];
        patientSelect.innerHTML = '<option value="">Select patient...</option>' +
            patients.map(p => `<option value="${p.id}">${p.user?.name || 'Unknown'} (${p.user?.email || '—'})</option>`).join('');
    } catch {
        patientSelect.innerHTML = '<option value="">Failed to load patients</option>';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.style.display = 'none';
        const fd = new FormData(form);
        const body = Object.fromEntries(fd.entries());
        body.patient_id = parseInt(body.patient_id, 10);

        try {
            await medicalRecordsService.store(body);
            window.location.hash = '#/medical-records/manage';
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
        }
    });
}
