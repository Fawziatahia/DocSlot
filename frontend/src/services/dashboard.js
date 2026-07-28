import { api } from './api.js';

export const dashboardService = {
    admin() {
        return api.get('/dashboard/admin');
    },
    doctor() {
        return api.get('/dashboard/doctor');
    },
    patient() {
        return api.get('/dashboard/patient');
    },
};
