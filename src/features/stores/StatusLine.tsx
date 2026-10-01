import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';
import { Text } from '@/ui/Text';

import type { StatusTone } from './useOpeningStatusLabel';

interface StatusLineProps {
  label: string;
  tone: StatusTone;
  distance?: string;
  onPhoto?: boolean;
}

// The status is carried by the words; the dot only reinforces it, so the
// information never depends on colour alone.
export function StatusLine({ label, tone, distance, onPhoto = false }: StatusLineProps) {
  const { colors } = useTheme();
  const toneColor = onPhoto ? colors.onScrim : colors[tone];
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: onPhoto ? colors[tone] : toneColor }]} />
      <Text variant="subhead" style={[styles.shrink, { color: toneColor }]} numberOfLines={1}>
        {label}
        {distance ? (
          <Text variant="subhead" color={onPhoto ? 'onScrim' : 'textSecondary'}>
            {`  ·  ${distance}`}
          </Text>
        ) : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  shrink: { flexShrink: 1 },
});
