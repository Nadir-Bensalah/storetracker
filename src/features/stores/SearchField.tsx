import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { minTouchTarget, radius, spacing, typography } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Icon } from '@/ui/Icon';

interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function SearchField({ value, onChangeText }: SearchFieldProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={[styles.field, { backgroundColor: colors.surfaceElevated }]}>
      <Icon name="search" color={colors.textSecondary} size={18} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={t('stores.searchPlaceholder')}
        placeholderTextColor={colors.textTertiary}
        accessibilityLabel={t('stores.searchLabel')}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        // iOS draws its own native clear button; Android gets an explicit one below.
        clearButtonMode="while-editing"
        enterKeyHint="search"
        style={[styles.input, typography.body, { color: colors.textPrimary }]}
      />
      {Platform.OS === 'android' && value ? (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel={t('stores.clearSearch')}
          style={styles.clear}
        >
          <Icon name="close" color={colors.textSecondary} size={18} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: minTouchTarget + 6,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    borderRadius: radius.lg,
  },
  input: { flex: 1, paddingVertical: spacing.md },
  clear: {
    width: minTouchTarget,
    height: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
