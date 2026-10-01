import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

export default function Screen() {
  const { t } = useTranslation();
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <Stack.Screen options={{ title: t('tabs.stores'), headerLargeTitle: true }} />
    </ScrollView>
  );
}
