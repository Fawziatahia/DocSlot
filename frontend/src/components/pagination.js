export function renderPagination(meta, links, baseHash) {
    if (!meta || meta.last_page <= 1) return '';

    const current = meta.current_page;
    const last = meta.last_page;
    let html = '<div class="pagination">';

    // Prev
    html += links?.prev
        ? `<a href="${baseHash}?page=${current - 1}">&laquo;</a>`
        : `<a class="disabled">&laquo;</a>`;

    for (let i = 1; i <= last; i++) {
        html += i === current
            ? `<a class="active">${i}</a>`
            : `<a href="${baseHash}?page=${i}">${i}</a>`;
    }

    // Next
    html += links?.next
        ? `<a href="${baseHash}?page=${current + 1}">&raquo;</a>`
        : `<a class="disabled">&raquo;</a>`;

    html += '</div>';
    return html;
}
