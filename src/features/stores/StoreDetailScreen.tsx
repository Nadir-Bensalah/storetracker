import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  FlatList,
  Linking,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FavoriteButton } from '@/features/favorites/FavoriteButton';
import { selectFavorite } from '@/features/favorites/favoritesSlice';
import { StoreMap } from '@/features/map/StoreMap';
import { formatDistance } from '@/i18n/format';
import { useLocaleTag } from '@/i18n/useLanguage';
import { useAppSelector } from '@/store/hooks';
import { minTouchTarget, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Button } from '@/ui/Button';
import { Icon, type IconName } from '@/ui/Icon';
import { Skeleton, SkeletonGroup } from '@/ui/Skeleton';
import { StateView } from '@/ui/StateView';
import { Text } from '@/ui/Text';
import { useStretchyHeader } from '@/ui/useStretchyHeader';

import { useGetStoreQuery } from './api/storesApi';
import { photos } from './data/photos';
import { directionsUrl } from './directions';
import { distanceInMeters } from './distance';
import { OpeningHoursRow } from './OpeningHoursRow';
import { StatusLine } from './StatusLine';
import type { ServiceId, Store } from './types';
import { useNow } from './useNow';
import { useOpeningStatusLabel } from './useOpeningStatusLabel';

const serviceIcons: Record<ServiceId, IconName> = {
  clickAndCollect: 'bag',
  reserveOnline: 'calendar',
  inStoreReturns: 'return',
  giftCards: 'gift',
  wheelchairAccess: 'accessibility',
};

export function StoreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const favorite = useAppSelector((state) => selectFavorite(state, id));
  const { data, error, isLoading, refetch } = useGetStoreQuery(id);

  // A favorite's snapshot keeps the screen usable offline.
  const store = data ?? favorite;
  const offlineSnapshot = !data && !!favorite && !!error;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: store?.name ?? '',
          headerTransparent: true,
          headerTitle: '',
          headerBackButtonDisplayMode: 'minimal',
          headerTintColor: '#FFFFFF',
          headerRight: store ? () => <HeaderActions store={store} /> : undefined,
        }}
      />
      {store ? (
        <StoreDetail store={store} offlineSnapshot={offlineSnapshot} />
      ) : isLoading ? (
        <DetailSkeleton />
      ) : (
        <View style={styles.centered}>
          <StatusBar style="auto" />
          {error && 'kind' in error && error.kind === 'notFound' ? (
            <StateView
              icon="storefront"
              title={t('detail.notFoundTitle')}
              body={t('detail.notFoundBody')}
            />
          ) : (
            <StateView
              icon="warning"
              title={t('stores.errorTitle')}
              body={t('stores.errorBody')}
              action={{ title: t('common.retry'), onPress: refetch }}
            />
          )}
        </View>
      )}
    </View>
  );
}

function HeaderActions({ store }: { store: Store }) {
  const { t } = useTranslation();
  const share = () =>
    Share.share({
      title: store.name,
      message: `${store.name}\n${store.street}, ${store.postalCode} ${store.city}\nstoretracker://stores/${store.id}`,
    });
  return (
    <View style={styles.headerActions}>
      <Pressable
        onPress={share}
        accessibilityRole="button"
        accessibilityLabel={t('detail.share')}
        style={styles.headerButton}
      >
        <Icon name="share" color="#FFFFFF" size={19} />
      </Pressable>
      <FavoriteButton store={store} color="#FFFFFF" size={21} />
    </View>
  );
}

