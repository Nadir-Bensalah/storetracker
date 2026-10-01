import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LocationPrompt } from '@/features/location/LocationPrompt';
import { StoreMap } from '@/features/map/StoreMap';
import type { Coordinates, Store } from '@/features/stores/types';
import { minTouchTarget, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Icon } from '@/ui/Icon';
import { OfflineBanner } from '@/ui/OfflineBanner';
import { Skeleton, SkeletonGroup } from '@/ui/Skeleton';
import { Text } from '@/ui/Text';

import { NearbyCard } from './NearbyCard';
import { SearchField } from './SearchField';
import type { StatusTone } from './useOpeningStatusLabel';

const heroPhoto = require('../../../assets/images/onboarding.webp');

export const HERO_HEIGHT = 300;

interface StoresHeaderProps {
  search: string;
  onSearchChange: (text: string) => void;
  searching: boolean;
  origin: Coordinates | null;
  nearby: { stores: Store[] | undefined; loading: boolean };
  describe: (store: Store) => { status: { label: string; tone: StatusTone }; distance?: string };
  onOpenStore: (store: Store) => void;
  listTitle: string;
  listCount: string | null;
  sortControl: React.ReactNode;
}

export function StoresHeader({
  search,
  onSearchChange,
  searching,
  origin,
  nearby,
  describe,
  onOpenStore,
  listTitle,
  listCount,
  sortControl,
}: StoresHeaderProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(220, Math.max(150, width * 0.42));

  const renderNearby = useCallback(
    ({ item }: { item: Store }) => (
      <NearbyCard store={item} width={cardWidth} onPress={onOpenStore} {...describe(item)} />
    ),
    [cardWidth, onOpenStore, describe],
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
        <SearchField value={search} onChangeText={onSearchChange} />
      </View>

      <OfflineBanner />

      {searching ? null : origin ? (
        <View style={styles.section}>
          <View style={styles.padded}>
            <StoreMap
              stores={nearby.stores ?? []}
              center={origin}
              span={0.03}
              showsUserLocation
              accessibilityLabel={t('stores.mapLabel')}
            />
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
        </View>
      ) : (
        <View style={styles.section}>
          <LocationPrompt />
        </View>
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
