import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { minTouchTarget, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  icon?: IconName;
  disabled?: boolean;
  accessibilityHint?: string;
  accessibilityLabel?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  accessibilityHint,
  accessibilityLabel = title,
}: ButtonProps) {
  const { colors } = useTheme();
  const primary = variant === 'primary';
  const background = primary ? colors.accent : colors.surfaceMuted;
  const foreground = primary ? colors.onAccent : colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      accessibilityHint={accessibilityHint}
      android_ripple={{ color: colors.pressed }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, opacity: disabled ? 0.5 : 1 },
        pressed && Platform.OS === 'ios' && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        {icon ? <Icon name={icon} color={foreground} size={18} /> : null}
        <Text variant="bodyStrong" style={{ color: foreground }}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: minTouchTarget + 8,
    borderRadius: radius.md,
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
