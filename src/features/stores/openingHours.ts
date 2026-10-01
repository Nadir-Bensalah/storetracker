import type { TimeRange, WeeklyHours } from './types';

export type OpeningStatus =
  | { state: 'open'; closesAt: number; closingSoon: boolean }
  | { state: 'closed'; opensAt: { dayOffset: number; time: number } | null };

const CLOSING_SOON_MINUTES = 45;

const weekdayIndex: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

// Store hours are expressed in the store's own time zone, not the device's:
// a traveller in Montréal must still see whether a Paris store is open now.
export function localTime(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value;
  return {
    day: weekdayIndex[get('weekday') ?? 'Mon'] ?? 0,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

export function getOpeningStatus(hours: WeeklyHours, now: Date, timeZone: string): OpeningStatus {
  const { day, minutes } = localTime(now, timeZone);

  const current = (hours[day] ?? []).find(
    (range) => minutes >= range.open && minutes < range.close,
  );
  if (current) {
    return {
      state: 'open',
      closesAt: current.close,
      closingSoon: current.close - minutes <= CLOSING_SOON_MINUTES,
    };
  }

  for (let offset = 0; offset < 7; offset++) {
    const ranges: TimeRange[] = hours[(day + offset) % 7] ?? [];
    const next = ranges.find((range) => offset > 0 || range.open > minutes);
    if (next) return { state: 'closed', opensAt: { dayOffset: offset, time: next.open } };
  }
  return { state: 'closed', opensAt: null };
}
