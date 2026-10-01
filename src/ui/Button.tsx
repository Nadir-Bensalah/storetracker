import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';

import { minTouchTarget, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  icon?: IconName;
  disabled?: boolean;
  /** Shows a spinner in place of the icon and blocks presses. */
  loading?: boolean;
  accessibilityHint?: string;
  accessibilityLabel?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
  accessibilityHint,
  accessibilityLabel = title,
}: ButtonProps) {
  const { colors } = useTheme();
  const primary = variant === 'primary';
  const background = primary ? colors.accent : colors.surfaceMuted;
  const foreground = primary ? colors.onAccent : colors.textPrimary;
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: inactive, busy: loading }}
      accessibilityHint={accessibilityHint}
      android_ripple={{ color: colors.pressed }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, opacity: disabled ? 0.5 : 1 },
        pressed && Platform.OS === 'ios' && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={foreground} />
        ) : icon ? (
          <Icon name={icon} color={foreground} size={18} />
        ) : null}
        <Text variant="bodyStrong" style={{ color: foreground }} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: minTouchTarget + 8,
    borderRadius: 999,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  pressed: { opacity: 0.75 },
});
