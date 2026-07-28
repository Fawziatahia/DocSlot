export function renderSidebar(links) {
    const items = links.map(l => `
        <li><a href="${l.href}"><span class="icon">${l.icon || ''}</span> ${l.label}</a></li>
    `).join('');

    return `
    <aside class="sidebar">
        <ul class="sidebar-menu">${items}</ul>
    </aside>`;
}
