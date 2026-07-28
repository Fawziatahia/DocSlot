export function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatTime(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

export function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '';
    const d = new Date(dateTimeString);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function statusBadge(status) {
    const colors = {
        pending: 'warning',
        confirmed: 'info',
        in_progress: 'primary',
        completed: 'success',
        cancelled: 'danger',
        active: 'success',
        inactive: 'secondary',
    };
    const color = colors[status] || 'secondary';
    return `<span class="badge badge-${color}">${capitalize(status.replace(/_/g, ' '))}</span>`;
}
