import { StyleSheet, View } from 'react-native';

import { Text } from '@/ui/Text';

export function Wordmark({ tagline, onPhoto = false }: { tagline: string; onPhoto?: boolean }) {
  return (
    <View accessible accessibilityRole="header" accessibilityLabel={`StoreTracker. ${tagline}`}>
      <Text variant="headline" color={onPhoto ? 'onScrim' : 'textPrimary'} style={styles.name}>
        Store
        <Text variant="headline" color={onPhoto ? 'onScrim' : 'textSecondary'} style={styles.light}>
          Tracker
        </Text>
      </Text>
      <Text variant="overline" color={onPhoto ? 'onScrim' : 'textSecondary'}>
        {tagline}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  light: { fontSize: 24, lineHeight: 30, fontWeight: '400' },
});
