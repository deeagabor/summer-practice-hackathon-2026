export function formatEventTime(isoDate: string): string {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric"
  }).format(new Date(isoDate));
}

export function formatPrice(cents?: number): string {
  if (!cents) {
    return "Free";
  }

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(cents / 100);
}
