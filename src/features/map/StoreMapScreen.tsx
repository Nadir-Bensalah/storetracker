import Constants from 'expo-constants';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { selectFavorite } from '@/features/favorites/favoritesSlice';
import { useGetStoreQuery } from '@/features/stores/api/storesApi';
import { distanceInMeters } from '@/features/stores/distance';
import { directionsUrl } from '@/features/stores/directions';
import { formatDistance } from '@/i18n/format';
import { useLocaleTag } from '@/i18n/useLanguage';
import { useAppSelector } from '@/store/hooks';
import { minTouchTarget, radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Button } from '@/ui/Button';
import { Text } from '@/ui/Text';

import { googleDarkStyle } from './googleDarkStyle';

const mapsAvailable =
  Platform.OS !== 'android' || Constants.expoConfig?.extra?.hasGoogleMapsKey === true;

// Average walking speed, with a 1.3 detour factor between straight line and streets.
const WALKING_METERS_PER_MINUTE = 80;
const DETOUR_FACTOR = 1.3;

/** Full-screen map of one store, with the straight path from the user's position. */
export function StoreMapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { scheme, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const locale = useLocaleTag();
  const mapRef = useRef<MapView>(null);
  const origin = useAppSelector((state) => state.location.coordinates);
  const favorite = useAppSelector((state) => selectFavorite(state, id));
  const { data } = useGetStoreQuery(id);
  const store = data ?? favorite;

  useEffect(() => {
    if (!store || !origin) return;
    // Let the sheet finish presenting before framing both points.
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates([origin, store.coordinates], {
        edgePadding: { top: 80, right: 60, bottom: 260, left: 60 },
        animated: true,
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [store, origin]);

  const close = (
    <Pressable
      onPress={() => router.back()}
      accessibilityRole="button"
      hitSlop={8}
      style={styles.close}
    >
      <Text variant="bodyStrong">{t('common.close')}</Text>
    </Pressable>
  );

  if (!store) return <Stack.Screen options={{ title: '', headerRight: () => close }} />;

  const distance = origin ? distanceInMeters(origin, store.coordinates) : null;
  const walkingMinutes = distance
    ? Math.max(1, Math.round((distance * DETOUR_FACTOR) / WALKING_METERS_PER_MINUTE))
    : null;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: store.name, headerRight: () => close }} />
      {mapsAvailable ? (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{ ...store.coordinates, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
          showsUserLocation
          showsCompass
          userInterfaceStyle={scheme}
          customMapStyle={scheme === 'dark' ? googleDarkStyle : undefined}
        >
          <Marker coordinate={store.coordinates} title={store.name} pinColor={colors.accent} />
          {origin ? (
            <Polyline
              coordinates={[origin, store.coordinates]}
              strokeColor={colors.accentSoft}
              strokeWidth={4}
              lineDashPattern={[8, 8]}
            />
          ) : null}
        </MapView>
      ) : (
        <View style={styles.notice}>
          <Text variant="subhead" color="textSecondary" style={styles.center}>
            {t('stores.mapUnavailable')}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.panel,
          { backgroundColor: colors.surfaceElevated, marginBottom: insets.bottom + spacing.lg },
        ]}
      >
        <Text variant="headline">{store.name}</Text>
        <Text variant="subhead" color="textSecondary">
          {`${store.street}, ${store.postalCode} ${store.city}`}
        </Text>
        {distance !== null && walkingMinutes !== null ? (
          <Text variant="subhead">
            {t('map.estimate', {
              distance: formatDistance(distance, locale),
              minutes: walkingMinutes,
            })}
          </Text>
        ) : (
          <Text variant="subhead" color="textSecondary">
            {t('map.noLocation')}
          </Text>
        )}
        <Button
          title={t(Platform.OS === 'ios' ? 'map.openInAppleMaps' : 'map.openInMaps')}
          icon="directions"
          onPress={() => Linking.openURL(directionsUrl(store))}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'flex-end' },
  close: { minHeight: minTouchTarget, justifyContent: 'center' },
  notice: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  center: { textAlign: 'center' },
  panel: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
});
