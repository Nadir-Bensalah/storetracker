import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { Group } from '@/features/settings/SettingsScreen';
import { useAppSelector } from '@/store/hooks';
import { spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { ListRow } from '@/ui/ListRow';
import { Text } from '@/ui/Text';

import { developer } from './developer';

export function PublishedAppsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const language = useAppSelector((state) => state.preferences.language);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      {developer.apps.map((app) => (
        <View key={app.name} style={styles.app}>
          <Text variant="bodyStrong" accessibilityRole="header">
            {app.name}
          </Text>
          {app.description ? (
            <Text variant="subhead" color="textSecondary">
              {app.description[language]}
            </Text>
          ) : null}
          <Group>
            {app.appStoreUrl ? (
              <ListRow first title="App Store" onPress={() => Linking.openURL(app.appStoreUrl!)} />
            ) : null}
            {app.playStoreUrl ? (
              <ListRow
                first={!app.appStoreUrl}
                title="Google Play"
                onPress={() => Linking.openURL(app.playStoreUrl!)}
              />
            ) : null}
          </Group>
        </View>
      ))}
      <Text variant="footnote" color="textTertiary">
        {t('about.storeLinksNote')}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.xl },
  app: { gap: spacing.sm },
});
