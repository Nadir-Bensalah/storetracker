import { Image } from 'expo-image';
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { FavoriteButton } from '@/features/favorites/FavoriteButton';
import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Text } from '@/ui/Text';

import { photos } from './data/photos';
import { StatusLine } from './StatusLine';
import type { Store } from './types';
import type { StatusTone } from './useOpeningStatusLabel';

interface NearbyCardProps {
  store: Store;
  width: number;
  status: { label: string; tone: StatusTone };
  distance?: string;
  onPress: (store: Store) => void;
}

export const NearbyCard = memo(function NearbyCard({
  store,
  width,
  status,
  distance,
  onPress,
}: NearbyCardProps) {
  const { colors } = useTheme();
  const photo = store.photos[0];

  return (
    <Animated.View
      entering={FadeIn.duration(260)}
      style={[styles.card, { width, backgroundColor: colors.skeleton }]}
    >
      <Pressable
        onPress={() => onPress(store)}
        accessibilityRole="button"
        accessibilityLabel={[store.name, status.label, distance].filter(Boolean).join(', ')}
        android_ripple={{ color: 'rgba(255,255,255,0.15)', foreground: true }}
        style={({ pressed }) => [
          styles.fill,
          pressed && Platform.OS === 'ios' && { opacity: 0.85 },
        ]}
      >
        {photo ? (
          <Image
            source={photos[photo].thumb}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            accessible={false}
          />
        ) : null}
        <View style={styles.scrim} />
        <View style={styles.text}>
          <Text variant="bodyStrong" color="onScrim" numberOfLines={1}>
            {store.name}
          </Text>
          <Text variant="footnote" color="onScrim" numberOfLines={1} style={styles.secondary}>
            {distance ? `${store.city}  ·  ${distance}` : store.city}
          </Text>
          <StatusLine label={status.label} tone={status.tone} onPhoto />
        </View>
      </Pressable>
      <View style={styles.favorite}>
        <FavoriteButton store={store} color="#FFFFFF" size={20} />
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    aspectRatio: 0.78,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  fill: { flex: 1, justifyContent: 'flex-end' },
  scrim: {
    ...StyleSheet.absoluteFill,
    experimental_backgroundImage: 'linear-gradient(to bottom, transparent 35%, rgba(0,0,0,0.78))',
  },
  text: { padding: spacing.md, gap: 2 },
  secondary: { opacity: 0.85 },
  favorite: { position: 'absolute', top: 0, right: 0 },
});
