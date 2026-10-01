import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';

import type { Coordinates, Store } from '@/features/stores/types';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { AndroidMap } from './AndroidMap';

// iOS: Apple Maps through react-native-maps, no key needed.
// Android: Google Maps would need an API key this project deliberately does
// not ship, so the map is MapLibre with OpenStreetMap data (see AndroidMap).
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
  const { scheme, colors } = useTheme();

  return (
    <View
      style={[styles.map, style]}
      accessible={!interactive}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={interactive ? undefined : 'image'}
      importantForAccessibility={interactive ? 'auto' : 'no-hide-descendants'}
    >
      {Platform.OS === 'android' ? (
        <AndroidMap
          stores={stores}
          center={center}
          span={span}
          interactive={interactive}
          showsUserLocation={showsUserLocation}
          onStorePress={onStorePress}
        />
      ) : (
        <MapView
          style={StyleSheet.absoluteFill}
          region={{ ...center, latitudeDelta: span, longitudeDelta: span } satisfies Region}
          showsUserLocation={showsUserLocation}
          scrollEnabled={interactive}
          zoomEnabled={interactive}
          pitchEnabled={false}
          rotateEnabled={false}
          showsPointsOfInterests={false}
          userInterfaceStyle={scheme}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 180,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
});
