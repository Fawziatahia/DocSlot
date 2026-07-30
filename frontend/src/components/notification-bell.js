import { icon } from './icons.js';

export function renderNotificationBell(count) {
    const displayCount = count > 99 ? '99+' : count;
    return `
    <div class="notification-bell" id="notification-bell">
        ${icon('bell', { size: 20 })}
        ${count > 0 ? `<span class="badge-count">${displayCount}</span>` : ''}
    </div>`;
}
