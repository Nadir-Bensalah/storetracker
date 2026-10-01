import { router, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { minTouchTarget, spacing } from '@/theme/tokens';
import { Text } from '@/ui/Text';

export default function SettingsLayout() {
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t('settings.title'),
          headerRight: () => (
            <Pressable
              onPress={() => router.dismiss()}
              accessibilityRole="button"
              hitSlop={8}
              style={styles.close}
            >
              <Text variant="bodyStrong">{t('common.close')}</Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="developer" options={{ title: t('about.developerTitle') }} />
      <Stack.Screen name="apps" options={{ title: t('about.appsTitle') }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  close: { minHeight: minTouchTarget, justifyContent: 'center', paddingHorizontal: spacing.md },
});
