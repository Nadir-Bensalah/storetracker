export function formatTime(minutes: number, locale: string) {
  const date = new Date(Date.UTC(2000, 0, 1, Math.floor(minutes / 60), minutes % 60));
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}

// Intl's `unit` style is not used on purpose: on iOS, Hermes delegates it to
// Foundation, which rescales units on its own (240 m became "0,24 km").
export function formatDistance(meters: number, locale: string) {
  if (meters < 1000) {
    const rounded = Math.max(10, Math.round(meters / 10) * 10);
    return `${new Intl.NumberFormat(locale).format(rounded)}\u00a0m`;
  }
  const kilometers = new Intl.NumberFormat(locale, {
    maximumFractionDigits: meters < 10_000 ? 1 : 0,
  }).format(meters / 1000);
  return `${kilometers}\u00a0km`;
}

/** 0 is Monday, matching WeeklyHours. */
export function weekdayName(day: number, locale: string) {
  // 3 January 2000 was a Monday.
  return new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(2000, 0, 3 + day)),
  );
}
