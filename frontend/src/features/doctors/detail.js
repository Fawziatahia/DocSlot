import { doctorsService } from '../../services/doctors.js';
import { renderLoadingSpinner } from '../../components/loading-spinner.js';
import { authService } from '../../services/auth.js';
import { icon } from '../../components/icons.js';

function initials(name = '') {
    return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

function renderStars(rating, size = 14) {
    const filled = Math.round(rating || 0);
    return Array.from({ length: 5 }, (_, i) =>
        icon('star', { size, className: i < filled ? 'star-filled' : 'star-empty' })
    ).join('');
}

export function renderDoctorDetail() {
    return `<div id="doctor-detail">${renderLoadingSpinner()}</div>`;
}

export async function initDoctorDetail() {
    const container = document.getElementById('doctor-detail');
    const id = window.__routeParams?.id;
    const user = authService.getUser();
    const isAdmin = user?.role === 'admin';
    const isPatient = user?.role === 'patient';

    if (!id) {
        container.innerHTML = '<div class="alert alert-danger">Doctor not found.</div>';
        return;
    }

    try {
        const d = await doctorsService.show(id);
        const schedules = d.schedules || [];

        container.innerHTML = `
        <div class="doctor-profile-page">
            <a href="#/doctors" class="doctor-profile-back">${icon('arrow-left', { size: 16 })} Back to Doctors</a>

            <div class="card doctor-profile-card">
                <div class="doctor-profile-topbar">
                    <div class="doctor-profile-identity">
                        <div class="doctor-profile-avatar">${initials(d.user?.name)}</div>
                        <div>
                            <div class="doctor-profile-name-row">
                                <h1>${d.user?.name || 'Unknown'}</h1>
                                <span class="badge ${d.status === 'active' ? 'badge-success' : 'badge-secondary'}">${d.status}</span>
                            </div>
                            <p class="doctor-profile-spec">
                                ${icon('stethoscope', { size: 15 })}
                                ${d.specialization?.name || '—'}${d.department?.name ? ' · ' + d.department.name : ''}
                            </p>
                            <div class="doctor-profile-rating">
                                ${renderStars(d.avg_rating, 15)}
                                <span>${d.avg_rating ? d.avg_rating.toFixed(1) + ' / 5 (' + d.total_reviews + ' reviews)' : 'No ratings yet'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="doctor-profile-actions">
                        ${isPatient ? `<a href="#/appointments/book" class="btn btn-primary">${icon('calendar-plus', { size: 16 })} Book Appointment</a>` : ''}
                        ${isAdmin ? `<a href="#/doctors/${id}/edit" class="btn btn-outline">Edit</a>` : ''}
                        ${isAdmin ? `<a href="#/doctors/${id}/schedule" class="btn btn-outline">${icon('calendar', { size: 16 })} Manage Schedule</a>` : ''}
                    </div>
                </div>

                <div class="doctor-profile-grid">
                    <div>
                        ${d.bio ? `
                        <div class="doctor-profile-section">
                            <h3>${icon('user', { size: 16 })} About</h3>
                            <p>${d.bio}</p>
                        </div>` : ''}
                        ${d.qualifications ? `
                        <div class="doctor-profile-section">
                            <h3>${icon('graduation-cap', { size: 16 })} Qualifications</h3>
                            <p>${d.qualifications}</p>
                        </div>` : ''}
                        ${!d.bio && !d.qualifications ? '<p style="color:var(--color-text-secondary);font-size:.875rem">No additional profile details provided yet.</p>' : ''}
                    </div>
                    <div class="doctor-facts-card">
                        <div class="doctor-facts-card-title">Contact Information</div>
                        <div class="doctor-fact-row">
                            ${icon('mail', { size: 16 })}
                            <div>
                                <div class="doctor-fact-label">Email</div>
                                <div class="doctor-fact-value">${d.user?.email || '—'}</div>
                            </div>
                        </div>
                        <div class="doctor-fact-row">
                            ${icon('phone', { size: 16 })}
                            <div>
                                <div class="doctor-fact-label">Phone</div>
                                <div class="doctor-fact-value">${d.user?.phone || '—'}</div>
                            </div>
                        </div>
                        <div class="doctor-fact-row">
                            ${icon('shield-check', { size: 16 })}
                            <div>
                                <div class="doctor-fact-label">License</div>
                                <div class="doctor-fact-value">${d.license_number || '—'}</div>
                            </div>
                        </div>
                        <div class="doctor-fact-row">
                            ${icon('tag', { size: 16 })}
                            <div>
                                <div class="doctor-fact-label">Consultation Fee</div>
                                <div class="doctor-fact-value">৳${d.consultation_fee?.toFixed(2) || '0.00'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card doctor-schedule-card">
                <h3 style="display:flex;align-items:center;gap:.5rem">${icon('calendar', { size: 17, className: 'page-title-icon' })} Weekly Schedule</h3>
                ${schedules.length ? `
                <div class="doctor-schedule-list">
                    ${schedules.map(s => `
                        <div class="doctor-schedule-row">
                            <span class="doctor-schedule-day">${s.day_name}</span>
                            <span class="doctor-schedule-time">${icon('clock', { size: 14 })} ${s.start_time?.substring(0, 5)} – ${s.end_time?.substring(0, 5)}</span>
                            <span class="doctor-schedule-meta">${s.slot_duration} min slots · max ${s.max_daily_appointments}/day</span>
                            ${s.is_available ? '<span class="badge badge-success">Available</span>' : '<span class="badge badge-secondary">Unavailable</span>'}
                        </div>
                    `).join('')}
                </div>` : '<p style="margin-top:.75rem;color:var(--color-text-secondary);font-size:.875rem">No schedule set yet.</p>'}
            </div>
        </div>
        `;
    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
}
