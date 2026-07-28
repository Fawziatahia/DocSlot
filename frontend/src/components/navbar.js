export function renderNavbar(user) {
    return `
    <nav class="navbar">
        <div class="navbar-brand">DocSlot</div>
        <div class="navbar-menu">
            <a href="#/dashboard" class="nav-link">Dashboard</a>
            <a href="#/appointments" class="nav-link">Appointments</a>
            <a href="#/doctors" class="nav-link">Doctors</a>
        </div>
        <div class="navbar-end">
            <span style="font-size:.8125rem;color:var(--color-text-secondary);margin-right:.75rem;">${user?.name || ''}</span>
            <button id="logout-btn" class="btn btn-sm btn-outline">Logout</button>
        </div>
    </nav>`;
}
