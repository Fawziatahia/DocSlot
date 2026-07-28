const patientLayout = `
<div class="layout-patient">
    <nav class="navbar">
        <div class="navbar-brand">DocSlot</div>
        <div class="navbar-menu">
            <a href="#/dashboard" class="nav-link">Dashboard</a>
            <a href="#/appointments" class="nav-link">Appointments</a>
            <a href="#/appointments/book" class="nav-link">Book Appointment</a>
            <a href="#/prescriptions" class="nav-link">Prescriptions</a>
        </div>
        <div class="navbar-end">
            <button id="logout-btn" class="btn btn-sm btn-outline">Logout</button>
        </div>
    </nav>
    <div class="layout-body">
        <aside class="sidebar">
            <ul class="sidebar-menu">
                <li><a href="#/dashboard"><span class="icon">📊</span> Dashboard</a></li>
                <li><a href="#/appointments"><span class="icon">📅</span> My Appointments</a></li>
                <li><a href="#/appointments/book"><span class="icon">➕</span> Book Appointment</a></li>
                <li><a href="#/prescriptions"><span class="icon">💊</span> Prescriptions</a></li>
            </ul>
        </aside>
        <main class="main-content">
            <slot/>
        </main>
    </div>
</div>
`;

export default patientLayout;
