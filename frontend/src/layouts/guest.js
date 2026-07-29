const guestLayout = `
<div class="layout-guest">
    <nav class="guest-nav">
        <div class="guest-nav-inner">
            <a href="/" class="guest-brand">DocSlot</a>
            <div class="guest-nav-links">
                <a href="/login" class="nav-link">Sign In</a>
                <a href="/register" class="btn btn-primary btn-sm">Get Started</a>
            </div>
        </div>
    </nav>
    <main class="guest-main">
        <slot/>
    </main>
</div>
`;

export default guestLayout;
