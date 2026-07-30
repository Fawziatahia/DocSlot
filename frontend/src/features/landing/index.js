import { doctorsService } from '../../services/doctors.js';
import { adminService } from '../../services/admin.js';
import { renderLoadingSpinner } from '../../components/loading-spinner.js';
import { icon } from '../../components/icons.js';
import { setDoctorSearchIntent } from '../../utils/doctor-search-intent.js';

// `stem` matches against real specialization names (e.g. "Orthopedic Surgeon", "Cardiologist"),
// which don't share a common full word — match on the shared root instead of the full name.
const SYMPTOM_MAP = [
    { stem: 'ortho', label: 'Orthopedics', keywords: ['broken bone', 'fracture', 'bone pain', 'joint pain', 'back pain', 'sprain', 'knee pain'] },
    { stem: 'cardio', label: 'Cardiology', keywords: ['chest pain', 'heart', 'palpitation', 'high blood pressure', 'blood pressure'] },
    { stem: 'derma', label: 'Dermatology', keywords: ['skin rash', 'rash', 'acne', 'itching', 'skin'] },
    { stem: 'ophthalm', label: 'Ophthalmology', keywords: ['blurry vision', 'eye pain', 'vision', 'red eye'] },
    { stem: 'neuro', label: 'Neurology', keywords: ['headache', 'migraine', 'dizziness', 'numbness', 'seizure'] },
    { stem: 'pulmo', label: 'Pulmonology', keywords: ['shortness of breath', 'breathing', 'asthma', 'wheeze', 'cough'] },
    { stem: 'ent', label: 'ENT', keywords: ['ear pain', 'sore throat', 'hearing', 'sinus', 'throat'] },
    { stem: 'medicine', label: 'General Medicine', keywords: ['fever', 'flu', 'cold', 'body ache', 'weakness', 'tired', 'nausea'] },
];

const SYMPTOM_CHIPS = ['Broken bone', 'Fever', 'Chest pain', 'Skin rash', 'Blurry vision', 'Headache', 'Sore throat'];

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

