import { formatDistance, formatTime, weekdayName } from './format';

describe('formatDistance', () => {
  it('rounds short distances to 10 m', () => {
    expect(formatDistance(243, 'fr-FR')).toBe('240 m');
  });

  it('never shows 0 m', () => {
    expect(formatDistance(2, 'fr-FR')).toBe('10 m');
  });

  it('switches to kilometres with one decimal under 10 km, localised', () => {
    expect(formatDistance(1530, 'fr-FR')).toBe('1,5 km');
    expect(formatDistance(1530, 'en-GB')).toBe('1.5 km');
  });

  it('drops decimals beyond 10 km', () => {
    expect(formatDistance(23_600, 'en-GB')).toBe('24 km');
  });
});

describe('formatTime', () => {
  it('formats minutes since midnight in 24-hour time', () => {
    expect(formatTime(20 * 60, 'fr-FR')).toBe('20:00');
    expect(formatTime(9 * 60 + 30, 'en-GB')).toBe('09:30');
  });
});

describe('weekdayName', () => {
  it('maps index 0 to Monday', () => {
    expect(weekdayName(0, 'fr-FR')).toBe('lundi');
    expect(weekdayName(6, 'en-GB')).toBe('Sunday');
  });
});
