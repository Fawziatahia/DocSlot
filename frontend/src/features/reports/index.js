import { reportsService } from '../../services/reports.js';
import { renderLoadingSpinner } from '../../components/loading-spinner.js';

export function renderReports() {
    return `
    <div class="page-title">
        <h1>Reports</h1>
        <p>Analytics and reports across the system</p>
    </div>
    <div class="card" style="margin-bottom:1rem">
        <div style="display:flex;gap:1rem;align-items:end;flex-wrap:wrap">
            <div class="form-group" style="max-width:200px">
                <label>From</label>
                <input type="date" id="report-from" class="form-control" />
            </div>
            <div class="form-group" style="max-width:200px">
                <label>To</label>
                <input type="date" id="report-to" class="form-control" />
            </div>
            <button id="report-filter-btn" class="btn btn-primary">Apply</button>
        </div>
    </div>
    <div style="display:flex;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap">
        <button class="btn report-tab active" data-tab="appointments">Appointments</button>
        <button class="btn report-tab" data-tab="revenue">Revenue</button>
        <button class="btn report-tab" data-tab="doctors">Doctors</button>
        <button class="btn report-tab" data-tab="patients">Patients</button>
        <button class="btn report-tab" data-tab="prescriptions">Prescriptions</button>
    </div>
    <div class="card">
        <div id="report-content">${renderLoadingSpinner()}</div>
    </div>`;
}

export async function initReports() {
    const content = document.getElementById('report-content');
    const fromInput = document.getElementById('report-from');
    const toInput = document.getElementById('report-to');
    const filterBtn = document.getElementById('report-filter-btn');
    let currentTab = 'appointments';

    const tabs = document.querySelectorAll('.report-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tab.dataset.tab;
            loadReport(currentTab);
        });
    });

    async function loadReport(tab) {
        content.innerHTML = renderLoadingSpinner();
        try {
            const params = {};
            if (fromInput?.value) params.from = fromInput.value;
            if (toInput?.value) params.to = toInput.value;

            const data = {
                appointments: await reportsService.appointments(params),
                revenue: await reportsService.revenue(params),
                doctors: await reportsService.doctors(params),
                patients: await reportsService.patients(params),
                prescriptions: await reportsService.prescriptions(params),
            }[tab];

            const reportData = data?.data;

            const renderers = {
                appointments: () => {
                    const d = reportData;
                    return `
                        <h3>Appointment Report</h3>
                        <div class="stats-grid" style="margin-top:1rem">
                            <div class="stat-card"><div class="stat-value">${d?.total_appointments || 0}</div><div class="stat-label">Total Appointments</div></div>
                            ${Object.entries(d?.by_status || {}).map(([status, count]) => `
                                <div class="stat-card"><div class="stat-value">${count}</div><div class="stat-label" style="text-transform:capitalize">${status.replace(/_/g, ' ')}</div></div>
                            `).join('')}
                        </div>
                        ${renderPeriod(d?.period)}
                    `;
                },
                revenue: () => {
                    const d = reportData;
                    return `
                        <h3>Revenue Report</h3>
                        <div class="stats-grid" style="margin-top:1rem">
                            <div class="stat-card"><div class="stat-value">৳${(d?.total_revenue || 0).toFixed(2)}</div><div class="stat-label">Total Revenue</div></div>
                            <div class="stat-card"><div class="stat-value">${d?.total_completed_appointments || 0}</div><div class="stat-label">Completed Appointments</div></div>
                        </div>
                        ${renderPeriod(d?.period)}
                    `;
                },
                doctors: () => {
                    const d = reportData;
                    const doctors = d?.doctors || [];
                    return `
                        <h3>Doctor Report</h3>
                        ${doctors.length ? `
                        <div class="table-container" style="margin-top:1rem">
                            <table>
                                <thead><tr><th>Doctor</th><th>Total Appointments</th><th>Completed</th></tr></thead>
                                <tbody>${doctors.map(dr => `
                                    <tr><td>${dr.doctor_name || 'Unknown'}</td><td>${dr.total_appointments}</td><td>${dr.completed_appointments}</td></tr>
                                `).join('')}</tbody>
                            </table>
                        </div>` : '<p style="margin-top:1rem;color:var(--color-text-secondary)">No data for this period.</p>'}
                        ${renderPeriod(d?.period)}
                    `;
                },
                patients: () => {
                    const d = reportData;
                    const patients = d?.top_patients || [];
                    return `
                        <h3>Patient Report</h3>
                        ${patients.length ? `
                        <div class="table-container" style="margin-top:1rem">
                            <table>
                                <thead><tr><th>#</th><th>Patient</th><th>Total Appointments</th></tr></thead>
                                <tbody>${patients.map((p, i) => `
                                    <tr><td>${i + 1}</td><td>${p.patient_name || 'Unknown'}</td><td>${p.total_appointments}</td></tr>
                                `).join('')}</tbody>
                            </table>
                        </div>` : '<p style="margin-top:1rem;color:var(--color-text-secondary)">No data for this period.</p>'}
                        ${renderPeriod(d?.period)}
                    `;
                },
                prescriptions: () => {
                    const d = reportData;
                    return `
                        <h3>Prescription Report</h3>
                        <div class="stats-grid" style="margin-top:1rem">
                            <div class="stat-card"><div class="stat-value">${d?.total_prescriptions || 0}</div><div class="stat-label">Total Prescriptions</div></div>
                        </div>
                        ${renderPeriod(d?.period)}
                    `;
                },
            };

            content.innerHTML = renderers[tab]?.() || '<p>Unknown report type.</p>';
        } catch (err) {
            content.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        }
    }

    function renderPeriod(period) {
        if (!period) return '';
        const parts = [];
        if (period.from) parts.push(`From: ${period.from}`);
        if (period.to) parts.push(`To: ${period.to}`);
        if (!parts.length) return '';
        return `<p style="margin-top:1rem;font-size:.8125rem;color:var(--color-text-secondary)">${parts.join(' · ')}</p>`;
    }

    filterBtn?.addEventListener('click', () => loadReport(currentTab));

    // Make tab buttons look active
    document.addEventListener('click', (e) => {
        const tab = e.target.closest('.report-tab');
        if (tab) {
            document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        }
    });

    await loadReport('appointments');
}