function initials(name = '') {
    return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

function renderStars(rating, size = 14) {
    const filled = Math.round(rating || 0);
    return Array.from({ length: 5 }, (_, i) =>
        icon('star', { size, className: i < filled ? 'star-filled' : 'star-empty' })
    ).join('');
}

function renderDoctorBadges(d) {
    const badges = [];
    if (d.status === 'active') badges.push('<span class="badge-pill badge-pill-verified">Verified</span>');
    if (d.avg_rating >= 4.5) badges.push('<span class="badge-pill badge-pill-top">Top Rated</span>');
    return badges.join('');
}

function renderDoctorCard(d) {
    return `
    <div class="top-doctor-card">
        <div class="top-doctor-avatar">${initials(d.user?.name)}</div>
        <h4>${d.user?.name || 'Unknown'}</h4>
        <p class="top-doctor-spec">${d.specialization?.name || '—'}</p>
        <div class="top-doctor-rating">
            ${renderStars(d.avg_rating)}
            <span>${d.avg_rating ? d.avg_rating.toFixed(1) : '—'} (${d.total_reviews || 0})</span>
        </div>
        <div class="top-doctor-badges">${renderDoctorBadges(d)}</div>
        <p class="top-doctor-fee"><strong>Fee:</strong> ৳${d.consultation_fee?.toFixed(2) || '0.00'}</p>
        <div class="top-doctor-actions">
            <a href="#/register" class="btn btn-primary btn-sm">Book Appointment</a>
            <a href="#/doctors/${d.id}" class="btn btn-outline btn-sm">View Profile</a>
        </div>
    </div>`;
}

function renderFeaturedDoctor(d) {
    if (!d) return '<div class="empty-state"><p>No doctors available yet.</p></div>';
    return `
    <div class="featured-doctor-header">
        <div class="featured-doctor-avatar">${initials(d.user?.name)}</div>
        <div>
            <h4>${d.user?.name || 'Unknown'}</h4>
            <p class="featured-doctor-spec">${d.specialization?.name || '—'}</p>
            <div class="top-doctor-rating">
                ${renderStars(d.avg_rating)}
                <span>${d.avg_rating ? d.avg_rating.toFixed(1) : '—'} (${d.total_reviews || 0} reviews)</span>
            </div>
        </div>
    </div>
    <div class="featured-doctor-meta">
        <span>${icon('tag', { size: 14 })} ৳${d.consultation_fee?.toFixed(2) || '0.00'} per visit</span>
        ${d.department?.name ? `<span>${icon('map-pin', { size: 14 })} ${d.department.name}</span>` : ''}
    </div>
    <div class="featured-doctor-actions">
        <a href="#/register" class="btn btn-primary btn-block">Book Appointment</a>
        <a href="#/doctors/${d.id}" class="btn btn-outline btn-block">View Profile</a>
    </div>`;
}

export function renderLanding() {
    return `
    <section class="hero-section">
        <div class="hero-inner">
            <div class="hero-content">
                <div class="hero-badge">${icon('shield-check', { size: 14 })} Healthcare Management Platform</div>
                <h1 class="hero-title">Your Health,<br>Scheduled.</h1>
                <p class="hero-subtitle">
                    Book with top specialists in seconds. No waiting rooms, no phone calls — just care.
                </p>
                <div class="hero-actions">
                    <a href="#/register" class="btn btn-primary btn-lg">Book Appointment</a>
                    <button type="button" id="hero-check-symptoms-btn" class="btn btn-outline-light btn-lg">
                        Check Symptoms ${icon('arrow-right', { size: 16 })}
                    </button>
                </div>
                <div class="hero-stats">
                    <div class="hero-stat"><span class="hero-stat-value">500+</span><span class="hero-stat-label">Verified Doctors</span></div>
                    <div class="hero-stat"><span class="hero-stat-value">50,000+</span><span class="hero-stat-label">Happy Patients</span></div>
                    <div class="hero-stat"><span class="hero-stat-value">30+</span><span class="hero-stat-label">Specialties</span></div>
                    <div class="hero-stat"><span class="hero-stat-value">4.9${icon('star', { size: 16, className: 'star-filled' })}</span><span class="hero-stat-label">Average Rating</span></div>
                </div>
            </div>
            <div class="hero-visual">
                <div class="hero-search-card">
                    <h3 class="hero-search-card-title">Find Your Doctor</h3>
                    <div class="hero-search-box">
                        ${icon('search', { size: 18 })}
                        <input type="text" id="hero-search-input" placeholder="Search doctors, specialties..." />
                    </div>
                    <div class="hero-search-pills" id="hero-search-pills"></div>
                    <div class="hero-featured-doctor" id="hero-featured-doctor">${renderLoadingSpinner()}</div>
                </div>
            </div>
        </div>
    </section>

    <section class="how-it-works-section">
        <h2 class="section-title">How DocSlot Works</h2>
        <p class="section-desc">Book your appointment in 3 simple steps</p>
        <div class="how-it-works-grid">
            <div class="how-it-works-card">
                <div class="how-it-works-num">1</div>
                <div class="how-it-works-icon">${icon('search', { size: 22 })}</div>
                <h3>Search &amp; Choose</h3>
                <p>Browse doctors by specialty, location, or name. View profiles, ratings, and consultation fees.</p>
            </div>
            <div class="how-it-works-card">
                <div class="how-it-works-num">2</div>
                <div class="how-it-works-icon">${icon('calendar-plus', { size: 22 })}</div>
                <h3>Pick a Time Slot</h3>
                <p>See the doctor's live availability calendar. Select a date and time that works for you.</p>
            </div>
            <div class="how-it-works-card">
                <div class="how-it-works-num">3</div>
                <div class="how-it-works-icon">${icon('check-circle', { size: 22 })}</div>
                <h3>Confirm &amp; Get Care</h3>
                <p>Get instant confirmation with your booking ID. Arrive and receive the care you need.</p>
            </div>
        </div>
    </section>

    <section class="specialty-section">
        <h2 class="section-title">Browse by Specialty</h2>
        <p class="section-desc">Find the right specialist for your needs</p>
        <div class="specialty-grid" id="specialty-grid">${renderLoadingSpinner()}</div>
    </section>

    <section class="features-section">
        <h2 class="section-title">Top Rated Doctors</h2>
        <p class="section-desc">Trusted by thousands of patients</p>
        <div class="top-doctors-grid" id="top-doctors-grid">${renderLoadingSpinner()}</div>
        <div style="text-align:center;margin-top:2rem">
            <a href="#/doctors" class="btn btn-outline btn-lg">View All Doctors</a>
        </div>
    </section>

    <section class="symptom-section" id="symptom-checker-section">
        <div class="symptom-card">
            <div class="symptom-card-text">
                <h2>Not sure which doctor to see?</h2>
                <p>Tell us what you're feeling and we'll point you to the right specialist. No medical knowledge required.</p>
                <div class="symptom-chips" id="symptom-chips">
                    ${SYMPTOM_CHIPS.map(c => `<button type="button" class="symptom-chip" data-symptom="${c}">${c}</button>`).join('')}
                </div>
                <div class="symptom-input-row">
                    <input type="text" id="symptom-input" placeholder="Describe how you feel, e.g. fever, chest pain..." />
                    <button type="button" id="symptom-check-btn" class="btn btn-primary">Check Symptoms Now</button>
                </div>
                <div id="symptom-result"></div>
            </div>
        </div>
    </section>

    <section class="testimonials-section">
        <h2 class="section-title">What Patients Say</h2>
        <p class="section-desc">Real experiences from our community</p>
        <div class="testimonial-grid">
            <div class="testimonial-card">
                <div class="testimonial-stars">${renderStars(5)}</div>
                <p class="testimonial-quote">"DocSlot saved me so much time. I found a cardiologist and booked for the same day. The whole process took 3 minutes!"</p>
                <div class="testimonial-author">
                    <div class="testimonial-avatar">AS</div>
                    <div><strong>Anika Sultana</strong><span>Patient, Dhaka</span></div>
                </div>
            </div>
            <div class="testimonial-card">
                <div class="testimonial-stars">${renderStars(5)}</div>
                <p class="testimonial-quote">"The symptom checker is brilliant. I had no idea I needed a neurologist — it figured it out from my description alone."</p>
                <div class="testimonial-author">
                    <div class="testimonial-avatar">MV</div>
                    <div><strong>Mikko Virtanen</strong><span>Patient, Helsinki</span></div>
                </div>
            </div>
            <div class="testimonial-card">
                <div class="testimonial-stars">${renderStars(5)}</div>
                <p class="testimonial-quote">"Real ratings and reviews before booking gave me real confidence. My doctor was exactly as described."</p>
                <div class="testimonial-author">
                    <div class="testimonial-avatar">LH</div>
                    <div><strong>Layla Hassan</strong><span>Patient, Tampere</span></div>
                </div>
            </div>
        </div>
    </section>

    <section class="cta-section">
        <div class="cta-card">
            <h2>Ready to book your appointment?</h2>
            <p>Join thousands of patients who trust DocSlot for their healthcare.</p>
            <div class="cta-card-actions">
                <a href="#/register" class="btn btn-lg cta-btn-light">Get Started Free</a>
                <a href="#/doctors" class="btn btn-outline-light btn-lg">Browse Doctors</a>
            </div>
        </div>
    </section>

    <footer class="landing-footer">
        <div class="landing-footer-grid">
            <div class="footer-brand">
                <span class="guest-brand">DocSlot</span>
                <p>Making healthcare accessible for everyone.</p>
            </div>
            <div class="footer-col">
                <h4>For Patients</h4>
                <a href="#/doctors">Find Doctors</a>
                <a href="#/register">Book Appointment</a>
                <a href="#/appointments">My Appointments</a>
            </div>
            <div class="footer-col">
                <h4>For Doctors</h4>
                <a href="#/login">Doctor Login</a>
                <a href="#/login">Manage Schedule</a>
            </div>
        </div>
        <p class="landing-footer-copy">&copy; 2026 DocSlot. All rights reserved.</p>
    </footer>`;
}

export async function initLanding() {
    let specializations = [];
    let doctors = [];

    try {
        const specRes = await adminService.listSpecializations({ per_page: 100 });
        specializations = (specRes.data || []).filter(s => s.is_active !== false);
    } catch {}

    try {
        const docRes = await doctorsService.list({ per_page: 12 });
        doctors = docRes.data || [];
    } catch {}

    renderHeroSearchCard(specializations, doctors);
    renderSpecialtyGrid(specializations);
    renderTopDoctors(doctors);
    bindHeroSearch();
    bindSymptomChecker(specializations);

    document.getElementById('hero-check-symptoms-btn')?.addEventListener('click', () => {
        document.getElementById('symptom-checker-section')?.scrollIntoView({ behavior: 'smooth' });
    });
}

function renderHeroSearchCard(specializations, doctors) {
    const pillsEl = document.getElementById('hero-search-pills');
    if (pillsEl) {
        pillsEl.innerHTML = specializations.slice(0, 5).map(s =>
            `<button type="button" class="hero-search-pill" data-spec-id="${s.id}">${s.name}</button>`
        ).join('');
        pillsEl.querySelectorAll('.hero-search-pill').forEach(btn => {
            btn.addEventListener('click', () => goToDoctors({ specialization_id: btn.dataset.specId }));
        });
    }

    const featured = [...doctors].sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))[0];
    const featuredEl = document.getElementById('hero-featured-doctor');
    if (featuredEl) featuredEl.innerHTML = renderFeaturedDoctor(featured);
}

