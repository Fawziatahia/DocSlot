import { api } from './api.js';

export const adminService = {
    // Users
    listUsers(params = {}) {
        return api.get('/admin/users', { params });
    },
    showUser(id) {
        return api.get(`/admin/users/${id}`);
    },
    toggleUserStatus(id) {
        return api.patch(`/admin/users/${id}/status`);
    },
    deleteUser(id) {
        return api.delete(`/admin/users/${id}`);
    },

    // Departments
    listDepartments(params = {}) {
        return api.get('/departments', { params });
    },
    showDepartment(id) {
        return api.get(`/departments/${id}`);
    },
    createDepartment(data) {
        return api.post('/departments', data);
    },
    updateDepartment(id, data) {
        return api.put(`/departments/${id}`, data);
    },
    toggleDepartmentStatus(id) {
        return api.patch(`/departments/${id}/status`);
    },
    deleteDepartment(id) {
        return api.delete(`/departments/${id}`);
    },

    // Specializations
    listSpecializations(params = {}) {
        return api.get('/specializations', { params });
    },
    showSpecialization(id) {
        return api.get(`/specializations/${id}`);
    },
    createSpecialization(data) {
        return api.post('/specializations', data);
    },
    updateSpecialization(id, data) {
        return api.put(`/specializations/${id}`, data);
    },
    toggleSpecializationStatus(id) {
        return api.patch(`/specializations/${id}/status`);
    },
    deleteSpecialization(id) {
        return api.delete(`/specializations/${id}`);
    },

    // Settings
    getSettings() {
        return api.get('/admin/settings');
    },
    updateSettings(data) {
        return api.put('/admin/settings', data);
    },
};
