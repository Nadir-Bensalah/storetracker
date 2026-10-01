import { Image } from 'expo-image';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { FavoriteButton } from '@/features/favorites/FavoriteButton';
import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Icon } from '@/ui/Icon';
import { Text } from '@/ui/Text';

import { knownPhotos, photos } from './data/photos';
import { StatusLine } from './StatusLine';
import type { Store } from './types';
import type { StatusTone } from './useOpeningStatusLabel';

export interface StoreRowProps {
  store: Store;
  status: { label: string; tone: StatusTone };
  distance?: string;
  onPress: (store: Store) => void;
}

// Memoised because the list re-renders on every keystroke and every new page;
// each row receives stable props (callbacks from useCallback, a status string
// that only changes once a minute), so only rows whose data changed re-render.
export const StoreRow = memo(function StoreRow({
  store,
  status,
  distance,
  onPress,
}: StoreRowProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const services = store.services.slice(0, 2).map((service) => t(`services.${service}`));
  const photo = knownPhotos(store.photos)[0];

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(180)}
      layout={LinearTransition.duration(240)}
      style={styles.row}
    >
      <Pressable
        onPress={() => onPress(store)}
        accessibilityRole="button"
        accessibilityLabel={[store.name, `${store.street}, ${store.city}`, status.label, distance]
          .filter(Boolean)
          .join(', ')}
        android_ripple={{ color: colors.pressed }}
        style={({ pressed }) => [styles.main, pressed && Platform.OS === 'ios' && { opacity: 0.6 }]}
      >
        {photo ? (
          <Image
            source={photos[photo].thumb}
            style={[styles.thumb, { backgroundColor: colors.skeleton }]}
            contentFit="cover"
            recyclingKey={store.id}
            accessible={false}
          />
        ) : null}
        <View style={styles.text}>
          <Text variant="bodyStrong" numberOfLines={2}>
            {store.name}
          </Text>
          <Text variant="footnote" color="textSecondary" numberOfLines={1}>
            {`${store.street}, ${store.postalCode} ${store.city}`}
          </Text>
          <StatusLine label={status.label} tone={status.tone} distance={distance} />
          <Text variant="footnote" color="textTertiary" numberOfLines={1}>
            {services.join('  ·  ')}
          </Text>
        </View>
        {Platform.OS === 'ios' ? (
          <Icon name="chevron" color={colors.textTertiary} size={13} />
        ) : null}
      </Pressable>
      <FavoriteButton store={store} />
    </Animated.View>
  );
});

export const STORE_ROW_THUMB = 84;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  thumb: {
    width: STORE_ROW_THUMB,
    height: STORE_ROW_THUMB,
    borderRadius: radius.md,
  },
  text: { flex: 1, gap: 3 },
});
