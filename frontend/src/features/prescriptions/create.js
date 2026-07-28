import { prescriptionsService } from '../../services/prescriptions.js';
import { renderLoadingSpinner } from '../../components/loading-spinner.js';

let medicationCount = 0;

export function renderCreatePrescription() {
    return `
    <div class="page-title">
        <h1>New Prescription</h1>
        <p>Create a prescription for a patient</p>
    </div>
    <div class="card" style="max-width:800px">
        <form id="create-prescription-form">
            <div class="form-group">
                <label>Patient</label>
                <select name="patient_id" id="rx-patient-select" class="form-control" required>
                    <option value="">Select patient...</option>
                </select>
            </div>
            <div class="form-group">
                <label>Diagnosis</label>
                <textarea name="diagnosis" class="form-control" rows="3" required></textarea>
            </div>
            <div class="form-group">
                <label>Notes (optional)</label>
                <textarea name="notes" class="form-control" rows="2"></textarea>
            </div>
            <h3 style="margin-top:1.5rem">Medications</h3>
            <div id="medications-container">
                <div class="medication-row" data-index="0" style="border:1px solid var(--color-border-light);padding:.75rem;border-radius:var(--radius);margin-top:.5rem">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Medication Name</label>
                            <input type="text" name="medications[0][medication_name]" class="form-control" required />
                        </div>
                        <div class="form-group">
                            <label>Dosage</label>
                            <input type="text" name="medications[0][dosage]" class="form-control" required placeholder="e.g. 500mg" />
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Frequency</label>
                            <input type="text" name="medications[0][frequency]" class="form-control" required placeholder="e.g. 3x daily" />
                        </div>
                        <div class="form-group">
                            <label>Duration</label>
                            <input type="text" name="medications[0][duration]" class="form-control" placeholder="e.g. 7 days" />
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Instructions (optional)</label>
                        <textarea name="medications[0][instructions]" class="form-control" rows="2"></textarea>
                    </div>
                </div>
            </div>
            <button type="button" id="add-medication-btn" class="btn btn-outline btn-sm" style="margin-top:.5rem">+ Add Medication</button>
            <div id="rx-error" class="alert alert-danger" style="display:none;margin-top:1rem"></div>
            <div style="display:flex;gap:.5rem;margin-top:1rem">
                <button type="submit" class="btn btn-primary">Create Prescription</button>
                <a href="#/prescriptions/manage" class="btn btn-outline">Cancel</a>
            </div>
        </form>
    </div>`;
}

export async function initCreatePrescription() {
    const form = document.getElementById('create-prescription-form');
    const errorEl = document.getElementById('rx-error');
    const patientSelect = document.getElementById('rx-patient-select');
    const addMedBtn = document.getElementById('add-medication-btn');
    const medContainer = document.getElementById('medications-container');
    medicationCount = 1;

    // Load patients
    try {
        const { api } = await import('../../services/api.js');
        const res = await api.get('/patients', { params: { per_page: 100 } });
        const patients = res?.data || [];
        patientSelect.innerHTML = '<option value="">Select patient...</option>' +
            patients.map(p => `<option value="${p.id}">${p.user?.name || 'Unknown'} (${p.user?.email || '—'})</option>`).join('');
    } catch {
        patientSelect.innerHTML = '<option value="">Failed to load patients</option>';
    }

    addMedBtn.addEventListener('click', () => {
        const idx = medicationCount++;
        const div = document.createElement('div');
        div.className = 'medication-row';
        div.dataset.index = idx;
        div.style.cssText = 'border:1px solid var(--color-border-light);padding:.75rem;border-radius:var(--radius);margin-top:.5rem';
        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">
                <strong>Medication #${idx + 1}</strong>
                <button type="button" class="btn btn-sm btn-danger remove-medication" data-index="${idx}">Remove</button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Medication Name</label>
                    <input type="text" name="medications[${idx}][medication_name]" class="form-control" required />
                </div>
                <div class="form-group">
                    <label>Dosage</label>
                    <input type="text" name="medications[${idx}][dosage]" class="form-control" required placeholder="e.g. 500mg" />
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Frequency</label>
                    <input type="text" name="medications[${idx}][frequency]" class="form-control" required placeholder="e.g. 3x daily" />
                </div>
                <div class="form-group">
                    <label>Duration</label>
                    <input type="text" name="medications[${idx}][duration]" class="form-control" placeholder="e.g. 7 days" />
                </div>
            </div>
            <div class="form-group">
                <label>Instructions (optional)</label>
                <textarea name="medications[${idx}][instructions]" class="form-control" rows="2"></textarea>
            </div>
        `;
        medContainer.appendChild(div);

        div.querySelector('.remove-medication').addEventListener('click', () => div.remove());
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.style.display = 'none';
        const fd = new FormData(form);

        // Build medications array
        const medications = [];
        const seen = new Set();
        for (const [key, value] of fd.entries()) {
            const match = key.match(/^medications\[(\d+)\]\[(\w+)\]$/);
            if (match) {
                const idx = match[1];
                const field = match[2];
                if (!seen.has(idx)) {
                    seen.add(idx);
                    medications[idx] = medications[idx] || {};
                }
                medications[idx][field] = value;
            }
        }

        const body = {
            patient_id: parseInt(fd.get('patient_id'), 10),
            diagnosis: fd.get('diagnosis'),
            notes: fd.get('notes') || undefined,
            medications: medications.filter(Boolean),
        };

        try {
            await prescriptionsService.store(body);
            window.location.hash = '#/prescriptions/manage';
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
        }
    });
}
