import { notificationsService } from '../../services/notifications.js';
import { renderPagination } from '../../components/pagination.js';
import { renderLoadingSpinner } from '../../components/loading-spinner.js';
import { formatDateTime } from '../../utils/formatters.js';

export function renderNotifications() {
    return `
    <div class="page-title">
        <h1>Notifications</h1>
        <p>View and manage your notifications</p>
    </div>
    <div class="card">
        <div class="card-header">
            <button id="mark-all-read-btn" class="btn btn-sm btn-outline">Mark All as Read</button>
        </div>
        <div id="notifications-list">${renderLoadingSpinner()}</div>
    </div>`;
}

export async function initNotifications() {
    const container = document.getElementById('notifications-list');
    const markAllBtn = document.getElementById('mark-all-read-btn');
    let currentPage = 1;

    async function loadNotifications(page = 1) {
        container.innerHTML = renderLoadingSpinner();
        try {
            const res = await notificationsService.list({ page });
            const items = res?.data || [];
            const meta = res?.meta;

            if (!items.length) {
                container.innerHTML = '<div class="empty-state"><p>No notifications yet.</p></div>';
                return;
            }

            container.innerHTML = `
                <div id="notifications-items">
                    ${items.map(n => `
                        <div class="notification-item" data-id="${n.id}" style="display:flex;align-items:flex-start;gap:1rem;padding:1rem;border-bottom:1px solid var(--color-border-light);${!n.is_read ? 'background:var(--color-primary-light);font-weight:500' : ''}">
                            <div style="flex:1">
                                <div style="display:flex;justify-content:space-between;align-items:center">
                                    <strong>${n.title}</strong>
                                    <span style="font-size:.75rem;color:var(--color-text-secondary)">${formatDateTime(n.created_at)}</span>
                                </div>
                                <p style="margin-top:.25rem;color:var(--color-text-secondary);font-size:.875rem">${n.message || ''}</p>
                            </div>
                            ${!n.is_read ? `<button class="btn btn-sm btn-outline mark-read-btn" data-id="${n.id}">Mark Read</button>` : ''}
                        </div>
                    `).join('')}
                </div>
                ${renderPagination(meta, res?.links, '#/notifications')}
            `;

            bindEvents(page);
        } catch (err) {
            container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
        }
    }

    function bindEvents(page) {
        container.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                try {
                    await notificationsService.markAsRead(btn.dataset.id);
                    await loadNotifications(page);
                } catch (err) { alert(err.message); }
            });
        });

        container.querySelectorAll('.pagination a[href]').forEach(a => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const p = parseInt(new URL(a.href).searchParams.get('page'), 10) || 1;
                currentPage = p;
                loadNotifications(p);
            });
        });
    }

    markAllBtn?.addEventListener('click', async () => {
        try {
            await notificationsService.markAllAsRead();
            await loadNotifications(currentPage);
        } catch (err) { alert(err.message); }
    });

    await loadNotifications(1);
}
