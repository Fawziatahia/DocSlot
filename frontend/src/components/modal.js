export function openModal({ title, body, footer, onClose } = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>${title || ''}</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">${body || ''}</div>
            ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
        </div>`;

    const close = () => overlay.remove();
    overlay.querySelector('.close-btn').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });
    document.body.appendChild(overlay);
    return { overlay, close };
}
