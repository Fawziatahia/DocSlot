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
