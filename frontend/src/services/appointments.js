import { api } from './api.js';

export const appointmentsService = {
    async list(params = {}) {
        const res = await api.get('/appointments', { params });
        return res.data;
    },

    async myAppointments(params = {}) {
        const res = await api.get('/appointments/my', { params });
        return res.data;
    },

    async show(id) {
        const res = await api.get(`/appointments/${id}`);
        return res.data;
    },

    async book(data) {
        const res = await api.post('/appointments', data);
        return res.data;
    },

    async cancel(id, cancellationReason) {
        const res = await api.post(`/appointments/${id}/cancel`, { cancellation_reason: cancellationReason });
        return res.data;
    },

    async confirm(id) {
        const res = await api.post(`/appointments/${id}/confirm`);
        return res.data;
    },

    async complete(id) {
        const res = await api.post(`/appointments/${id}/complete`);
        return res.data;
    },

    async reschedule(id, data) {
        const res = await api.post(`/appointments/${id}/reschedule`, data);
        return res.data;
    },
};
