import { skipToken } from '@reduxjs/toolkit/query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { selectFavorite } from '@/features/favorites/favoritesSlice';
import {
  selectListedStore,
  useGetNearbyStoresQuery,
  useGetStoreQuery,
} from '@/features/stores/api/storesApi';
import { distanceInMeters } from '@/features/stores/distance';
import { directionsUrl } from '@/features/stores/directions';
import type { Store } from '@/features/stores/types';
import { formatDistance } from '@/i18n/format';
import { useLocaleTag } from '@/i18n/useLanguage';
import { useAppSelector } from '@/store/hooks';
import { minTouchTarget, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Button } from '@/ui/Button';
import { GlassPanel } from '@/ui/GlassPanel';
import { Text } from '@/ui/Text';

import { AndroidMap } from './AndroidMap';

// Rough urban estimates from the straight-line distance, labelled as such:
// streets add about 30 %, walking 80 m per minute, driving about 25 km/h in town.
const DETOUR_FACTOR = 1.3;
const WALKING_METERS_PER_MINUTE = 80;
const DRIVING_METERS_PER_MINUTE = 25_000 / 60;

/** Full-screen map: one store with the path from the user, or the nearby stores. */
export function StoreMapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { scheme, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const locale = useLocaleTag();
  const mapRef = useRef<MapView>(null);
  const origin = useAppSelector((state) => state.location.coordinates);
  const nearbyMode = id === 'nearby';
  const [selected, setSelected] = useState<Store | null>(null);

  const favorite = useAppSelector((state) => selectFavorite(state, id));
  const listed = useAppSelector((state) => selectListedStore(state, id));
  const single = useGetStoreQuery(id, { skip: nearbyMode });
  const nearby = useGetNearbyStoresQuery(origin && nearbyMode ? origin : skipToken);
  const store = nearbyMode ? undefined : (single.data ?? listed ?? favorite);
  const stores: Store[] = nearbyMode ? (nearby.data ?? []) : store ? [store] : [];

  useEffect(() => {
    const points = [...stores.map((item) => item.coordinates), ...(origin ? [origin] : [])];
    if (points.length < 2 || Platform.OS !== 'ios') return;
    // Let the sheet finish presenting before framing the points.
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(points, {
        edgePadding: { top: 140, right: 60, bottom: 300, left: 60 },
        animated: true,
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- framed once per set of ids
  }, [stores.map((item) => item.id).join(','), origin]);

  const title = nearbyMode ? t('stores.nearby') : (store?.name ?? '');
  const openDetail = (item: Store) => {
    router.back();
    // The detail is pushed in the tab's stack once this modal has started closing.
    setTimeout(() => router.push(`/stores/${item.id}`), 50);
  };
  const focused = nearbyMode ? selected : store;
  const focusedDistance = focused && origin ? distanceInMeters(origin, focused.coordinates) : null;
  const center = store?.coordinates ?? origin ?? { latitude: 48.8566, longitude: 2.3522 };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title,
          headerTransparent: true,
          headerBlurEffect: 'none',
          headerShadowVisible: false,
          headerRight: () => (
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              hitSlop={8}
              style={styles.close}
            >
              <Text variant="bodyStrong">{t('common.close')}</Text>
            </Pressable>
          ),
        }}
      />
      {Platform.OS === 'android' ? (
        <AndroidMap
          stores={stores}
          center={center}
          span={0.02}
          interactive
          showsUserLocation
          fitTo={[...stores.map((item) => item.coordinates), ...(origin ? [origin] : [])]}
          fitPadding={{ top: insets.top + 140, right: 60, bottom: 300, left: 60 }}
          path={store && origin ? [origin, store.coordinates] : undefined}
          selectedId={focused?.id}
          onStorePress={nearbyMode ? setSelected : undefined}
        />
      ) : (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{ ...center, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
          showsUserLocation
          showsCompass={false}
          userInterfaceStyle={scheme}
          mapPadding={{ top: insets.top + 56, right: 0, bottom: 0, left: 0 }}
        >
          {stores.map((item) => (
            <Marker
              key={item.id}
              coordinate={item.coordinates}
              title={item.name}
              description={`${item.street}, ${item.city}`}
              pinColor={colors.accent}
              onPress={() => setSelected(item)}
              onCalloutPress={() => openDetail(item)}
            />
          ))}
          {store && origin ? (
            <Polyline
              coordinates={[origin, store.coordinates]}
              strokeColor={colors.accentSoft}
              strokeWidth={4}
              lineDashPattern={[8, 8]}
            />
          ) : null}
        </MapView>
      )}
      <GlassPanel style={[styles.panel, { paddingBottom: insets.bottom + spacing.lg }]}>
        {focused ? (
          <>
            <Text variant="headline">{focused.name}</Text>
            <Text variant="subhead" color="textSecondary">
              {`${focused.street}, ${focused.postalCode} ${focused.city}`}
            </Text>
            {focusedDistance !== null ? (
              <View style={styles.estimates}>
                <Text variant="subhead">
                  {t('map.driving', {
                    distance: formatDistance(focusedDistance * DETOUR_FACTOR, locale),
                    minutes: Math.max(
                      1,
                      Math.round((focusedDistance * DETOUR_FACTOR) / DRIVING_METERS_PER_MINUTE),
                    ),
                  })}
                </Text>
                <Text variant="subhead" color="textSecondary">
                  {t('map.estimate', {
                    distance: formatDistance(focusedDistance, locale),
                    minutes: Math.max(
                      1,
                      Math.round((focusedDistance * DETOUR_FACTOR) / WALKING_METERS_PER_MINUTE),
                    ),
                  })}
                </Text>
              </View>
            ) : (
              <Text variant="subhead" color="textSecondary">
                {t('map.noLocation')}
              </Text>
            )}
            <View style={styles.actions}>
              {nearbyMode ? (
                <View style={styles.action}>
                  <Button
                    title={t('map.openDetail')}
                    icon="storefront"
                    variant="secondary"
                    onPress={() => openDetail(focused)}
                  />
                </View>
              ) : null}
              <View style={styles.action}>
                <Button
                  title={t(Platform.OS === 'ios' ? 'map.openInAppleMaps' : 'map.openInMaps')}
                  icon="directions"
                  onPress={() => Linking.openURL(directionsUrl(focused))}
                />
              </View>
            </View>
          </>
        ) : (
          <>
            <Text variant="headline">{t('stores.nearby')}</Text>
            <Text variant="subhead" color="textSecondary">
              {t('map.nearbyCount', { count: stores.length })}
            </Text>
            <Text variant="footnote" color="textTertiary">
              {t('map.tapMarker')}
            </Text>
          </>
        )}
      </GlassPanel>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'flex-end' },
  close: { minHeight: minTouchTarget, justifyContent: 'center', paddingHorizontal: spacing.md },
  panel: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.sm,
    borderTopLeftRadius: radius.lg + 10,
    borderTopRightRadius: radius.lg + 10,
    overflow: 'hidden',
  },
  estimates: { gap: spacing.xxs, marginBottom: spacing.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  action: { flexGrow: 1, flexBasis: 140 },
});
