import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { minTouchTarget, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { Icon } from './Icon';
import { Text } from './Text';

interface ListRowProps {
  title: string;
  value?: string;
  onPress?: () => void;
  accessibilityHint?: string;
  first?: boolean;
}

/** A settings-style row: title, optional value, chevron on iOS when it navigates. */
export function ListRow({ title, value, onPress, accessibilityHint, first = false }: ListRowProps) {
  const { colors } = useTheme();
  const border = first
    ? null
    : { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator };
  const content = (
    <>
      <Text style={styles.title}>{title}</Text>
      {value ? (
        <Text color="textSecondary" style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {onPress && Platform.OS === 'ios' ? (
        <Icon name="chevron" color={colors.textTertiary} size={13} />
      ) : null}
    </>
  );

  if (!onPress) {
    return (
      <View
        style={[styles.row, border]}
        accessible
        accessibilityLabel={value ? `${title}, ${value}` : title}
      >
        {content}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      android_ripple={{ color: colors.pressed }}
      style={({ pressed }) => [
        styles.row,
        border,
        pressed && Platform.OS === 'ios' && { backgroundColor: colors.pressed },
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: { flex: 1 },
  value: { flexShrink: 1, textAlign: 'right' },
});
