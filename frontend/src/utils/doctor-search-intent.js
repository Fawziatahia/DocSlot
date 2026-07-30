const STORAGE_KEY = 'docslot_doctor_search_intent';

export function setDoctorSearchIntent(intent) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(intent));
}

export function consumeDoctorSearchIntent() {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}
