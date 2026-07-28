import { api } from './api.js';

export const medicalRecordsService = {
    list(params = {}) {
        return api.get('/medical-records', { params });
    },

    myRecords(params = {}) {
        return api.get('/medical-records/my', { params });
    },

    show(id) {
        return api.get(`/medical-records/${id}`);
    },

    store(data) {
        return api.post('/medical-records', data);
    },

    update(id, data) {
        return api.put(`/medical-records/${id}`, data);
    },

    destroy(id) {
        return api.delete(`/medical-records/${id}`);
    },
};
