import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { type Palette, typography } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Variant = keyof typeof typography;
type ColorToken = {
  [K in keyof Palette]: K extends
    `text${string}` | 'onScrim' | 'onAccent' | 'success' | 'warning' | 'danger' | 'accentSoft'
    ? K
    : never;
}[keyof Palette];

export interface TextProps extends RNTextProps {
  variant?: Variant;
  color?: ColorToken;
}

export function Text({ variant = 'body', color = 'textPrimary', style, ...props }: TextProps) {
  const { colors } = useTheme();
  return <RNText style={[typography[variant], { color: colors[color] }, style]} {...props} />;
}
