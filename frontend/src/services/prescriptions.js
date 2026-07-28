import { api } from './api.js';

export const prescriptionsService = {
    async list(params = {}) {
        return api.get('/prescriptions', { params });
    },

    async myPrescriptions(params = {}) {
        return api.get('/prescriptions/my', { params });
    },

    async show(id) {
        const res = await api.get(`/prescriptions/${id}`);
        return res.data;
    },

    async store(data) {
        const res = await api.post('/prescriptions', data);
        return res.data;
    },

    async update(id, data) {
        const res = await api.put(`/prescriptions/${id}`, data);
        return res.data;
    },

    async destroy(id) {
        await api.delete(`/prescriptions/${id}`);
    },
};
