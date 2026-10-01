import { Platform } from 'react-native';

import type { Store } from './types';

/** Apple Maps on iOS; on Android a geo: intent lets the user pick their maps app. */
export function directionsUrl(store: Store) {
  const { latitude, longitude } = store.coordinates;
  const label = encodeURIComponent(store.name);
  return Platform.OS === 'ios'
    ? `https://maps.apple.com/?daddr=${latitude},${longitude}&q=${label}`
    : `geo:0,0?q=${latitude},${longitude}(${label})`;
}
