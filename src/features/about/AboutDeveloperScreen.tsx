import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { Group, Section } from '@/features/settings/SettingsScreen';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { ListRow } from '@/ui/ListRow';
import { Text } from '@/ui/Text';

import { developer } from './developer';

// Web pages open in the in-app system browser (SFSafariViewController,
// Chrome Custom Tabs): the user keeps the browser's own address bar and security UI.
const openPage = (url: string) => WebBrowser.openBrowserAsync(url);

export function AboutDeveloperScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { apps, email, linkedInUrl, gitHubUrl, websiteUrl, publishedAppsCount } = developer;

  const links = [
    apps.length > 0 && { title: t('about.apps'), onPress: () => router.push('/settings/apps') },
    linkedInUrl && { title: 'LinkedIn', onPress: () => openPage(linkedInUrl) },
    gitHubUrl && { title: 'GitHub', onPress: () => openPage(gitHubUrl) },
    websiteUrl && { title: t('about.website'), onPress: () => openPage(websiteUrl) },
    email && {
      title: t('about.contact'),
      value: email,
      onPress: () => Linking.openURL(`mailto:${email}`),
    },
  ].filter((link) => !!link);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.identity}>
        <View
          style={[styles.monogram, { backgroundColor: colors.accent }]}
          accessible={false}
          importantForAccessibility="no"
        >
          <Text variant="title" color="onAccent">
            {developer.initials}
          </Text>
        </View>
        <View style={styles.identityText}>
          <Text variant="title" accessibilityRole="header">
            {developer.name}
          </Text>
          <Text color="textSecondary">{t('about.role')}</Text>
        </View>
      </View>

      <Group>
        <ListRow first title={t('about.publishedApps')} value={String(publishedAppsCount)} />
        <View style={[styles.stacked, { borderTopColor: colors.separator }]}>
          <Text variant="footnote" color="textSecondary">
            {t('about.stackLabel')}
          </Text>
          <Text>{t('about.stack')}</Text>
        </View>
      </Group>

      <Text variant="subhead" color="textSecondary">
        {t('about.thisProject')}
      </Text>

      {links.length > 0 ? (
        <Section title={t('about.links')}>
          <Group>
            {links.map((link, index) => (
              <ListRow key={link.title} first={index === 0} {...link} />
            ))}
          </Group>
        </Section>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.xl },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  stacked: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xxs,
  },
  identityText: { flex: 1, gap: spacing.xxs },
  monogram: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
