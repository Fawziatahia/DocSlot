import { api } from "../../lib/api.js";
import { renderMedicalRecordsTable } from "../../components/medical-record-table.js";
import { renderPrescriptionsTable } from "../../components/prescription-table.js";

export async function renderPatientMedicalHistory({ id }) {
  const { data: records } = await api.get(`/patients/${id}/medical-history`, { per_page: 50 });

  return `
    <h2 class="h4 mb-3">Medical History</h2>
    <div class="section-card">
      ${renderMedicalRecordsTable(records, { showDoctor: true })}
    </div>
  `;
}

export async function renderPatientPrescriptionsHistory({ id }) {
  const { data: prescriptions } = await api.get(`/patients/${id}/prescriptions`, { per_page: 50 });

  return `
    <h2 class="h4 mb-3">Prescriptions</h2>
    <div class="section-card">
      ${renderPrescriptionsTable(prescriptions, { showDoctor: true })}
    </div>
  `;
}
