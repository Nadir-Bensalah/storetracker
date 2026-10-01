import { Platform } from 'react-native';

const light = {
  background: '#F7F4EF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#EEEAE3',
  textPrimary: '#15171C',
  textSecondary: '#5E5A55',
  textTertiary: '#8A857E',
  separator: 'rgba(21, 23, 28, 0.12)',
  accent: '#15171C',
  onAccent: '#F7F4EF',
  accentSoft: '#8C6E52',
  success: '#1F7A3D',
  warning: '#9A5B00',
  danger: '#B3261E',
  favorite: '#C8372D',
  skeleton: '#E7E2DA',
  scrim: 'rgba(12, 12, 14, 0.55)',
  onScrim: '#FFFFFF',
  pressed: 'rgba(21, 23, 28, 0.06)',
};

export type Palette = typeof light;

const dark: Palette = {
  background: '#101113',
  surface: '#17181B',
  surfaceElevated: '#1F2024',
  surfaceMuted: '#26272B',
  textPrimary: '#F2EEE8',
  textSecondary: '#AEA9A1',
  textTertiary: '#7F7B75',
  separator: 'rgba(242, 238, 232, 0.12)',
  accent: '#F2EEE8',
  onAccent: '#15171C',
  accentSoft: '#C9A884',
  success: '#6CCB8B',
  warning: '#F0B35A',
  danger: '#FF8A80',
  favorite: '#FF6B5E',
  skeleton: '#26272B',
  scrim: 'rgba(0, 0, 0, 0.6)',
  onScrim: '#FFFFFF',
  pressed: 'rgba(242, 238, 232, 0.08)',
};

export const palettes = { light, dark };

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
};

export const minTouchTarget = Platform.select({ android: 48, default: 44 });

const serif = 'Newsreader16pt-Medium';

// Sizes follow the iOS text styles; RN scales them with the user's font size
// setting on both platforms (allowFontScaling is on by default).
export const typography = {
  display: { fontFamily: serif, fontSize: 34, lineHeight: 38 },
  title: { fontFamily: serif, fontSize: 28, lineHeight: 32 },
  headline: { fontSize: 20, lineHeight: 25, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 22 },
  bodyStrong: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  subhead: { fontSize: 15, lineHeight: 20 },
  footnote: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16 },
  overline: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 2,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
} as const;
