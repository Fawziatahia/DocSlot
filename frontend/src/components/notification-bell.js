export function renderNotificationBell(count) {
    const displayCount = count > 99 ? '99+' : count;
    return `
    <div class="notification-bell" id="notification-bell">
        🔔
        ${count > 0 ? `<span class="badge-count">${displayCount}</span>` : ''}
    </div>`;
}
