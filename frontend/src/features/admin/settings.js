import { adminService } from '../../services/admin.js';
import { renderLoadingSpinner } from '../../components/loading-spinner.js';

export function renderSettings() {
    return `
    <div class="page-title">
        <h1>System Settings</h1>
        <p>Configure application settings</p>
    </div>
    <div class="card" style="max-width:600px">
        <div id="settings-form">${renderLoadingSpinner()}</div>
    </div>`;
}

export async function initSettings() {
    const container = document.getElementById('settings-form');

    async function loadSettings() {
        container.innerHTML = renderLoadingSpinner();
        try {
            const res = await adminService.getSettings();
            const s = res.data;

            container.innerHTML = `
                <form id="settings-form-inner">
                    <div class="form-group">
                        <label>Appointment Cutoff (minutes before)</label>
                        <input type="number" name="appointment_cutoff_minutes" class="form-control" value="${s.appointment_cutoff_minutes}" min="15" max="1440" />
                    </div>
                    <div class="form-group">
                        <label>Max Reschedule Count</label>
                        <input type="number" name="max_reschedule_count" class="form-control" value="${s.max_reschedule_count}" min="0" max="10" />
                    </div>
                    <div class="form-group">
                        <label>Reminder Hours Before</label>
                        <input type="number" name="reminder_hours_before" class="form-control" value="${s.reminder_hours_before}" min="1" max="168" />
                    </div>
                    <div class="form-group">
                        <label>Default Slot Duration (minutes)</label>
                        <input type="number" name="default_slot_duration" class="form-control" value="${s.default_slot_duration}" min="15" max="120" />
                    </div>
                    <div class="form-group">
                        <label>Default Max Daily Appointments</label>
                        <input type="number" name="default_max_daily_appointments" class="form-control" value="${s.default_max_daily_appointments}" min="1" max="100" />
                    </div>
                    <div id="settings-error" class="alert alert-danger" style="display:none"></div>
                    <div id="settings-success" class="alert alert-success" style="display:none"></div>
                    <button type="submit" class="btn btn-primary">Save Settings</button>
                </form>
            `;

            document.getElementById('settings-form-inner').addEventListener('submit', async (e) => {
                e.preventDefault();
                const errorEl = document.getElementById('settings-error');
                const successEl = document.getElementById('settings-success');
                errorEl.style.display = 'none';
                successEl.style.display = 'none';

                const fd = new FormData(e.target);
                const body = {};
                for (const [key, value] of fd.entries()) {
                    body[key] = parseInt(value, 10);
                }

                try {
                    await adminService.updateSettings(body);
                    successEl.textContent = 'Settings saved successfully.';
                    successEl.style.display = 'block';
                } catch (err) {
                    errorEl.textContent = err.message;
                    errorEl.style.display = 'block';
                }
            });
        } catch (err) {
            container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        }
    }

    await loadSettings();
}
