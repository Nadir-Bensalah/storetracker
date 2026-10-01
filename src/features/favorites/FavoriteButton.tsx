import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, Platform, Pressable, StyleSheet } from 'react-native';

import type { Store } from '@/features/stores/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { minTouchTarget } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Icon } from '@/ui/Icon';

import { favoriteToggled, selectIsFavorite } from './favoritesSlice';

function hapticFeedback(selected: boolean) {
  if (Platform.OS === 'android') {
    Haptics.performAndroidHapticsAsync(
      selected ? Haptics.AndroidHaptics.Toggle_On : Haptics.AndroidHaptics.Toggle_Off,
    );
  } else {
    Haptics.impactAsync(
      selected ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Soft,
    );
  }
}

interface FavoriteButtonProps {
  store: Store;
  size?: number;
  color?: string;
}

export function FavoriteButton({ store, size = 22, color }: FavoriteButtonProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const isFavorite = useAppSelector((state) => selectIsFavorite(state, store.id));

  const toggle = () => {
    const selected = !isFavorite;
    dispatch(favoriteToggled(store));
    hapticFeedback(selected);
    AccessibilityInfo.announceForAccessibility(
      t(selected ? 'detail.addedToFavorites' : 'detail.removedFromFavorites', { name: store.name }),
    );
  };

  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel={t(isFavorite ? 'detail.removeFavorite' : 'detail.addFavorite')}
      accessibilityState={{ selected: isFavorite }}
      hitSlop={8}
      android_ripple={{ color: colors.pressed, borderless: true, radius: minTouchTarget / 2 }}
      style={styles.button}
    >
      <Icon
        name={isFavorite ? 'heartFill' : 'heart'}
        color={isFavorite ? colors.favorite : (color ?? colors.textPrimary)}
        size={size}
        animationSpec={isFavorite ? { effect: { type: 'bounce' } } : undefined}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: minTouchTarget,
    height: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
