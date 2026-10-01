import { mockServerConfig } from '@/features/stores/api/mockServer';
import { initI18n } from '@/i18n';

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// In-memory MMKV: the native module (Nitro) does not exist under Jest.
jest.mock('react-native-mmkv', () => ({
  createMMKV: () => {
    const values = new Map<string, string | number | boolean>();
    return {
      getString: (key: string) => values.get(key) as string | undefined,
      set: (key: string, value: string | number | boolean) => values.set(key, value),
      remove: (key: string) => values.delete(key),
      clearAll: () => values.clear(),
    };
  },
}));

jest.mock('expo-router', () => {
  const { View } = require('react-native');
  return {
    router: { push: jest.fn(), back: jest.fn(), navigate: jest.fn() },
    Stack: { Screen: () => null },
    useLocalSearchParams: jest.fn(() => ({})),
    Link: View,
  };
});

jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  const MapView = (props: object) => <View testID="map" {...props} />;
  return { __esModule: true, default: MapView, Marker: () => null };
});

jest.mock('expo-symbols', () => ({ SymbolView: () => null }));

jest.mock('expo-location', () => ({
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied', UNDETERMINED: 'undetermined' },
  Accuracy: { Balanced: 3 },
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(async () => true),
  getLastKnownPositionAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

// A fixed clock (Thursday 1 October 2026, 10:00 in Paris): opening statuses no
// longer depend on when the tests run, and no minute tick fires mid-test.
jest.mock('@/features/stores/useNow', () => ({
  useNow: () => new Date('2026-10-01T10:00:00+02:00'),
}));

// Tests run with Reduce Motion on: the skeleton pulse would otherwise keep
// scheduling animation frames after a test ends.
jest.mock('@/ui/useReducedMotion', () => ({ useReducedMotion: () => true }));

mockServerConfig.latencyMs = 0;
initI18n('fr');
