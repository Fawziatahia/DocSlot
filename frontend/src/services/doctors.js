import { api } from './api.js';

export const doctorsService = {
    async list(params = {}) {
        const res = await api.get('/doctors', { params });
        return res;
    },

    async show(id) {
        const res = await api.get(`/doctors/${id}`);
        return res.data;
    },

    async getSlots(id, date) {
        const res = await api.get(`/doctors/${id}/slots`, { params: { date } });
        return res.data;
    },

    async getSchedule(id) {
        const res = await api.get(`/doctors/${id}/schedule`);
        return res.data;
    },

    async getAppointments(id, params = {}) {
        const res = await api.get(`/doctors/${id}/appointments`, { params });
        return res;
    },

    // Admin-only
    async create(data) {
        const res = await api.post('/doctors', data);
        return res.data;
    },

    async update(id, data) {
        const res = await api.put(`/doctors/${id}`, data);
        return res.data;
    },

    async toggleStatus(id, status) {
        const res = await api.patch(`/doctors/${id}/status`, { status });
        return res.data;
    },

    async delete(id) {
        await api.delete(`/doctors/${id}`);
    },

    async updateSchedule(id, days) {
        const res = await api.put(`/doctors/${id}/schedule`, { days });
        return res.data;
    },
};
