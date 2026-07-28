import { doctorsService } from '../../services/doctors.js';
import { renderLoadingSpinner } from '../../components/loading-spinner.js';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function renderDoctorSchedule() {
    return `<div id="schedule-container">${renderLoadingSpinner()}</div>`;
}

export async function initDoctorSchedule() {
    const container = document.getElementById('schedule-container');
    const id = window.__routeParams?.id;

    if (!id) {
        container.innerHTML = '<div class="alert alert-danger">Doctor not found.</div>';
        return;
    }

    async function loadSchedule() {
        container.innerHTML = renderLoadingSpinner();
        try {
            const schedules = await doctorsService.getSchedule(id);
            const scheduleMap = {};
            (schedules || []).forEach(s => { scheduleMap[s.day_of_week] = s; });

            container.innerHTML = `
                <a href="#/doctors/${id}" class="btn btn-sm btn-outline" style="margin-bottom:1rem">&larr; Back</a>
                <div class="card" style="max-width:800px">
                    <div class="card-header">
                        <h2>Manage Schedule</h2>
                    </div>
                    <form id="schedule-form">
                        ${[0,1,2,3,4,5,6].map(day => {
                            const s = scheduleMap[day] || {};
                            return `
                            <div class="schedule-day" style="display:flex;align-items:center;gap:1rem;padding:.75rem 0;border-bottom:1px solid var(--color-border-light)">
                                <div style="min-width:100px;font-weight:600">${DAY_NAMES[day]}</div>
                                <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
                                    <input type="time" name="days[${day}][start_time]" class="form-control" style="width:130px" value="${s.start_time?.substring(0,5) || '09:00'}" />
                                    <span>to</span>
                                    <input type="time" name="days[${day}][end_time]" class="form-control" style="width:130px" value="${s.end_time?.substring(0,5) || '17:00'}" />
                                    <input type="number" name="days[${day}][slot_duration]" class="form-control" style="width:80px" placeholder="min" value="${s.slot_duration || 30}" min="15" max="120" />
                                    <span style="font-size:.8125rem;color:var(--color-text-secondary)">min</span>
                                    <input type="number" name="days[${day}][max_daily_appointments]" class="form-control" style="width:80px" value="${s.max_daily_appointments || 10}" min="1" max="100" />
                                    <label style="font-size:.8125rem;display:flex;align-items:center;gap:.25rem">
                                        <input type="checkbox" name="days[${day}][is_available]" value="1" ${s.is_available !== false ? 'checked' : ''} /> Active
                                    </label>
                                    <input type="hidden" name="days[${day}][day_of_week]" value="${day}" />
                                </div>
                            </div>`;
                        }).join('')}
                        <div id="schedule-error" class="alert alert-danger" style="display:none;margin-top:1rem"></div>
                        <div style="margin-top:1rem;display:flex;gap:.5rem">
                            <button type="submit" class="btn btn-primary">Save Schedule</button>
                            <a href="#/doctors/${id}" class="btn btn-outline">Cancel</a>
                        </div>
                    </form>
                </div>
            `;

            document.getElementById('schedule-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const errorEl = document.getElementById('schedule-error');
                errorEl.style.display = 'none';
                const fd = new FormData(e.target);
                const days = [];
                for (let day = 0; day < 7; day++) {
                    const start = fd.get(`days[${day}][start_time]`);
                    const end = fd.get(`days[${day}][end_time]`);
                    if (!start && !end) continue;
                    days.push({
                        day_of_week: day,
                        start_time: start,
                        end_time: end,
                        slot_duration: parseInt(fd.get(`days[${day}][slot_duration]`)) || 30,
                        max_daily_appointments: parseInt(fd.get(`days[${day}][max_daily_appointments]`)) || 10,
                        is_available: fd.get(`days[${day}][is_available]`) === '1',
                    });
                }
                try {
                    await doctorsService.updateSchedule(id, days);
                    window.location.hash = `#/doctors/${id}`;
                } catch (err) {
                    errorEl.textContent = err.message;
                    errorEl.style.display = 'block';
                }
            });
        } catch (err) {
            container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        }
    }

    await loadSchedule();
}
