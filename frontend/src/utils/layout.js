import { setCurrentLayout } from '../router/router.js';
import { authService } from '../services/auth.js';

const LAYOUT_BY_ROLE = {
    admin: 'admin',
    doctor: 'doctor',
    patient: 'patient',
};

export function syncLayoutFromAuth() {
    if (!authService.isAuthenticated()) {
        setCurrentLayout('guest');
        return;
    }

    const user = authService.getUser();
    setCurrentLayout(LAYOUT_BY_ROLE[user?.role] || 'patient');
}
