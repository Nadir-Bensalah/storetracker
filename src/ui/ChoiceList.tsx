import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { minTouchTarget, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { Icon } from './Icon';
import { Text } from './Text';

interface Choice<T extends string> {
  value: T;
  label: string;
}

interface ChoiceListProps<T extends string> {
  label: string;
  choices: readonly Choice<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

// A single-choice list: trailing checkmark on iOS, leading radio on Android,
// following each platform's settings conventions.
export function ChoiceList<T extends string>({
  label,
  choices,
  selected,
  onSelect,
}: ChoiceListProps<T>) {
  const { colors } = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={label}
      style={[styles.group, { backgroundColor: colors.surface }]}
    >
      {choices.map((choice, index) => {
        const checked = choice.value === selected;
        return (
          <Pressable
            key={choice.value}
            onPress={() => onSelect(choice.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked }}
            android_ripple={{ color: colors.pressed }}
            style={({ pressed }) => [
              styles.row,
              index > 0 && {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.separator,
              },
              pressed && Platform.OS === 'ios' && { backgroundColor: colors.pressed },
            ]}
          >
            {Platform.OS === 'android' ? (
              <View
                style={[
                  styles.radio,
                  { borderColor: checked ? colors.accent : colors.textTertiary },
                ]}
              >
                {checked ? (
                  <View style={[styles.radioDot, { backgroundColor: colors.accent }]} />
                ) : null}
              </View>
            ) : null}
            <Text style={styles.label}>{choice.label}</Text>
            {Platform.OS === 'ios' && checked ? (
              <Icon name="check" color={colors.accent} size={17} />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  row: {
    minHeight: minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  label: { flex: 1 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
});
