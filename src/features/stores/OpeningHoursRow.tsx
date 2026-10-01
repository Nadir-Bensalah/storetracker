import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutAnimation, Platform, Pressable, StyleSheet, View } from 'react-native';

import { formatTime, weekdayName } from '@/i18n/format';
import { useLocaleTag } from '@/i18n/useLanguage';
import { minTouchTarget, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';
import { useReducedMotion } from '@/ui/useReducedMotion';

import { localTime } from './openingHours';
import type { Store, TimeRange } from './types';

export function OpeningHoursRow({ store, now }: { store: Store; now: Date }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const locale = useLocaleTag();
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const today = localTime(now, store.timeZone).day;

  const describe = (ranges: TimeRange[]) =>
    ranges.length
      ? ranges
          .map((range) => `${formatTime(range.open, locale)} – ${formatTime(range.close, locale)}`)
          .join(', ')
      : t('detail.closedDay');

  const toggle = () => {
    if (!reducedMotion) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((value) => !value);
  };

  return (
    <View>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${t('detail.hours')}, ${t('detail.today')} ${describe(store.hours[today] ?? [])}`}
        accessibilityHint={expanded ? t('detail.hideWeek') : t('detail.showWeek')}
        android_ripple={{ color: colors.pressed }}
        style={styles.summary}
      >
        <Icon name="clock" color={colors.textPrimary} size={18} />
        <View style={styles.text}>
          <Text variant="bodyStrong">{t('detail.hours')}</Text>
          <Text variant="subhead" color="textSecondary">
            {`${t('detail.today')}  ·  ${describe(store.hours[today] ?? [])}`}
          </Text>
        </View>
        <View style={{ transform: [{ rotate: expanded ? '-90deg' : '90deg' }] }}>
          <Icon name="chevron" color={colors.textTertiary} size={13} />
        </View>
      </Pressable>
      {expanded ? (
        <View style={styles.week}>
          {store.hours.map((ranges, day) => {
            const isToday = day === today;
            return (
              <View
                key={day}
                style={styles.day}
                accessible
                accessibilityLabel={`${weekdayName(day, locale)}, ${describe(ranges)}`}
              >
                <Text variant={isToday ? 'bodyStrong' : 'body'} style={styles.dayName}>
                  {weekdayName(day, locale)}
                </Text>
                <Text
                  variant={isToday ? 'bodyStrong' : 'body'}
                  color={ranges.length ? 'textPrimary' : 'textTertiary'}
                  style={styles.dayHours}
                >
                  {describe(ranges)}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: minTouchTarget + 16,
    paddingVertical: spacing.md,
  },
  text: { flex: 1, gap: 2 },
  week: { paddingLeft: 18 + spacing.md, paddingBottom: spacing.md, gap: spacing.sm },
  day: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, flexWrap: 'wrap' },
  dayName: { textTransform: 'capitalize' },
  dayHours: { fontVariant: ['tabular-nums'], textAlign: Platform.select({ default: 'right' }) },
});
