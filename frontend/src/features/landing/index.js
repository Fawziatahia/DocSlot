import { doctorsService } from '../../services/doctors.js';
import { renderLoadingSpinner } from '../../components/loading-spinner.js';

export function renderLanding() {
    return `
    <section class="hero-section">
        <div class="hero-content">
            <div class="hero-badge">Healthcare Management Platform</div>
            <h1 class="hero-title">Your Health,<br><span class="text-gradient">Simplified.</span></h1>
            <p class="hero-subtitle">
                Book appointments with top doctors, manage prescriptions,<br>
                access medical records — all in one place.
            </p>
            <div class="hero-actions">
                <a href="#/register" class="btn btn-primary btn-lg">Get Started</a>
                <a href="#/login" class="btn btn-outline btn-lg">Sign In</a>
            </div>
            <div class="hero-stats">
                <div class="hero-stat">
                    <span class="hero-stat-value">10+</span>
                    <span class="hero-stat-label">Specialists</span>
                </div>
                <div class="hero-stat">
                    <span class="hero-stat-value">50+</span>
                    <span class="hero-stat-label">Doctors</span>
                </div>
                <div class="hero-stat">
                    <span class="hero-stat-value">24/7</span>
                    <span class="hero-stat-label">Access</span>
                </div>
            </div>
        </div>
        <div class="hero-visual">
            <div class="hero-illustration">
                <div class="illo-card illo-card-1">
                    <span class="illo-icon">📅</span>
                    <span>Book Appointment</span>
                </div>
                <div class="illo-card illo-card-2">
                    <span class="illo-icon">👨‍⚕️</span>
                    <span>Find a Doctor</span>
                </div>
                <div class="illo-card illo-card-3">
                    <span class="illo-icon">💊</span>
                    <span>Get Prescription</span>
                </div>
                <div class="illo-circle"></div>
            </div>
        </div>
    </section>

    <section class="features-section">
        <h2 class="section-title">Our Doctors</h2>
        <p class="section-desc">Meet our team of experienced healthcare professionals.</p>
        <div id="landing-doctors-list" class="doctors-grid">${renderLoadingSpinner()}</div>
        <div style="text-align:center;margin-top:2rem">
            <a href="#/doctors" class="btn btn-outline btn-lg">View All Doctors</a>
        </div>
    </section>

    <section class="features-section">
        <h2 class="section-title">Everything you need</h2>
        <p class="section-desc">Manage your healthcare journey from start to finish.</p>
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">📅</div>
                <h3>Smart Booking</h3>
                <p>Book appointments with real-time slot availability. No phone calls needed.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">👨‍⚕️</div>
                <h3>Expert Doctors</h3>
                <p>Browse specialists by department, specialization, and consultation fee.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">💊</div>
                <h3>Digital Prescriptions</h3>
                <p>Receive and view prescriptions digitally with detailed medication info.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">📋</div>
                <h3>Medical Records</h3>
                <p>Access your medical history, lab results, and reports anytime.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">🔔</div>
                <h3>Smart Notifications</h3>
                <p>Get reminders for upcoming appointments and prescription refills.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">📊</div>
                <h3>Insights Dashboard</h3>
                <p>Track your health journey with personalized stats and analytics.</p>
            </div>
        </div>
    </section>

    <section class="cta-section">
        <div class="cta-card">
            <h2>Ready to get started?</h2>
            <p>Join DocSlot today and take control of your healthcare.</p>
            <a href="#/register" class="btn btn-primary btn-lg">Create Free Account</a>
        </div>
    </section>

    <footer class="landing-footer">
        <p>&copy; 2026 DocSlot. All rights reserved.</p>
    </footer>`;
}

export async function initLanding() {
    const container = document.getElementById('landing-doctors-list');
    if (!container) return;

    try {
        const res = await doctorsService.list({ per_page: 8 });
        const items = res.data || [];

        if (!items.length) {
            container.innerHTML = '<div class="empty-state"><p>No doctors available yet.</p></div>';
            return;
        }

        container.innerHTML = items.map(d => `
            <div class="doctor-card">
                <div class="doctor-card-avatar">${(d.user?.name || 'Dr.')?.charAt(0)}</div>
                <h4>${d.user?.name || 'Unknown'}</h4>
                <p class="doctor-card-spec">${d.specialization?.name || '—'}</p>
                <p class="doctor-card-dept">${d.department?.name || ''}</p>
                <p class="doctor-card-qual">${d.qualifications ? d.qualifications.substring(0, 80) : ''}</p>
                <p class="doctor-card-fee"><strong>Fee:</strong> ৳${d.consultation_fee?.toFixed(2) || '0.00'}</p>
                <a href="#/doctors/${d.id}" class="btn btn-sm btn-outline">View Profile</a>
            </div>
        `).join('');
    } catch {
        container.innerHTML = '<div class="empty-state"><p>Could not load doctors. Please try again later.</p></div>';
    }
}
