import { patientsService } from '../../../services/patients.js';
import { appointmentsService } from '../../../services/appointments.js';
import { renderLoadingSpinner } from '../../../components/loading-spinner.js';

export function renderBookAppointment() {
    return `
    <div class="page-title">
        <h1>Book Appointment</h1>
        <p>Find a doctor and book your slot</p>
    </div>
    <div class="card" style="max-width:700px">
        <form id="book-appt-form">
            <div class="form-group">
                <label>Select Doctor</label>
                <select id="book-doctor" name="doctor_id" class="form-control" required>
                    <option value="">Choose a doctor...</option>
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="book-date" name="appointment_date" class="form-control" required />
                </div>
                <div class="form-group">
                    <label>Available Slots</label>
                    <select id="book-time-slot" name="time_slot" class="form-control" required disabled>
                        <option value="">Select date & doctor first</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Reason (optional)</label>
                <textarea name="reason" class="form-control" rows="3" maxlength="500"></textarea>
            </div>
            <div id="book-error" class="alert alert-danger" style="display:none"></div>
            <div id="book-success" class="alert alert-success" style="display:none"></div>
            <button type="submit" id="book-submit-btn" class="btn btn-primary">Book Appointment</button>
            <a href="#/appointments" class="btn btn-outline">Cancel</a>
        </form>
    </div>`;
}

export async function initBookAppointment() {
    const doctorSelect = document.getElementById('book-doctor');
    const dateInput = document.getElementById('book-date');
    const slotSelect = document.getElementById('book-time-slot');
    const errorEl = document.getElementById('book-error');
    const form = document.getElementById('book-appt-form');
    const submitBtn = document.getElementById('book-submit-btn');

    // Set min date to today
    dateInput.min = new Date().toISOString().split('T')[0];

    // Load doctors
    try {
        const res = await patientsService.listDoctors({ per_page: 100 });
        const doctors = res?.data || [];
        doctorSelect.innerHTML = '<option value="">Choose a doctor...</option>' +
            doctors.map(d => `<option value="${d.id}">${d.user?.name || 'Dr. Unknown'} — ${d.specialization?.name || '—'} ($${d.consultation_fee?.toFixed(2) || '0'})</option>`).join('');
    } catch {
        doctorSelect.innerHTML = '<option value="">Failed to load doctors</option>';
    }

    // Load slots when doctor + date selected
    async function loadSlots() {
        const doctorId = doctorSelect.value;
        const date = dateInput.value;
        if (!doctorId || !date) {
            slotSelect.innerHTML = '<option value="">Select date & doctor first</option>';
            slotSelect.disabled = true;
            return;
        }

        slotSelect.innerHTML = '<option value="">Loading slots...</option>';
        slotSelect.disabled = true;

        try {
            const slots = await patientsService.getDoctorSlots(doctorId, date);
            const items = Array.isArray(slots) ? slots : [];

            if (!items.length) {
                slotSelect.innerHTML = '<option value="">No available slots</option>';
                return;
            }

            slotSelect.innerHTML = '<option value="">Choose a time...</option>' +
                items.map(s => {
                    const start = s.start?.substring(0, 5) || '';
                    const end = s.end?.substring(0, 5) || '';
                    return `<option value="${start}__${end}">${start} - ${end}</option>`;
                }).join('');
            slotSelect.disabled = false;
        } catch {
            slotSelect.innerHTML = '<option value="">Failed to load slots</option>';
        }
    }

    doctorSelect.addEventListener('change', loadSlots);
    dateInput.addEventListener('change', loadSlots);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.style.display = 'none';

        const [startTime, endTime] = slotSelect.value.split('__');
        if (!startTime || !endTime) {
            errorEl.textContent = 'Please select a time slot.';
            errorEl.style.display = 'block';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Booking...';

        try {
            await appointmentsService.book({
                doctor_id: parseInt(doctorSelect.value, 10),
                appointment_date: dateInput.value,
                start_time: startTime + ':00',
                end_time: endTime + ':00',
                reason: form.reason.value || undefined,
            });

            errorEl.style.display = 'none';
            const successEl = document.getElementById('book-success');
            successEl.textContent = 'Appointment booked successfully!';
            successEl.style.display = 'block';
            form.reset();
            slotSelect.innerHTML = '<option value="">Select date & doctor first</option>';
            slotSelect.disabled = true;
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Book Appointment';
        }
    });
}
