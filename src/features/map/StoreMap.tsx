import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

import type { Coordinates, Store } from '@/features/stores/types';
import { radius, spacing } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Text } from '@/ui/Text';

import { googleDarkStyle } from './googleDarkStyle';

// Without an API key the Google Maps SDK throws when the view is created, so
// the map is replaced by an explicit notice instead of crashing the screen.
const mapsAvailable =
  Platform.OS !== 'android' || Constants.expoConfig?.extra?.hasGoogleMapsKey === true;

interface StoreMapProps {
  stores: Store[];
  center: Coordinates;
  /** Latitude span of the visible region, in degrees. */
  span?: number;
  showsUserLocation?: boolean;
  interactive?: boolean;
  accessibilityLabel: string;
  onStorePress?: (store: Store) => void;
  style?: ViewStyle;
}

export function StoreMap({
  stores,
  center,
  span = 0.02,
  showsUserLocation = false,
  interactive = false,
  accessibilityLabel,
  onStorePress,
  style,
}: StoreMapProps) {
  const { t } = useTranslation();
  const { scheme, colors } = useTheme();

  if (!mapsAvailable) {
    return (
      <View style={[styles.map, styles.notice, { backgroundColor: colors.surfaceMuted }, style]}>
        <Text variant="footnote" color="textSecondary" style={styles.noticeText}>
          {t('stores.mapUnavailable')}
        </Text>
      </View>
    );
  }

  const region: Region = { ...center, latitudeDelta: span, longitudeDelta: span };

  return (
    <View
      style={[styles.map, style]}
      accessible={!interactive}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={interactive ? undefined : 'image'}
    >
      <MapView
        style={StyleSheet.absoluteFill}
        region={region}
        showsUserLocation={showsUserLocation}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        pitchEnabled={false}
        rotateEnabled={false}
        toolbarEnabled={false}
        showsPointsOfInterests={false}
        userInterfaceStyle={scheme}
        customMapStyle={scheme === 'dark' ? googleDarkStyle : undefined}
        importantForAccessibility={interactive ? 'auto' : 'no-hide-descendants'}
      >
        {stores.map((store) => (
          <Marker
            key={store.id}
            coordinate={store.coordinates}
            title={store.name}
            pinColor={colors.accent}
            onCalloutPress={onStorePress ? () => onStorePress(store) : undefined}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 180,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  notice: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  noticeText: { textAlign: 'center' },
});
