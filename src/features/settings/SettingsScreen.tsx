import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { languageNames, languages } from '@/i18n/resources';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { minTouchTarget, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { ChoiceList } from '@/ui/ChoiceList';
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

  const appearanceLabels: Record<AppearancePreference, string> = {
    system: t('settings.appearanceSystem'),
    light: t('settings.appearanceLight'),
    dark: t('settings.appearanceDark'),
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.header}>
        <Text variant="title" accessibilityRole="header">
          {t('settings.title')}
        </Text>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          hitSlop={8}
          style={styles.close}
        >
          <Text variant="bodyStrong">{t('common.close')}</Text>
        </Pressable>
      </View>

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

      <Section title={t('settings.about')}>
        <Text variant="subhead" color="textSecondary">
          {t('settings.aboutBody')}
        </Text>
        <Text variant="footnote" color="textTertiary">
          {t('settings.version', { version: Constants.expoConfig?.version ?? '' })}
        </Text>
      </Section>

      {__DEV__ ? (
        <Section title={t('settings.developer')}>
          <Pressable
            onPress={() => dispatch(onboardingReset())}
            accessibilityRole="button"
            style={styles.devAction}
          >
            <Text color="danger">{t('settings.resetOnboarding')}</Text>
          </Pressable>
        </Section>
      ) : null}
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="overline" color="textSecondary" accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  close: {
    minHeight: minTouchTarget,
    justifyContent: 'center',
  },
  section: { gap: spacing.sm },
  devAction: { minHeight: minTouchTarget, justifyContent: 'center' },
});
