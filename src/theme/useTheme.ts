import { useColorScheme } from 'react-native';

import { palettes } from './tokens';

// The user preference (system / light / dark) is applied natively through
// Appearance.setColorScheme, so useColorScheme already reflects it here and
// native views (tab bar, sheets, maps, alerts) follow the same scheme.
export function useTheme() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { scheme, colors: palettes[scheme] } as const;
}
