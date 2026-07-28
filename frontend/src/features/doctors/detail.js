import { doctorsService } from '../../services/doctors.js';
import { renderLoadingSpinner } from '../../components/loading-spinner.js';
import { authService } from '../../services/auth.js';

export function renderDoctorDetail() {
    return `<div id="doctor-detail">${renderLoadingSpinner()}</div>`;
}

export async function initDoctorDetail() {
    const container = document.getElementById('doctor-detail');
    const id = window.__routeParams?.id;
    const user = authService.getUser();
    const isAdmin = user?.role === 'admin';

    if (!id) {
        container.innerHTML = '<div class="alert alert-danger">Doctor not found.</div>';
        return;
    }

    try {
        const d = await doctorsService.show(id);
        const schedules = d.schedules || [];

        container.innerHTML = `
            <a href="#/doctors" class="btn btn-sm btn-outline" style="margin-bottom:1rem">&larr; Back to Doctors</a>
            <div class="card">
                <div class="card-header">
                    <h2>${d.user?.name || 'Unknown'}</h2>
                    <span class="badge ${d.status === 'active' ? 'badge-success' : 'badge-secondary'}">${d.status}</span>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
                    <div>
                        <p><strong>Email:</strong> ${d.user?.email || '—'}</p>
                        <p><strong>Phone:</strong> ${d.user?.phone || '—'}</p>
                        <p><strong>Specialization:</strong> ${d.specialization?.name || '—'}</p>
                        <p><strong>Department:</strong> ${d.department?.name || '—'}</p>
                    </div>
                    <div>
                        <p><strong>License:</strong> ${d.license_number || '—'}</p>
                        <p><strong>Fee:</strong> \$${d.consultation_fee?.toFixed(2) || '0.00'}</p>
                        <p><strong>Rating:</strong> ${d.avg_rating ? d.avg_rating.toFixed(1) + ' / 5 (' + d.total_reviews + ' reviews)' : 'No ratings yet'}</p>
                    </div>
                </div>
                ${d.qualifications ? `<div style="margin-top:1rem"><h3>Qualifications</h3><p>${d.qualifications}</p></div>` : ''}
                ${d.bio ? `<div style="margin-top:1rem"><h3>Bio</h3><p>${d.bio}</p></div>` : ''}
            </div>

            <div class="card" style="margin-top:1.5rem">
                <h3>Weekly Schedule</h3>
                ${schedules.length ? `
                <div class="table-container" style="margin-top:1rem">
                    <table>
                        <thead>
                            <tr>
                                <th>Day</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Slot Duration</th>
                                <th>Max/Day</th>
                                <th>Available</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${schedules.map(s => `
                                <tr>
                                    <td>${s.day_name}</td>
                                    <td>${s.start_time?.substring(0, 5)}</td>
                                    <td>${s.end_time?.substring(0, 5)}</td>
                                    <td>${s.slot_duration} min</td>
                                    <td>${s.max_daily_appointments}</td>
                                    <td>${s.is_available ? '<span class="badge badge-success">Yes</span>' : '<span class="badge badge-secondary">No</span>'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>` : '<p style="margin-top:.75rem;color:var(--color-text-secondary)">No schedule set yet.</p>'}
                ${isAdmin ? `<a href="#/doctors/${id}/schedule" class="btn btn-sm btn-outline" style="margin-top:1rem">Manage Schedule</a>` : ''}
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
}
