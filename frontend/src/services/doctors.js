import { api } from './api.js';

export const doctorsService = {
    async list(params = {}) {
        const res = await api.get('/doctors', { params });
        return res.data;
    },

    async show(id) {
        const res = await api.get(`/doctors/${id}`);
        return res.data;
    },

    async getSlots(id) {
        const res = await api.get(`/doctors/${id}/slots`);
        return res.data;
    },

    async getSchedule(id) {
        const res = await api.get(`/doctors/${id}/schedule`);
        return res.data;
    },
};
