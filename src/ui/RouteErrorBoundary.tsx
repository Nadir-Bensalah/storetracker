import type { ErrorBoundaryProps } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

import { StateView } from './StateView';

// Exported as `ErrorBoundary` from a route file, Expo Router renders this in
// place of a screen whose render threw. In a release build an uncaught render
// error otherwise terminates the whole app.
export function RouteErrorBoundary({ retry }: ErrorBoundaryProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
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
