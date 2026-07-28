export const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const APPOINTMENT_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};

export const ROLES = {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    PATIENT: 'patient',
};

export const GENDERS = ['male', 'female', 'other'];

export const STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'auth_user',
    ABILITIES: 'auth_abilities',
};
