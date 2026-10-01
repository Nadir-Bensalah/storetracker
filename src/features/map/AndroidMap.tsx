import {
  Camera,
  GeoJSONSource,
  Layer,
  Map as MapLibreMap,
  Marker,
  UserLocation,
} from '@maplibre/maplibre-react-native';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import type { Coordinates, Store } from '@/features/stores/types';
import { useTheme } from '@/theme/useTheme';
import { Icon } from '@/ui/Icon';

// Android has no Google Maps key in this project: the map is MapLibre with
// OpenFreeMap tiles (OpenStreetMap data), which needs no key at all.
// Attribution stays visible, as OpenFreeMap requires.
const styles = {
  light: 'https://tiles.openfreemap.org/styles/liberty',
  dark: 'https://tiles.openfreemap.org/styles/dark',
};

const toLngLat = ({ latitude, longitude }: Coordinates): [number, number] => [longitude, latitude];

/** Degrees of latitude shown vertically, like react-native-maps' latitudeDelta, to a zoom level. */
const spanToZoom = (span: number) => Math.log2(180 / span) - 1;

interface AndroidMapProps {
  stores: Store[];
  center: Coordinates;
  span: number;
  interactive: boolean;
  showsUserLocation: boolean;
  /** When given, the camera frames these points instead of `center`. */
  fitTo?: Coordinates[];
  fitPadding?: { top: number; right: number; bottom: number; left: number };
  path?: [Coordinates, Coordinates];
  selectedId?: string;
  onStorePress?: (store: Store) => void;
  style?: ViewStyle;
}

export function AndroidMap({
  stores,
  center,
  span,
  interactive,
  showsUserLocation,
  fitTo,
  fitPadding,
  path,
  selectedId,
  onStorePress,
  style,
}: AndroidMapProps) {
  const { scheme, colors } = useTheme();

  const bounds = fitTo && fitTo.length > 1 ? boundsOf(fitTo) : undefined;

  return (
    <MapLibreMap
      style={[StyleSheet.absoluteFill, style]}
      mapStyle={styles[scheme]}
      dragPan={interactive}
      touchZoom={interactive}
      doubleTapZoom={interactive}
      touchRotate={false}
      touchPitch={false}
      compass={false}
      scaleBar={false}
      logo={interactive}
      attribution
    >
      {bounds ? (
        <Camera bounds={bounds} padding={fitPadding} duration={400} />
      ) : (
        <Camera initialViewState={{ center: toLngLat(center), zoom: spanToZoom(span) }} />
      )}
      {showsUserLocation ? <UserLocation /> : null}
      {path ? (
        <GeoJSONSource
          id="path"
          data={{
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: path.map(toLngLat) },
          }}
        >
          <Layer
            type="line"
            id="path-line"
            style={{
              lineColor: colors.accentSoft,
              lineWidth: 4,
              lineDasharray: [2, 2],
              lineCap: 'round',
            }}
          />
        </GeoJSONSource>
      ) : null}
      {stores.map((store) => (
        <Marker key={store.id} id={store.id} lngLat={toLngLat(store.coordinates)} anchor="bottom">
          <Pressable
            onPress={onStorePress ? () => onStorePress(store) : undefined}
            accessibilityRole="button"
            accessibilityLabel={`${store.name}, ${store.street}, ${store.city}`}
            hitSlop={8}
          >
            <View
              style={[
                pin.container,
                {
                  backgroundColor: store.id === selectedId ? colors.accentSoft : colors.accent,
                  borderColor: colors.background,
                },
              ]}
            >
              <Icon name="storefront" color={colors.onAccent} size={14} />
            </View>
          </Pressable>
        </Marker>
      ))}
    </MapLibreMap>
  );
}

function boundsOf(points: Coordinates[]): [number, number, number, number] {
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
}

const pin = StyleSheet.create({
  container: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
