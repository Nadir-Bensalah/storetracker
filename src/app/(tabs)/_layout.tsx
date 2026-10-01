import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/theme/useTheme';

// Only the tab tint is customised: the bar itself keeps the system material
// (Liquid Glass on iOS 26+, Material 3 navigation bar on Android).
export default function TabsLayout() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <NativeTabs tintColor={colors.accent} indicatorColor={colors.surfaceMuted}>
      <NativeTabs.Trigger name="stores">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'storefront', selected: 'storefront.fill' }}
          md="storefront"
        />
        <NativeTabs.Trigger.Label>{t('tabs.stores')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="favorites">
        <NativeTabs.Trigger.Icon sf={{ default: 'heart', selected: 'heart.fill' }} md="favorite" />
        <NativeTabs.Trigger.Label>{t('tabs.favorites')}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
