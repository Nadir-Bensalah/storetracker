import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import Reanimated, { type AnimatedStyle, FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LocationPrompt } from '@/features/location/LocationPrompt';
import { StoreMap } from '@/features/map/StoreMap';
import type { Coordinates, Store } from '@/features/stores/types';
import { minTouchTarget, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Icon } from '@/ui/Icon';
import { OfflineBanner } from '@/ui/OfflineBanner';
import { Skeleton, SkeletonGroup } from '@/ui/Skeleton';
import { Text } from '@/ui/Text';

import { NearbyCard } from './NearbyCard';
import type { StatusTone } from './useOpeningStatusLabel';

const heroPhoto = require('../../../assets/images/onboarding-street.webp');

export const HERO_HEIGHT = 300;

interface StoresHeaderProps {
  origin: Coordinates | null;
  nearby: { stores: Store[] | undefined; loading: boolean };
  describe: (store: Store) => { status: { label: string; tone: StatusTone }; distance?: string };
  listTitle: string;
  listCount: string | null;
  sortControl: React.ReactNode;
  heroStretchStyle?: AnimatedStyle<ViewStyle>;
}

export function StoresHeader({
  origin,
  nearby,
  describe,
  listTitle,
  listCount,
  sortControl,
  heroStretchStyle,
}: StoresHeaderProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(220, Math.max(150, width * 0.42));

  const renderNearby = useCallback(
    ({ item }: { item: Store }) => (
      <NearbyCard store={item} width={cardWidth} tab="stores" {...describe(item)} />
    ),
    [cardWidth, describe],
  );

  return (
    <View style={styles.container}>
      <View style={{ minHeight: HERO_HEIGHT + insets.top }}>
        <Image
          source={heroPhoto}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          accessible={false}
        />
        <View style={styles.heroScrim} />
        <View style={[styles.heroContent, { paddingTop: insets.top + spacing.sm }]}>
          <View style={styles.topBar}>
            <View accessible accessibilityRole="header">
              <Text variant="headline" color="onScrim" style={styles.wordmark}>
                Store
                <Text variant="headline" color="onScrim" style={styles.wordmarkLight}>
                  Tracker
                </Text>
              </Text>
              <Text variant="overline" color="onScrim" style={styles.context}>
                {t('stores.context')}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/settings')}
              accessibilityRole="button"
              accessibilityLabel={t('common.settings')}
              style={[styles.settings, { backgroundColor: colors.surfaceElevated }]}
            >
              <Icon name="settings" color={colors.textPrimary} size={20} />
            </Pressable>
          </View>
          <View style={styles.heroText}>
            <Text
              variant="display"
              color="onScrim"
              style={styles.heroTitle}
              accessibilityRole="header"
            >
              {t('stores.heroTitle')}
            </Text>
            <Text variant="subhead" color="onScrim" style={styles.heroSubtitle}>
              {t('stores.heroSubtitle')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.searchWrapper}>
        <Pressable
          onPress={() => router.push('/stores/search')}
          accessibilityRole="button"
          accessibilityLabel={t('stores.searchLabel')}
          style={({ pressed }) => [
            styles.searchField,
            { backgroundColor: colors.surfaceElevated },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Icon name="search" color={colors.textSecondary} size={18} />
          <Text color="textTertiary" numberOfLines={1}>
            {t('stores.searchPlaceholder')}
          </Text>
        </Pressable>
      </View>

      <OfflineBanner />

      {origin ? (
        <Reanimated.View
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(160)}
          style={styles.section}
        >
          <View style={styles.padded}>
            <Pressable
              onPress={() => router.push('/store-map/nearby')}
              accessibilityRole="button"
              accessibilityLabel={t('stores.mapLabel')}
              accessibilityHint={t('stores.mapHint')}
            >
              <StoreMap
                stores={nearby.stores ?? []}
                center={origin}
                span={0.03}
                showsUserLocation
                accessibilityLabel={t('stores.mapLabel')}
              />
            </Pressable>
          </View>
          <SectionTitle
            title={t('stores.nearby')}
            count={nearby.stores ? t('stores.count', { count: nearby.stores.length }) : null}
          />
          {nearby.loading ? (
            <SkeletonGroup label={t('common.loading')}>
              <View style={[styles.padded, styles.nearbySkeleton]}>
                <Skeleton width={cardWidth} height={cardWidth / 0.78} />
                <Skeleton width={cardWidth} height={cardWidth / 0.78} />
              </View>
            </SkeletonGroup>
          ) : nearby.stores?.length ? (
            <FlatList
              horizontal
              data={nearby.stores}
              renderItem={renderNearby}
              keyExtractor={keyExtractor}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.nearbyList}
              snapToInterval={cardWidth + spacing.md}
              decelerationRate="fast"
            />
          ) : (
            <Text variant="subhead" color="textSecondary" style={styles.padded}>
              {t('stores.nearbyEmpty')}
            </Text>
          )}
        </Reanimated.View>
      ) : (
        <Reanimated.View
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(160)}
          style={styles.section}
        >
          <LocationPrompt />
        </Reanimated.View>
      )}

      <SectionTitle title={listTitle} count={listCount} trailing={sortControl} />
    </View>
  );
}

const keyExtractor = (store: Store) => store.id;

function SectionTitle({
  title,
  count,
  trailing,
}: {
  title: string;
  count: string | null;
  trailing?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionTitle}>
      <View style={styles.sectionTitleText}>
        <Text variant="title" accessibilityRole="header">
          {title}
        </Text>
        {count ? (
          <Text variant="subhead" color="textSecondary">
            {count}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: spacing.xs },
  heroScrim: {
    ...StyleSheet.absoluteFill,
    experimental_backgroundImage:
      'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.6))',
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + spacing.lg,
    justifyContent: 'space-between',
  },
  topBar: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  wordmark: { fontWeight: '700' },
  wordmarkLight: { fontWeight: '400' },
  context: { opacity: 0.9, fontSize: 10, letterSpacing: 2.4 },
  settings: {
    width: minTouchTarget,
    height: minTouchTarget,
    borderRadius: minTouchTarget / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { gap: spacing.xs },
  heroTitle: { fontSize: 40, lineHeight: 44 },
  heroSubtitle: { opacity: 0.92, maxWidth: 360 },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: minTouchTarget + 6,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
  searchWrapper: {
    marginTop: -(minTouchTarget / 2 + spacing.md),
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  section: { gap: spacing.md, marginBottom: spacing.xl },
  padded: { paddingHorizontal: spacing.lg },
  nearbyList: { paddingHorizontal: spacing.lg, gap: spacing.md },
  nearbySkeleton: { flexDirection: 'row', gap: spacing.md, overflow: 'hidden' },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  sectionTitleText: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
});
