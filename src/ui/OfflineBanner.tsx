import { useNetInfo } from '@react-native-community/netinfo';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { Icon } from './Icon';
import { Text } from './Text';

/** Only rendered while the device is offline. */
export function OfflineBanner() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isConnected } = useNetInfo();
  if (isConnected !== false) return null;

  return (
    <View
      style={[styles.banner, { backgroundColor: colors.surfaceMuted }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Icon name="wifiOff" color={colors.textSecondary} size={15} />
      <Text variant="footnote" color="textSecondary">
        {t('offline.banner')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.lg,
  },
});
