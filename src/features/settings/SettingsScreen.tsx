import * as Application from 'expo-application';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, ScrollView, StyleSheet, Switch, View } from 'react-native';

import type { LocationPermission } from '@/features/location/locationSlice';
import { locationRequested } from '@/features/location/locationSlice';
import { mockServerConfig } from '@/features/stores/api/mockServer';
import { languageNames, languages } from '@/i18n/resources';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { minTouchTarget, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { ChoiceList } from '@/ui/ChoiceList';
import { ListRow } from '@/ui/ListRow';
import { Text } from '@/ui/Text';

import {
  type AppearancePreference,
  appearanceChanged,
  languageChanged,
  onboardingReset,
} from './preferencesSlice';

const appearances: AppearancePreference[] = ['system', 'light', 'dark'];

export function SettingsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { language, appearance } = useAppSelector((state) => state.preferences);
  const { permission, servicesEnabled } = useAppSelector((state) => state.location);
  const [apiFailing, setApiFailing] = useState(mockServerConfig.errorRate >= 1);

  const appearanceLabels: Record<AppearancePreference, string> = {
    system: t('settings.appearanceSystem'),
    light: t('settings.appearanceLight'),
    dark: t('settings.appearanceDark'),
  };
  const permissionLabels: Record<LocationPermission, string> = {
    unknown: t('location.statusUnknown'),
    granted: t('location.statusGranted'),
    denied: t('location.statusDenied'),
    blocked: t('location.statusBlocked'),
  };
  const locationStatus =
    permission === 'granted' && !servicesEnabled
      ? t('location.statusServicesOff')
      : permissionLabels[permission];

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Section title={t('settings.language')}>
        <ChoiceList
          label={t('settings.language')}
          choices={languages.map((value) => ({ value, label: languageNames[value] }))}
          selected={language}
          onSelect={(value) => dispatch(languageChanged(value))}
        />
      </Section>

      <Section title={t('settings.appearance')}>
        <ChoiceList
          label={t('settings.appearance')}
          choices={appearances.map((value) => ({ value, label: appearanceLabels[value] }))}
          selected={appearance}
          onSelect={(value) => dispatch(appearanceChanged(value))}
        />
      </Section>

      <Section title={t('settings.location')}>
        <Group>
          <ListRow first title={t('settings.locationAccess')} value={locationStatus} />
          {permission === 'unknown' ? (
            <ListRow title={t('location.enable')} onPress={() => dispatch(locationRequested())} />
          ) : (
            <ListRow title={t('location.openSettings')} onPress={() => Linking.openSettings()} />
          )}
        </Group>
      </Section>

      <Section title={t('settings.about')}>
        <Text variant="subhead" color="textSecondary">
          {t('settings.aboutBody')}
        </Text>
        <Group>
          <ListRow
            first
            title={t('settings.version')}
            value={`${Application.nativeApplicationVersion ?? ''} (${Application.nativeBuildVersion ?? ''})`}
          />
          <ListRow
            title={t('settings.platform')}
            value={`${Platform.OS === 'ios' ? 'iOS' : 'Android'} ${Platform.Version}`}
          />
          <ListRow
            title={t('about.developerTitle')}
            onPress={() => router.push('/settings/developer')}
          />
        </Group>
      </Section>

      {__DEV__ ? (
        <Section title={t('settings.developer')}>
          <Group>
            <View style={styles.devRow}>
              <Text style={styles.devLabel}>{t('settings.simulateFailure')}</Text>
              <Switch
                value={apiFailing}
                onValueChange={(failing) => {
                  mockServerConfig.errorRate = failing ? 1 : 0;
                  setApiFailing(failing);
                }}
                accessibilityLabel={t('settings.simulateFailure')}
                testID="simulate-api-failure"
              />
            </View>
            <ListRow
              title={t('settings.resetOnboarding')}
              onPress={() => dispatch(onboardingReset())}
            />
          </Group>
        </Section>
      ) : null}
    </ScrollView>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="overline" color="textSecondary" accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

export function Group({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <View style={[styles.group, { backgroundColor: colors.surface }]}>{children}</View>;
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.xl },
  section: { gap: spacing.sm },
  group: { borderRadius: radius.md, overflow: 'hidden' },
  devRow: {
    minHeight: minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  devLabel: { flex: 1 },
});
