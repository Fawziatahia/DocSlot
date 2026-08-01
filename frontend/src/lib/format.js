export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(amount || 0);
}

export function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(value)
  );
}

export function formatTime(value) {
  if (!value) return "";
  const [hours, minutes] = value.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes));
  return new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true }).format(date);
}

export function formatRelativeTime(value) {
  if (!value) return "";
  const diffSec = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  const diffWeek = Math.round(diffDay / 7);
  if (diffWeek < 5) return `${diffWeek}w ago`;
  return formatDate(value);
}

export function slotDurationMinutes(start, end) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

export function statusBadgeClass(status) {
  const map = {
    pending: "bg-warning-subtle text-warning-emphasis",
    confirmed: "bg-info-subtle text-info-emphasis",
    in_progress: "bg-primary-subtle text-primary-emphasis",
    completed: "bg-success-subtle text-success-emphasis",
    cancelled: "bg-danger-subtle text-danger-emphasis",
    active: "bg-success-subtle text-success-emphasis",
    suspended: "bg-danger-subtle text-danger-emphasis",
  };
  return map[status] || "bg-secondary-subtle text-secondary-emphasis";
}