function StoreDetail({ store, offlineSnapshot }: { store: Store; offlineSnapshot: boolean }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const locale = useLocaleTag();
  const now = useNow();
  const statusLabel = useOpeningStatusLabel();
  const origin = useAppSelector((state) => state.location.coordinates);
  const [photoIndex, setPhotoIndex] = useState(0);

  const status = statusLabel(store, now);
  const distance = origin
    ? formatDistance(distanceInMeters(origin, store.coordinates), locale)
    : undefined;
  const address = `${store.street}, ${store.postalCode} ${store.city}`;
  const photoHeight = Math.round(Math.min(width * 0.8, 420));
  const { onScroll, stretchStyle } = useStretchyHeader(photoHeight);

  const onScrollPhotos = useCallback(
    (event: { nativeEvent: { contentOffset: { x: number } } }) =>
      setPhotoIndex(Math.round(event.nativeEvent.contentOffset.x / width)),
    [width],
  );

  return (
    <>
      <StatusBar style="light" />
      <Animated.ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={{ height: photoHeight }}>
          <Animated.View style={[StyleSheet.absoluteFill, stretchStyle]}>
            <FlatList
              data={store.photos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onScrollPhotos}
              keyExtractor={(photo) => photo}
              renderItem={({ item }) => (
                <Image
                  source={photos[item].full}
                  style={{ width, height: photoHeight }}
                  contentFit="cover"
                  accessible={false}
                />
              )}
            />
            <View style={styles.photoScrim} pointerEvents="none" />
          </Animated.View>
          {store.photos.length > 1 ? (
            <View style={[styles.photoCounter, { backgroundColor: colors.scrim }]}>
              <Text
                variant="caption"
                color="onScrim"
                accessibilityLabel={t('detail.photo', {
                  current: photoIndex + 1,
                  total: store.photos.length,
                })}
              >
                {`${photoIndex + 1} / ${store.photos.length}`}
              </Text>
            </View>
          ) : null}
        </View>

        <Reanimated.View
          entering={FadeInDown.duration(320)}
          style={[styles.sheet, { backgroundColor: colors.background }]}
        >
          <View style={styles.identity}>
            <Text variant="title" accessibilityRole="header">
              {store.name}
            </Text>
            <Text variant="subhead" color="textSecondary">
              {address}
            </Text>
            <StatusLine label={status.label} tone={status.tone} distance={distance} />
          </View>

          <View style={styles.actions}>
            <View style={styles.action}>
              <Button
                title={t('detail.directions')}
                icon="directions"
                variant="secondary"
                onPress={() => Linking.openURL(directionsUrl(store))}
              />
            </View>
            <View style={styles.action}>
              <Button
                title={t('detail.call')}
                icon="phone"
                onPress={() => Linking.openURL(`tel:${store.phone.replace(/\s/g, '')}`)}
              />
            </View>
          </View>

          {offlineSnapshot ? (
            <Text variant="footnote" color="textSecondary">
              {t('detail.offlineSnapshot')}
            </Text>
          ) : null}

          <View
            style={styles.services}
            accessible
            accessibilityLabel={`${t('detail.services')}: ${store.services.map((s) => t(`services.${s}`)).join(', ')}`}
          >
            {store.services.map((service) => (
              <View key={service} style={styles.service}>
                <Icon name={serviceIcons[service]} color={colors.textSecondary} size={16} />
                <Text variant="footnote" color="textSecondary">
                  {t(`services.${service}`)}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => router.push(`/store-map/${store.id}`)}
            accessibilityRole="button"
            accessibilityLabel={t('detail.openMap', { address })}
          >
            <StoreMap
              stores={[store]}
              center={store.coordinates}
              span={0.008}
              accessibilityLabel={t('detail.mapLabel', { address })}
            />
          </Pressable>

          <View style={[styles.rows, { borderColor: colors.separator }]}>
            <OpeningHoursRow store={store} now={now} />
            {store.transit ? (
              <InfoRow
                icon="transit"
                title={t('detail.access')}
                value={t(`transit.${store.transit.mode}`, { station: store.transit.station })}
              />
            ) : null}
            <InfoRow
              icon="phone"
              title={t('detail.contact')}
              value={store.phone}
              onPress={() => Linking.openURL(`tel:${store.phone.replace(/\s/g, '')}`)}
            />
          </View>
        </Reanimated.View>
      </Animated.ScrollView>
    </>
  );
}

function InfoRow({
  icon,
  title,
  value,
  onPress,
}: {
  icon: IconName;
  title: string;
  value: string;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const content = (
    <>
      <Icon name={icon} color={colors.textPrimary} size={18} />
      <View style={styles.infoText}>
        <Text variant="bodyStrong">{title}</Text>
        <Text variant="subhead" color="textSecondary">
          {value}
        </Text>
      </View>
      {onPress && Platform.OS === 'ios' ? (
        <Icon name="chevron" color={colors.textTertiary} size={13} />
      ) : null}
    </>
  );
  return onPress ? (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${value}`}
      android_ripple={{ color: colors.pressed }}
      style={styles.infoRow}
    >
      {content}
    </Pressable>
  ) : (
    <View style={styles.infoRow} accessible accessibilityLabel={`${title}, ${value}`}>
      {content}
    </View>
  );
}

function DetailSkeleton() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  return (
    <SkeletonGroup label={t('common.loading')}>
      <Skeleton height={Math.round(Math.min(width * 0.8, 420))} style={{ borderRadius: 0 }} />
      <View style={[styles.sheet, { gap: spacing.md }]}>
        <Skeleton width="75%" height={30} />
        <Skeleton width="90%" height={15} />
        <Skeleton width="50%" height={15} />
        <Skeleton height={180} style={{ borderRadius: radius.lg }} />
        <Skeleton height={60} />
        <Skeleton height={60} />
      </View>
    </SkeletonGroup>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  headerButton: {
    width: minTouchTarget,
    height: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoScrim: {
    ...StyleSheet.absoluteFill,
    experimental_backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.45), transparent 35%)',
  },
  photoCounter: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl + spacing.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
  },
  sheet: {
    marginTop: -spacing.xl,
    borderTopLeftRadius: radius.lg + 6,
    borderTopRightRadius: radius.lg + 6,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },
  identity: { gap: spacing.xs },
  services: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.lg, rowGap: spacing.sm },
  service: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  rows: { borderTopWidth: StyleSheet.hairlineWidth },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: minTouchTarget + 16,
    paddingVertical: spacing.md,
  },
  infoText: { flex: 1, gap: 2 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  action: { flexGrow: 1, flexBasis: 150 },
});
