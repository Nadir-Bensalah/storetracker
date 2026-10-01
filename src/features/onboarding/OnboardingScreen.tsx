import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { languageNames, languages } from '@/i18n/resources';
import { locationRequested } from '@/features/location/locationSlice';
import { languageChanged, onboardingCompleted } from '@/features/settings/preferencesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Button } from '@/ui/Button';
import { ChoiceList } from '@/ui/ChoiceList';
import { Icon, type IconName } from '@/ui/Icon';
import { Text } from '@/ui/Text';

import { Wordmark } from './Wordmark';

const streetPhoto = require('../../../assets/images/onboarding.webp');

export function OnboardingScreen() {
  const [step, setStep] = useState<'language' | 'location'>('language');
  return step === 'language' ? (
    <LanguageStep onContinue={() => setStep('location')} />
  ) : (
    <LocationStep />
  );
}

function LanguageStep({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.preferences.language);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.languageContent,
        { paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <StatusBar style="light" />
      <View style={{ height: Math.max(260, height * 0.48) }}>
        <Image
          source={streetPhoto}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          accessible={false}
        />
        <View style={styles.topScrim} />
        <View style={[styles.photoFade, fade(colors.background)]} />
        <View style={[styles.wordmarkOnPhoto, { top: insets.top + spacing.lg }]}>
          <Wordmark tagline={t('onboarding.tagline')} onPhoto />
        </View>
      </View>
      <View style={styles.panel}>
        <View style={styles.block}>
          <Text variant="display" accessibilityRole="header">
            {t('onboarding.languageTitle')}
          </Text>
          <Text color="textSecondary">{t('onboarding.languageBody')}</Text>
        </View>
        <ChoiceList
          label={t('settings.language')}
          choices={languages.map((value) => ({ value, label: languageNames[value] }))}
          selected={language}
          onSelect={(value) => dispatch(languageChanged(value))}
        />
        <Button title={t('common.continue')} onPress={onContinue} />
        <Text variant="footnote" color="textTertiary" style={styles.center}>
          {t('onboarding.step', { current: 1, total: 2 })}
        </Text>
      </View>
    </ScrollView>
  );
}

const fade = (to: string) => ({
  experimental_backgroundImage: `linear-gradient(to bottom, transparent, ${to})`,
});

function LocationStep() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const finish = () => dispatch(onboardingCompleted());
  const allow = async () => {
    await dispatch(locationRequested());
    finish();
  };

  const features: { icon: IconName; title: string; body: string }[] = [
    {
      icon: 'location',
      title: t('onboarding.locationNearby'),
      body: t('onboarding.locationNearbyBody'),
    },
    {
      icon: 'clock',
      title: t('onboarding.locationHours'),
      body: t('onboarding.locationHoursBody'),
    },
    { icon: 'map', title: t('onboarding.locationRoute'), body: t('onboarding.locationRouteBody') },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <Wordmark tagline={t('onboarding.tagline')} />
      <View style={styles.block}>
        <Text variant="display" accessibilityRole="header">
          {t('onboarding.locationTitle')}
        </Text>
        <Text color="textSecondary">{t('onboarding.locationBody')}</Text>
      </View>
      <View style={styles.features}>
        {features.map((feature) => (
          <View key={feature.icon} style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: colors.surfaceMuted }]}>
              <Icon name={feature.icon} color={colors.textPrimary} size={20} />
            </View>
            <View style={styles.featureText}>
              <Text variant="bodyStrong">{feature.title}</Text>
              <Text variant="subhead" color="textSecondary">
                {feature.body}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.actions}>
        <Button title={t('onboarding.allowLocation')} icon="location" onPress={allow} />
        <Button title={t('common.later')} variant="secondary" onPress={finish} />
      </View>
      <View style={styles.privacy}>
        <Icon name="lock" color={colors.textTertiary} size={14} />
        <Text variant="footnote" color="textTertiary" style={styles.privacyText}>
          {t('onboarding.privacy')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  languageContent: { flexGrow: 1 },
  topScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    experimental_backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)',
  },
  photoFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 96 },
  wordmarkOnPhoto: { position: 'absolute', left: spacing.xl },
  panel: { flexGrow: 1, paddingHorizontal: spacing.xl, gap: spacing.xl },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    gap: spacing.xl,
  },
  block: { gap: spacing.sm },
  center: { textAlign: 'center' },
  features: { gap: spacing.lg },
  feature: { flexDirection: 'row', gap: spacing.lg, alignItems: 'flex-start' },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1, gap: spacing.xxs },
  actions: { gap: spacing.md, marginTop: 'auto' },
  privacy: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  privacyText: { flex: 1 },
});
