const doctorLayout = `
<div class="layout-doctor">
    <nav class="navbar">
        <div class="navbar-brand">DocSlot — Doctor</div>
        <div class="navbar-menu">
            <a href="#/dashboard" class="nav-link">Dashboard</a>
            <a href="#/appointments/manage" class="nav-link">Appointments</a>
            <a href="#/doctor/schedule" class="nav-link">Schedule</a>
        </div>
        <div class="navbar-end">
            <button id="logout-btn" class="btn btn-sm btn-outline">Logout</button>
        </div>
    </nav>
    <div class="layout-body">
        <aside class="sidebar">
            <ul class="sidebar-menu">
                <li><a href="#/dashboard"><span class="icon">📊</span> Dashboard</a></li>
                <li><a href="#/appointments"><span class="icon">📅</span> Appointments</a></li>
                <li><a href="#/doctor/schedule"><span class="icon">📋</span> Schedule</a></li>
                <li><a href="#/doctor/profile"><span class="icon">👤</span> My Profile</a></li>
            </ul>
        </aside>
        <main class="main-content">
            <slot/>
        </main>
    </div>
</div>
`;

export default doctorLayout;
