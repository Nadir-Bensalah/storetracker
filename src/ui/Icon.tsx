import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';

// One name per concept, mapped to SF Symbols on iOS and Material Symbols on Android.
const symbols = {
  location: { ios: 'location.fill', android: 'near_me' },
  clock: { ios: 'clock', android: 'schedule' },
  map: { ios: 'map', android: 'map' },
  lock: { ios: 'lock.fill', android: 'lock' },
  check: { ios: 'checkmark', android: 'check' },
  chevron: { ios: 'chevron.right', android: 'chevron_right' },
  close: { ios: 'xmark', android: 'close' },
  settings: { ios: 'gearshape', android: 'settings' },
  search: { ios: 'magnifyingglass', android: 'search' },
  heart: { ios: 'heart', android: 'favorite' },
  heartFill: { ios: 'heart.fill', android: 'favorite' },
  share: { ios: 'square.and.arrow.up', android: 'share' },
  phone: { ios: 'phone.fill', android: 'call' },
  directions: { ios: 'arrow.triangle.turn.up.right.diamond.fill', android: 'directions' },
  transit: { ios: 'tram.fill', android: 'train' },
  bag: { ios: 'bag', android: 'shopping_bag' },
  return: { ios: 'arrow.uturn.backward', android: 'undo' },
  calendar: { ios: 'calendar', android: 'event' },
  accessibility: { ios: 'figure.roll', android: 'accessible' },
  gift: { ios: 'gift', android: 'redeem' },
  wifiOff: { ios: 'wifi.slash', android: 'wifi_off' },
  warning: { ios: 'exclamationmark.triangle', android: 'warning' },
  storefront: { ios: 'storefront', android: 'storefront' },
  sort: { ios: 'arrow.up.arrow.down', android: 'sort' },
} satisfies Record<string, Extract<SymbolViewProps['name'], object>>;

export type IconName = keyof typeof symbols;

interface IconProps {
  name: IconName;
  color: ColorValue;
  size?: number;
  animationSpec?: SymbolViewProps['animationSpec'];
}

export function Icon({ name, color, size = 20, animationSpec }: IconProps) {
  return (
    <SymbolView
      name={symbols[name]}
      tintColor={color}
      size={size}
      animationSpec={animationSpec}
      accessible={false}
      importantForAccessibility="no"
    />
  );
}
