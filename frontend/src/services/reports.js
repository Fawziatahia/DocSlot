import { api } from './api.js';

export const reportsService = {
    appointments(params = {}) {
        return api.get('/reports/appointments', { params });
    },
    revenue(params = {}) {
        return api.get('/reports/revenue', { params });
    },
    doctors(params = {}) {
        return api.get('/reports/doctors', { params });
    },
    patients(params = {}) {
        return api.get('/reports/patients', { params });
    },
    prescriptions(params = {}) {
        return api.get('/reports/prescriptions', { params });
    },
};
