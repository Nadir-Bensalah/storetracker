import { useTranslation } from 'react-i18next';

import { formatTime, weekdayName } from '@/i18n/format';
import { useLocaleTag } from '@/i18n/useLanguage';

import { getOpeningStatus, localTime } from './openingHours';
import type { Store } from './types';

export type StatusTone = 'success' | 'warning' | 'danger';

export function useOpeningStatusLabel() {
  const { t } = useTranslation();
  const locale = useLocaleTag();

  return (
    store: Pick<Store, 'hours' | 'timeZone'>,
    now: Date,
  ): { label: string; tone: StatusTone } => {
    const status = getOpeningStatus(store.hours, now, store.timeZone);
    if (status.state === 'open') {
      const time = formatTime(status.closesAt, locale);
      return status.closingSoon
        ? { label: t('status.closingSoon', { time }), tone: 'warning' }
        : { label: t('status.openUntil', { time }), tone: 'success' };
    }
    if (!status.opensAt) return { label: t('status.closed'), tone: 'danger' };
    const time = formatTime(status.opensAt.time, locale);
    const { dayOffset } = status.opensAt;
    if (dayOffset === 0) return { label: t('status.opensToday', { time }), tone: 'danger' };
    if (dayOffset === 1) return { label: t('status.opensTomorrow', { time }), tone: 'danger' };
    const day = weekdayName((localTime(now, store.timeZone).day + dayOffset) % 7, locale);
    return { label: t('status.opensOn', { day, time }), tone: 'danger' };
  };
}