function renderSpecialtyGrid(specializations) {
    const grid = document.getElementById('specialty-grid');
    if (!grid) return;

    if (!specializations.length) {
        grid.innerHTML = '<div class="empty-state"><p>No specialties available yet.</p></div>';
        return;
    }

    grid.innerHTML = specializations.slice(0, 8).map(s => `
        <div class="specialty-card">
            <div class="specialty-icon">${icon(specialtyIcon(s.name), { size: 22 })}</div>
            <h4>${s.name}</h4>
            <p class="specialty-count">${s.doctors_count ?? 0} Doctors</p>
            <button type="button" class="btn btn-outline btn-sm browse-specialty-btn" data-spec-id="${s.id}">
                Browse Doctors ${icon('arrow-right', { size: 14 })}
            </button>
        </div>
    `).join('');

    grid.querySelectorAll('.browse-specialty-btn').forEach(btn => {
        btn.addEventListener('click', () => goToDoctors({ specialization_id: btn.dataset.specId }));
    });
}

function renderTopDoctors(doctors) {
    const grid = document.getElementById('top-doctors-grid');
    if (!grid) return;

    if (!doctors.length) {
        grid.innerHTML = '<div class="empty-state"><p>No doctors available yet.</p></div>';
        return;
    }

    const top = [...doctors].sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0)).slice(0, 4);
    grid.innerHTML = top.map(renderDoctorCard).join('');
}

