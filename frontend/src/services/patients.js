import { api } from './api.js';

export const patientsService = {
    // Patient profile
    show(id) {
        return api.get(`/patients/${id}`);
    },
    update(id, data) {
        return api.put(`/patients/${id}`, data);
    },

    // Dashboard stats
    dashboard() {
        return api.get('/dashboard/patient');
    },

    // Book appointment (requires doctor lookup)
    listDoctors(params = {}) {
        return api.get('/doctors', { params });
    },
    getDoctorSlots(doctorId, date) {
        return api.get(`/doctors/${doctorId}/slots`, { params: { date } });
    },
};
