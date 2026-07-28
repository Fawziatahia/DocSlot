const adminLayout = `
<div class="layout-admin">
    <nav class="navbar">
        <div class="navbar-brand">DocSlot — Admin</div>
        <div class="navbar-menu">
            <a href="#/admin/users" class="nav-link">Users</a>
            <a href="#/admin/departments" class="nav-link">Departments</a>
            <a href="#/admin/specializations" class="nav-link">Specializations</a>
            <a href="#/admin/settings" class="nav-link">Settings</a>
        </div>
        <div class="navbar-end">
            <button id="logout-btn" class="btn btn-sm btn-outline">Logout</button>
        </div>
    </nav>
    <div class="layout-body">
        <aside class="sidebar">
            <ul class="sidebar-menu">
                <li><a href="#/admin/users"><span class="icon">👥</span> Users</a></li>
                <li><a href="#/admin/departments"><span class="icon">🏢</span> Departments</a></li>
                <li><a href="#/admin/specializations"><span class="icon">🔬</span> Specializations</a></li>
                <li><a href="#/admin/settings"><span class="icon">⚙️</span> Settings</a></li>
            </ul>
        </aside>
        <main class="main-content">
            <slot/>
        </main>
    </div>
</div>
`;

export default adminLayout;
