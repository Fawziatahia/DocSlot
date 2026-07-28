export function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password) {
    if (!password || password.length < 8) {
        return 'Password must be at least 8 characters.';
    }
    return null;
}

export function validateRequired(value, fieldName) {
    if (!value || !value.trim()) {
        return `${fieldName} is required.`;
    }
    return null;
}

export function validatePhone(phone) {
    if (!phone) return null;
    return /^[\d\-+() ]{7,20}$/.test(phone) ? null : 'Invalid phone number.';
}

export function getFormData(form) {
    const data = {};
    const fd = new FormData(form);
    for (const [key, value] of fd.entries()) {
        data[key] = value;
    }
    return data;
}

export function getValidationErrors(response) {
    if (response.errors && typeof response.errors === 'object') {
        return Object.values(response.errors).flat().join(' ');
    }
    return response.message || 'An error occurred.';
}