function bindHeroSearch() {
    const input = document.getElementById('hero-search-input');
    input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
            goToDoctors({ q: input.value.trim() });
        }
    });
}

function bindSymptomChecker(specializations) {
    const input = document.getElementById('symptom-input');
    const chipsEl = document.getElementById('symptom-chips');
    const resultEl = document.getElementById('symptom-result');
    const checkBtn = document.getElementById('symptom-check-btn');

    function matchSpecialization(text) {
        const t = text.toLowerCase();
        for (const entry of SYMPTOM_MAP) {
            if (entry.keywords.some(k => t.includes(k))) {
                const match = specializations.find(s => s.name.toLowerCase().includes(entry.stem));
                return match || { name: entry.label, id: null };
            }
        }
        return null;
    }

    function runCheck(text) {
        if (!text.trim() || !resultEl) return;
        const match = matchSpecialization(text);
        if (!match) {
            resultEl.innerHTML = `
                <div class="symptom-result-box">
                    <p>We couldn't match that to a specific specialty. Browse all our doctors instead.</p>
                    <button type="button" class="btn btn-primary btn-sm" id="symptom-browse-all">Browse All Doctors</button>
                </div>`;
            document.getElementById('symptom-browse-all')?.addEventListener('click', () => goToDoctors({}));
            return;
        }
        resultEl.innerHTML = `
            <div class="symptom-result-box">
                <p>Recommended specialist: <strong>${match.name}</strong></p>
                <button type="button" class="btn btn-primary btn-sm" id="symptom-go-btn">Find ${match.name} Doctors</button>
            </div>`;
        document.getElementById('symptom-go-btn')?.addEventListener('click', () => {
            goToDoctors(match.id ? { specialization_id: match.id } : {});
        });
    }

    chipsEl?.querySelectorAll('.symptom-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            if (input) input.value = chip.dataset.symptom;
            runCheck(chip.dataset.symptom);
        });
    });

    checkBtn?.addEventListener('click', () => runCheck(input?.value || ''));
    input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') runCheck(input.value);
    });
}

function goToDoctors(intent) {
    setDoctorSearchIntent(intent);
    window.location.hash = '#/doctors';
}
