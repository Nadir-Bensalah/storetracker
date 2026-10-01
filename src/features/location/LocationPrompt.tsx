import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from 'react-native';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Button } from '@/ui/Button';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';

import { locationRequested } from './locationSlice';

/** Shown in place of location-based content; adapts its message and action to the permission state. */
export function LocationPrompt() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { permission, servicesEnabled, status } = useAppSelector((state) => state.location);

  const request = () => {
    dispatch(locationRequested());
  };
  const openSettings = () => {
    Linking.openSettings();
  };

  let body: string = t('location.promptBody');
  let action = { title: t('location.enable') as string, onPress: request };
  if (permission === 'blocked') {
    body = t('location.blockedBody');
    action = { title: t('location.openSettings'), onPress: openSettings };
  } else if (permission === 'granted' && !servicesEnabled) {
    body = t('location.servicesOffBody');
    action = { title: t('location.openSettings'), onPress: openSettings };
  } else if (permission === 'granted' && status === 'locating') {
    body = t('location.locating');
  } else if (permission === 'granted' && status === 'unavailable') {
    body = t('location.unavailableBody');
    action = { title: t('common.retry'), onPress: request };
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Icon name="location" color={colors.textPrimary} size={18} />
        <Text variant="bodyStrong" style={styles.title}>
          {t('location.promptTitle')}
        </Text>
      </View>
      <Text variant="subhead" color="textSecondary">
        {body}
      </Text>
      {permission === 'granted' && status === 'locating' ? null : (
        <Button title={action.title} variant="secondary" onPress={action.onPress} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1 },
});
