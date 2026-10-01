import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, Platform, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

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
  // iOS animates the SF Symbol itself (bounce); Android gets the same feedback as a scale pop.
  const scale = useSharedValue(1);
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const toggle = () => {
    const selected = !isFavorite;
    dispatch(favoriteToggled(store));
    hapticFeedback(selected);
    if (selected && Platform.OS === 'android') {
      scale.set(withSequence(withTiming(1.25, { duration: 110 }), withSpring(1)));
    }
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
      <Animated.View style={popStyle}>
        <Icon
          name={isFavorite ? 'heartFill' : 'heart'}
          color={isFavorite ? colors.favorite : (color ?? colors.textPrimary)}
          size={size}
          animationSpec={isFavorite ? { effect: { type: 'bounce' } } : undefined}
        />
      </Animated.View>
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
