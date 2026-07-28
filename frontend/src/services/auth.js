import { api } from './api.js';
import { storage } from '../utils/storage.js';

export const authService = {
    async register(data) {
        const res = await api.post('/auth/register', data);
        storage.setToken(res.data.token);
        storage.setUser(res.data.user);
        storage.setAbilities(res.data.abilities);
        return res.data;
    },

    async login(email, password) {
        const res = await api.post('/auth/login', { email, password });
        storage.setToken(res.data.token);
        storage.setUser(res.data.user);
        storage.setAbilities(res.data.abilities);
        return res.data;
    },

    async me() {
        const res = await api.get('/auth/me');
        storage.setUser(res.data);
        return res.data;
    },

    async logout() {
        await api.post('/auth/logout');
        storage.clearAuth();
    },

    async forgotPassword(email) {
        return api.post('/auth/forgot-password', { email });
    },

    async resetPassword(data) {
        return api.post('/auth/reset-password', data);
    },

    getUser() {
        return storage.getUser();
    },

    isAuthenticated() {
        return storage.isAuthenticated();
    },

    getToken() {
        return storage.getToken();
    },
};
