import type { ErrorBoundaryProps } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { storage } from '@/store/storage';
import { useTheme } from '@/theme/useTheme';

import { StateView } from './StateView';

// Exported as `ErrorBoundary` from a route file, Expo Router renders this in
// place of a screen whose render threw. In a release build an uncaught render
// error otherwise terminates the whole app.
export function RouteErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  // Kept on the device so a release build's failure can still be read back
  // (Documents/mmkv, key `lastRouteError`) instead of being lost.
  useEffect(() => {
    storage.set(
      'lastRouteError',
      `${new Date().toISOString()} ${error.message}\n${error.stack ?? ''}`,
    );
  }, [error]);
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <StateView
        icon="warning"
        title={t('errors.screenTitle')}
        body={t('errors.screenBody')}
        action={{ title: t('common.retry'), onPress: () => void retry() }}
      />
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1, justifyContent: 'center' } });
