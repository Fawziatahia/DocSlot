import { api } from './api.js';

export const notificationsService = {
    async list(params = {}) {
        return api.get('/notifications', { params });
    },

    async unreadCount() {
        const res = await api.get('/notifications/unread-count');
        return res.data;
    },

    async show(id) {
        const res = await api.get(`/notifications/${id}`);
        return res.data;
    },

    async markAsRead(id) {
        const res = await api.post(`/notifications/${id}/read`);
        return res.data;
    },

    async markAllAsRead() {
        const res = await api.post('/notifications/mark-all-read');
        return res.data;
    },
};
