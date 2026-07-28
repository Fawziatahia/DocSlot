import { STORAGE_KEYS } from './constants.js';

export const storage = {
    getToken() {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    },

    setToken(token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    },

    removeToken() {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
    },

    getUser() {
        const raw = localStorage.getItem(STORAGE_KEYS.USER);
        return raw ? JSON.parse(raw) : null;
    },

    setUser(user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    },

    removeUser() {
        localStorage.removeItem(STORAGE_KEYS.USER);
    },

    getAbilities() {
        const raw = localStorage.getItem(STORAGE_KEYS.ABILITIES);
        return raw ? JSON.parse(raw) : [];
    },

    setAbilities(abilities) {
        localStorage.setItem(STORAGE_KEYS.ABILITIES, JSON.stringify(abilities));
    },

    removeAbilities() {
        localStorage.removeItem(STORAGE_KEYS.ABILITIES);
    },

    clearAuth() {
        this.removeToken();
        this.removeUser();
        this.removeAbilities();
    },

    isAuthenticated() {
        return !!this.getToken();
    },
};
