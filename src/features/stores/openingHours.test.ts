import { week } from './data/brands';
import { getOpeningStatus } from './openingHours';

const PARIS = 'Europe/Paris';
// Thursday 1 October 2026; Paris is UTC+2 in October.
const parisTime = (day: number, time: string) => new Date(`2026-10-0${day}T${time}:00+02:00`);

const hours = week(
  '09:30-12:30, 14:00-19:00',
  '09:30-12:30, 14:00-19:00',
  '09:30-12:30, 14:00-19:00',
  '09:30-12:30, 14:00-19:00',
  '09:30-12:30, 14:00-19:00',
  '10:00-20:00',
  'closed',
);

describe('getOpeningStatus', () => {
  it('is open inside a range and reports the closing time', () => {
    expect(getOpeningStatus(hours, parisTime(1, '10:15'), PARIS)).toEqual({
      state: 'open',
      closesAt: 12 * 60 + 30,
      closingSoon: false,
    });
  });

  it('flags the last 45 minutes before closing', () => {
    expect(getOpeningStatus(hours, parisTime(1, '18:20'), PARIS)).toMatchObject({
      state: 'open',
      closingSoon: true,
    });
  });

  it('treats the lunch break as closed and points to the afternoon opening', () => {
    expect(getOpeningStatus(hours, parisTime(1, '13:00'), PARIS)).toEqual({
      state: 'closed',
      opensAt: { dayOffset: 0, time: 14 * 60 },
    });
  });

  it('considers the closing minute as closed', () => {
    expect(getOpeningStatus(hours, parisTime(1, '19:00'), PARIS)).toEqual({
      state: 'closed',
      opensAt: { dayOffset: 1, time: 9 * 60 + 30 },
    });
  });

  it('skips closed days: Sunday points to Monday', () => {
    // Sunday 4 October 2026.
    expect(getOpeningStatus(hours, parisTime(4, '11:00'), PARIS)).toEqual({
      state: 'closed',
      opensAt: { dayOffset: 1, time: 9 * 60 + 30 },
    });
  });

  it('uses the store time zone, not the device one', () => {
    // 10:15 in Paris is 04:15 in New York: still open for a Paris store.
    const date = new Date('2026-10-01T08:15:00Z');
    expect(getOpeningStatus(hours, date, PARIS).state).toBe('open');
  });

  it('reports no opening for a store that never opens', () => {
    const never = week('closed', 'closed', 'closed', 'closed', 'closed', 'closed', 'closed');
    expect(getOpeningStatus(never, parisTime(1, '10:00'), PARIS)).toEqual({
      state: 'closed',
      opensAt: null,
    });
  });
});
